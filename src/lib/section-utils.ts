import {
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  type CVData,
  type CustomSection,
  type SectionId,
  type SectionColumn,
  type SectionKey,
  type SectionMeta,
} from "@/lib/cv-types";

export const BUILT_IN_SECTION_KEYS: SectionKey[] = [...DEFAULT_SECTION_ORDER];

export const SECTION_TYPE_OPTIONS: Array<{ id: SectionKey | "custom"; label: string }> = [
  { id: "experience", label: "İş Deneyimi" },
  { id: "education", label: "Eğitim" },
  { id: "skills", label: "Yetenekler" },
  { id: "languages", label: "Diller" },
  { id: "certificates", label: "Sertifikalar" },
  { id: "projects", label: "Projeler" },
  { id: "references", label: "Referanslar" },
  { id: "interests", label: "İlgi Alanları" },
  { id: "custom", label: "Özel Bölüm" },
];

const BUILT_IN_SET = new Set<SectionKey>(BUILT_IN_SECTION_KEYS);

export function isBuiltInSectionId(id: SectionId): id is SectionKey {
  return BUILT_IN_SET.has(id as SectionKey);
}

export function isCustomSectionId(id: SectionId) {
  return String(id).startsWith("custom_");
}

export function getCustomSection(cv: CVData, id: SectionId): CustomSection | undefined {
  return cv.sections.customSections?.find((section) => section.id === id);
}

export function getDefaultSectionTitle(id: SectionId) {
  if (isBuiltInSectionId(id)) return SECTION_LABELS[id];
  return "Özel Bölüm";
}

export function getSectionMeta(cv: CVData, id: SectionId): SectionMeta {
  const customSection = getCustomSection(cv, id);
  const meta = cv.sections.sectionMeta?.[String(id)];

  return {
    id,
    type: customSection ? "custom" : isBuiltInSectionId(id) ? id : "custom",
    title: meta?.title || customSection?.title || getDefaultSectionTitle(id),
    visible: meta?.visible ?? true,
    isCustom: Boolean(customSection || meta?.isCustom),
  };
}

export function getSectionTitle(cv: CVData, id: SectionId) {
  return getSectionMeta(cv, id).title;
}

export function isSectionVisible(cv: CVData, id: SectionId) {
  return getSectionMeta(cv, id).visible;
}

export function getSectionColumn(cv: CVData, id: SectionId): SectionColumn {
  const configured = cv.sections.sectionMeta?.[String(id)]?.column;
  if (configured === "sidebar" || configured === "main") return configured;
  return id === "skills" || id === "languages" ? "sidebar" : "main";
}

export function getSectionsForColumn(cv: CVData, column: SectionColumn) {
  return getOrderedSectionIds(cv).filter((id) => getSectionColumn(cv, id) === column);
}

export function isSidebarRight(cv: CVData, defaultRight = false) {
  if (cv.theme.sidebarPosition === "right") return true;
  if (cv.theme.sidebarPosition === "left") return false;
  return defaultRight;
}

export function getSectionItemCount(cv: CVData, id: SectionId) {
  if (isBuiltInSectionId(id)) {
    return cv.sections[id]?.length ?? 0;
  }

  return getCustomSection(cv, id)?.items.length ?? 0;
}

export function sectionHasContent(cv: CVData, id: SectionId) {
  if (isBuiltInSectionId(id)) {
    if (id === "interests") return cv.sections.interests.some((item) => item.name.trim());
    return (cv.sections[id] ?? []).length > 0;
  }

  const customSection = getCustomSection(cv, id);
  return Boolean(customSection?.items.some((item) => item.title.trim() || item.description.trim()));
}

export function getOrderedSectionIds(
  cv: CVData,
  options: { includeHidden?: boolean; includeEmpty?: boolean } = {},
) {
  const validIds = new Set<SectionId>([
    ...BUILT_IN_SECTION_KEYS,
    ...(cv.sections.customSections ?? []).map((section) => section.id),
  ]);

  return cv.sectionOrder
    .filter((id): id is SectionId => validIds.has(id))
    .filter((id) => options.includeHidden || isSectionVisible(cv, id))
    .filter((id) => options.includeEmpty || sectionHasContent(cv, id));
}

export function getEditableSectionIds(cv: CVData) {
  const fromOrder = getOrderedSectionIds(cv, { includeHidden: true, includeEmpty: true });
  const missingCustom = (cv.sections.customSections ?? [])
    .map((section) => section.id)
    .filter((id) => !fromOrder.includes(id));

  return [...fromOrder, ...missingCustom];
}
