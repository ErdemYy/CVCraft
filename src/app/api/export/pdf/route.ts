import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 60;

const DOWNLOAD_COOKIE = "cv_pdf_download";
const DOWNLOAD_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{12,128}$/;

const BROWSER_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean) as string[];

function getLocalBrowserExecutablePath() {
  return BROWSER_PATHS.find((browserPath) => existsSync(browserPath));
}

async function getBrowserLaunchOptions() {
  const localExecutablePath = getLocalBrowserExecutablePath();

  if (localExecutablePath) {
    return {
      executablePath: localExecutablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      headless: true,
    };
  }

  const chromium = (await import("@sparticuz/chromium")).default;
  const executablePath = await chromium.executablePath();

  return {
    executablePath,
    args: [...chromium.args, "--disable-dev-shm-usage"],
    headless: true,
  };
}

function getContentDispositionFileName(fileName: string) {
  const asciiName = fileName
    .replace(/\u0131/g, "i")
    .replace(/\u0130/g, "I")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^a-zA-Z0-9_.-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "CV";

  return `attachment; filename="${asciiName}.pdf"; filename*=UTF-8''${encodeURIComponent(`${fileName}.pdf`)}`;
}

function isNativeDownloadRequest(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  return contentType.includes("application/x-www-form-urlencoded")
    || contentType.includes("multipart/form-data");
}

async function parseExportRequest(req: NextRequest) {
  if (isNativeDownloadRequest(req)) {
    const formData = await req.formData();
    const rawCVData = formData.get("cvData");
    const rawDownloadToken = formData.get("downloadToken");

    if (typeof rawCVData !== "string") {
      return { cvData: null, downloadToken: null, nativeDownload: true };
    }

    const downloadToken = typeof rawDownloadToken === "string"
      && DOWNLOAD_TOKEN_PATTERN.test(rawDownloadToken)
      ? rawDownloadToken
      : null;

    return {
      cvData: JSON.parse(rawCVData),
      downloadToken,
      nativeDownload: true,
    };
  }

  const body = await req.json();
  return {
    cvData: body?.cvData ?? null,
    downloadToken: null,
    nativeDownload: false,
  };
}

function nativeDownloadError(req: NextRequest, message: string, status: number) {
  const payload = JSON.stringify({
    type: "cvcraft:pdf-error",
    message,
  }).replace(/</g, "\\u003c");

  return new NextResponse(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"></head><body><script>window.parent.postMessage(${payload}, ${JSON.stringify(req.nextUrl.origin)});</script></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function POST(req: NextRequest) {
  const nativeRequest = isNativeDownloadRequest(req);
  const user = await getSession();
  if (!user) {
    const message = "Oturumunuz sona erdi. Lütfen yeniden giriş yapın.";
    return nativeRequest
      ? nativeDownloadError(req, message, 401)
      : NextResponse.json({ error: message }, { status: 401 });
  }

  let browser: import("puppeteer-core").Browser | null = null;
  let nativeDownload = nativeRequest;
  const startedAt = Date.now();

  try {
    const parsedRequest = await parseExportRequest(req);
    const { cvData, downloadToken } = parsedRequest;
    nativeDownload = parsedRequest.nativeDownload;

    if (!cvData || typeof cvData !== "object") {
      const message = "PDF oluşturmak için geçerli CV verisi gerekli.";
      return nativeDownload
        ? nativeDownloadError(req, message, 400)
        : NextResponse.json({ error: message }, { status: 400 });
    }

    console.info("[pdf-export] started", {
      userId: user.id,
      templateId: cvData.templateId || "modern",
      nativeDownload,
    });

    const puppeteer = await import("puppeteer-core");
    const launchOptions = await getBrowserLaunchOptions();
    browser = await puppeteer.default.launch({
      executablePath: launchOptions.executablePath,
      headless: launchOptions.headless,
      args: launchOptions.args,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    const firstName = (cvData.personalInfo?.firstName || "").trim();
    const lastName = (cvData.personalInfo?.lastName || "").trim();
    const fileName = firstName || lastName
      ? `${firstName}_${lastName}_CV`.replace(/\s+/g, "_")
      : "CV";

    const printUrl = new URL("/print", req.nextUrl.origin);
    const printPayload = JSON.stringify({ version: 1, cv: cvData });

    await page.evaluateOnNewDocument((payload) => {
      window.name = payload;
    }, printPayload);
    await page.goto(printUrl.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("[data-print-ready='true']", { timeout: 30000 });
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForFunction(
      () => Array.from(document.images).every((image) => image.complete),
      { timeout: 15000 },
    );
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const response = new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": getContentDispositionFileName(fileName),
        "Cache-Control": "private, no-store",
        "Content-Length": String(pdfBuffer.byteLength),
        "X-Content-Type-Options": "nosniff",
      },
    });

    if (downloadToken) {
      response.cookies.set(DOWNLOAD_COOKIE, downloadToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60,
        path: "/",
      });
    }

    console.info("[pdf-export] completed", {
      userId: user.id,
      bytes: pdfBuffer.byteLength,
      durationMs: Date.now() - startedAt,
      nativeDownload,
    });

    return response;
  } catch (error) {
    console.error("[pdf-export] failed", {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
      nativeDownload,
    });
    const message = "PDF şu anda oluşturulamadı. Lütfen tekrar deneyin.";
    return nativeDownload
      ? nativeDownloadError(req, message, 500)
      : NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
