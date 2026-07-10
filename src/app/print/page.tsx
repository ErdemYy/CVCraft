import CVRenderer from "@/components/templates/CVRenderer";
import {
  DEFAULT_PERSONAL_INFO,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTIONS,
  DEFAULT_THEME,
  type CVData,
} from "@/lib/cv-types";
import { consumePrintToken } from "@/lib/print-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParamValue = string | string[] | undefined;

function getParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function createFallbackCV(): CVData {
  return {
    title: "CV",
    templateId: "modern",
    personalInfo: DEFAULT_PERSONAL_INFO,
    sections: DEFAULT_SECTIONS,
    sectionOrder: DEFAULT_SECTION_ORDER,
    theme: DEFAULT_THEME,
  };
}

function parseLegacyData(dataParam: string | undefined) {
  if (!dataParam) return null;
  try {
    return JSON.parse(dataParam) as CVData;
  } catch {
    return null;
  }
}

export default async function PrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const token = getParam(params.token);
  const legacyData = getParam(params.data);
  const cv = token ? consumePrintToken(token) : parseLegacyData(legacyData);

  if (!cv) {
    return (
      <main data-print-ready="true" style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
        CV verisi bulunamadı.
      </main>
    );
  }

  return (
    <main data-print-ready="true" style={{ margin: 0, padding: 0 }}>
      <CVRenderer cv={cv || createFallbackCV()} />
    </main>
  );
}
