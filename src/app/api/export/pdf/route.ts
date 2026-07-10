import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { createPrintToken } from "@/lib/print-cache";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

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
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^a-zA-Z0-9_.-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "CV";

  return `attachment; filename="${asciiName}.pdf"; filename*=UTF-8''${encodeURIComponent(`${fileName}.pdf`)}`;
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let browser: import("puppeteer-core").Browser | null = null;

  try {
    const body = await req.json();
    const { cvData } = body;

    if (!cvData) {
      return NextResponse.json({ error: "CV verisi gerekli" }, { status: 400 });
    }

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

    const printToken = createPrintToken(cvData);
    const printUrl = new URL("/print", req.nextUrl.origin);
    printUrl.searchParams.set("token", printToken);

    await page.goto(printUrl.toString(), { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForSelector("[data-print-ready='true']", { timeout: 10000 });
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": getContentDispositionFileName(fileName),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "PDF oluşturulamadı" }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
