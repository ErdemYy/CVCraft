"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CVData,
  type CVLayoutBlockId,
  type PersonalInfo,
  type CVSections,
  type CVTheme,
  type CVTextStyle,
  type CustomSectionItem,
  type SectionId,
  type SectionColumn,
  type SectionKey,
  DEFAULT_PERSONAL_INFO,
  DEFAULT_THEME,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTIONS,
  SECTION_LABELS,
} from "@/lib/cv-types";
import { isBuiltInSectionId, getSectionTitle } from "@/lib/section-utils";
import { nanoid } from "@/lib/nanoid";

interface CVStore {
  cv: CVData;
  isDirty: boolean;
  activeSection: string | null;
  history: {
    past: CVData[];
    future: CVData[];
  };

  // Actions
  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  setSection: <K extends SectionKey>(key: K, data: CVSections[K]) => void;
  setCustomSectionItems: (sectionId: SectionId, items: CustomSectionItem[]) => void;
  setSectionOrder: (order: SectionId[]) => void;
  setSectionTitle: (sectionId: SectionId, title: string) => void;
  setSectionVisibility: (sectionId: SectionId, visible: boolean) => void;
  setSectionColumn: (sectionId: SectionId, column: SectionColumn) => void;
  setLayoutBlockColumn: (blockId: CVLayoutBlockId, column: SectionColumn) => void;
  addSection: (sectionType: SectionKey | "custom", customTitle?: string) => SectionId | null;
  duplicateSection: (sectionId: SectionId) => SectionId | null;
  removeSection: (sectionId: SectionId) => void;
  setTheme: (theme: Partial<CVTheme>) => void;
  setTextStyle: (fieldId: string | "__global", style: Partial<CVTextStyle>) => void;
  clearTextStyle: (fieldId?: string | "__global") => void;
  setRichText: (fieldId: string, html: string) => void;
  setTemplate: (templateId: string) => void;
  setTitle: (title: string) => void;
  setActiveSection: (section: string | null) => void;
  undo: () => void;
  redo: () => void;
  loadCV: (cv: CVData) => void;
  resetCV: () => void;
  markSaved: () => void;
}

function createEmptyCV(): CVData {
  return {
    title: "Benim CV'm",
    templateId: "modern",
    personalInfo: { ...DEFAULT_PERSONAL_INFO },
    sections: {
      ...DEFAULT_SECTIONS,
      sectionMeta: {},
      customSections: [],
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    theme: { ...DEFAULT_THEME },
  };
}

function withSectionDefaults(cv: CVData): CVData {
  return {
    ...cv,
    personalInfo: {
      ...DEFAULT_PERSONAL_INFO,
      ...(cv.personalInfo ?? {}),
      photoSettings: {
        ...DEFAULT_PERSONAL_INFO.photoSettings,
        ...(cv.personalInfo?.photoSettings ?? {}),
      },
    },
    sections: {
      ...DEFAULT_SECTIONS,
      ...(cv.sections ?? {}),
      customSections: cv.sections?.customSections ?? [],
      sectionMeta: cv.sections?.sectionMeta ?? {},
    },
    sectionOrder: Array.isArray(cv.sectionOrder) && cv.sectionOrder.length
      ? cv.sectionOrder
      : [...DEFAULT_SECTION_ORDER],
    theme: {
      ...DEFAULT_THEME,
      ...(cv.theme ?? {}),
      layoutBlockColumns: {
        ...DEFAULT_THEME.layoutBlockColumns,
        ...(cv.theme?.layoutBlockColumns ?? {}),
      },
      globalTextStyle: { ...DEFAULT_THEME.globalTextStyle, ...(cv.theme?.globalTextStyle ?? {}) },
      textStyles: { ...DEFAULT_THEME.textStyles, ...(cv.theme?.textStyles ?? {}) },
      richText: { ...DEFAULT_THEME.richText, ...(cv.theme?.richText ?? {}) },
    },
  };
}

function pushHistory(state: Pick<CVStore, "cv" | "history">) {
  return {
    past: [...state.history.past, state.cv].slice(-50),
    future: [],
  };
}

function commitCV(state: CVStore, cv: CVData) {
  return {
    cv: withSectionDefaults(cv),
    isDirty: true,
    history: pushHistory(state),
  };
}

function cleanTitle(title: string, fallback: string) {
  const value = title.trim();
  return value || fallback;
}

function metaFor(sectionId: SectionId, title: string, visible = true, isCustom = false, column?: SectionColumn) {
  return {
    id: sectionId,
    type: isCustom ? "custom" as const : sectionId as SectionKey,
    title,
    visible,
    isCustom,
    column,
  };
}

function sectionToCustomItems(cv: CVData, sectionId: SectionId): CustomSectionItem[] {
  if (!isBuiltInSectionId(sectionId)) {
    const section = cv.sections.customSections?.find((item) => item.id === sectionId);
    return section?.items.map((item) => ({ ...item, id: nanoid() })) ?? [];
  }

  switch (sectionId) {
    case "experience":
      return cv.sections.experience.map((item) => ({
        id: nanoid(),
        title: [item.position, item.company].filter(Boolean).join(" · "),
        description: item.description,
      }));
    case "education":
      return cv.sections.education.map((item) => ({
        id: nanoid(),
        title: [item.degree, item.field, item.school].filter(Boolean).join(" · "),
        description: item.description,
      }));
    case "skills":
      return cv.sections.skills.map((item) => ({
        id: nanoid(),
        title: item.name,
        description: item.level ? `Seviye: ${item.level}/5` : "",
      }));
    case "languages":
      return cv.sections.languages.map((item) => ({
        id: nanoid(),
        title: item.name,
        description: item.level,
      }));
    case "projects":
      return cv.sections.projects.map((item) => ({
        id: nanoid(),
        title: item.name,
        description: [item.technologies, item.description, item.url].filter(Boolean).join("\n"),
      }));
    case "certificates":
      return cv.sections.certificates.map((item) => ({
        id: nanoid(),
        title: item.name,
        description: [item.issuer, item.date, item.url].filter(Boolean).join(" · "),
      }));
    case "references":
      return cv.sections.references.map((item) => ({
        id: nanoid(),
        title: item.name,
        description: [item.title, item.company, item.email, item.phone].filter(Boolean).join(" · "),
      }));
    case "interests":
      return cv.sections.interests.map((item) => ({
        id: nanoid(),
        title: item.name,
        description: "",
      }));
  }
}

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      cv: createEmptyCV(),
      isDirty: false,
      activeSection: null,
      history: { past: [], future: [] },

      setPersonalInfo: (info) =>
        set((state) => commitCV(state, {
            ...state.cv,
            personalInfo: { ...state.cv.personalInfo, ...info },
          })),

      setSection: (key, data) =>
        set((state) => commitCV(state, {
            ...state.cv,
            sections: { ...state.cv.sections, [key]: data },
          })),

      setCustomSectionItems: (sectionId, items) =>
        set((state) => commitCV(state, {
            ...state.cv,
            sections: {
              ...state.cv.sections,
              customSections: state.cv.sections.customSections.map((section) =>
                section.id === sectionId ? { ...section, items } : section,
              ),
            },
          })),

      setSectionOrder: (order) =>
        set((state) => commitCV(state, { ...state.cv, sectionOrder: order })),

      setSectionTitle: (sectionId, title) =>
        set((state) => {
          const fallback = getSectionTitle(state.cv, sectionId);
          const nextTitle = cleanTitle(title, fallback);
          const isCustom = !isBuiltInSectionId(sectionId);

          return commitCV(state, {
              ...state.cv,
              sections: {
                ...state.cv.sections,
                customSections: state.cv.sections.customSections.map((section) =>
                  section.id === sectionId ? { ...section, title: nextTitle } : section,
                ),
                sectionMeta: {
                  ...state.cv.sections.sectionMeta,
                  [String(sectionId)]: metaFor(
                    sectionId,
                    nextTitle,
                    state.cv.sections.sectionMeta[String(sectionId)]?.visible ?? true,
                    isCustom,
                    state.cv.sections.sectionMeta[String(sectionId)]?.column,
                  ),
                },
              },
            });
        }),

      setSectionVisibility: (sectionId, visible) =>
        set((state) => {
          const isCustom = !isBuiltInSectionId(sectionId);
          return commitCV(state, {
              ...state.cv,
              sections: {
                ...state.cv.sections,
                sectionMeta: {
                  ...state.cv.sections.sectionMeta,
                  [String(sectionId)]: metaFor(
                    sectionId,
                    getSectionTitle(state.cv, sectionId),
                    visible,
                    isCustom,
                    state.cv.sections.sectionMeta[String(sectionId)]?.column,
                  ),
                },
              },
            });
        }),

      setSectionColumn: (sectionId, column) =>
        set((state) => {
          const current = state.cv.sections.sectionMeta[String(sectionId)];
          const isCustom = !isBuiltInSectionId(sectionId);
          return commitCV(state, {
            ...state.cv,
            sections: {
              ...state.cv.sections,
              sectionMeta: {
                ...state.cv.sections.sectionMeta,
                [String(sectionId)]: metaFor(
                  sectionId,
                  getSectionTitle(state.cv, sectionId),
                  current?.visible ?? true,
                  isCustom,
                  column,
                ),
              },
            },
          });
        }),

      setLayoutBlockColumn: (blockId, column) =>
        set((state) => commitCV(state, {
          ...state.cv,
          theme: {
            ...state.cv.theme,
            layoutBlockColumns: {
              ...state.cv.theme.layoutBlockColumns,
              [blockId]: column,
            },
          },
        })),

      addSection: (sectionType, customTitle) => {
        const createdId = sectionType === "custom" ? `custom_${nanoid()}` : sectionType;
        set((state) => {
          if (sectionType !== "custom" && state.cv.sectionOrder.includes(sectionType)) {
            return commitCV(state, {
                ...state.cv,
                sections: {
                  ...state.cv.sections,
                  sectionMeta: {
                    ...state.cv.sections.sectionMeta,
                    [sectionType]: metaFor(
                      sectionType,
                      getSectionTitle(state.cv, sectionType),
                      true,
                      false,
                      state.cv.sections.sectionMeta[sectionType]?.column,
                    ),
                  },
                },
              });
          }

          const title = sectionType === "custom"
            ? cleanTitle(customTitle || "", "Özel Bölüm")
            : SECTION_LABELS[sectionType];

          return commitCV(state, {
              ...state.cv,
              sectionOrder: [...state.cv.sectionOrder, createdId],
              sections: {
                ...state.cv.sections,
                customSections: sectionType === "custom"
                  ? [
                    ...state.cv.sections.customSections,
                    { id: createdId, title, items: [{ id: nanoid(), title: "", description: "" }] },
                  ]
                  : state.cv.sections.customSections,
                sectionMeta: {
                  ...state.cv.sections.sectionMeta,
                  [String(createdId)]: metaFor(createdId, title, true, sectionType === "custom", sectionType === "custom" ? "main" : undefined),
                },
              },
            });
        });
        return createdId;
      },

      duplicateSection: (sectionId) => {
        const createdId = `custom_${nanoid()}`;
        set((state) => {
          const title = `${getSectionTitle(state.cv, sectionId)} Kopyası`;
          const copiedItems = sectionToCustomItems(state.cv, sectionId);
          return commitCV(state, {
              ...state.cv,
              sectionOrder: [...state.cv.sectionOrder, createdId],
              sections: {
                ...state.cv.sections,
                customSections: [
                  ...state.cv.sections.customSections,
                  {
                    id: createdId,
                    title,
                    items: copiedItems.length ? copiedItems : [{ id: nanoid(), title: "", description: "" }],
                  },
                ],
                sectionMeta: {
                  ...state.cv.sections.sectionMeta,
                  [createdId]: metaFor(createdId, title, true, true, "main"),
                },
              },
            });
        });
        return createdId;
      },

      removeSection: (sectionId) =>
        set((state) => {
          const sectionMeta = { ...state.cv.sections.sectionMeta };
          delete sectionMeta[String(sectionId)];

          return commitCV(state, {
              ...state.cv,
              sectionOrder: state.cv.sectionOrder.filter((id) => id !== sectionId),
              sections: {
                ...state.cv.sections,
                customSections: state.cv.sections.customSections.filter((section) => section.id !== sectionId),
                sectionMeta,
              },
            });
        }),

      setTheme: (theme) =>
        set((state) => commitCV(state, {
            ...state.cv,
            theme: { ...state.cv.theme, ...theme },
          })),

      setTextStyle: (fieldId, style) =>
        set((state) => {
          if (fieldId === "__global") {
            return commitCV(state, {
              ...state.cv,
              theme: {
                ...state.cv.theme,
                globalTextStyle: { ...state.cv.theme.globalTextStyle, ...style },
              },
            });
          }

          return commitCV(state, {
            ...state.cv,
            theme: {
              ...state.cv.theme,
              textStyles: {
                ...state.cv.theme.textStyles,
                [fieldId]: { ...(state.cv.theme.textStyles[fieldId] ?? {}), ...style },
              },
            },
          });
        }),

      clearTextStyle: (fieldId = "__global") =>
        set((state) => {
          if (fieldId === "__global") {
            return commitCV(state, {
              ...state.cv,
              theme: { ...state.cv.theme, globalTextStyle: {} },
            });
          }

          const textStyles = { ...state.cv.theme.textStyles };
          delete textStyles[fieldId];
          return commitCV(state, {
            ...state.cv,
            theme: { ...state.cv.theme, textStyles },
          });
        }),

      setRichText: (fieldId, html) =>
        set((state) => commitCV(state, {
          ...state.cv,
          theme: {
            ...state.cv.theme,
            richText: {
              ...state.cv.theme.richText,
              [fieldId]: html,
            },
          },
        })),

      setTemplate: (templateId) =>
        set((state) => commitCV(state, { ...state.cv, templateId })),

      setTitle: (title) =>
        set((state) => commitCV(state, { ...state.cv, title })),

      setActiveSection: (section) => set({ activeSection: section }),

      undo: () =>
        set((state) => {
          const previous = state.history.past.at(-1);
          if (!previous) return state;
          return {
            cv: withSectionDefaults(previous),
            isDirty: true,
            history: {
              past: state.history.past.slice(0, -1),
              future: [state.cv, ...state.history.future].slice(0, 50),
            },
          };
        }),

      redo: () =>
        set((state) => {
          const next = state.history.future[0];
          if (!next) return state;
          return {
            cv: withSectionDefaults(next),
            isDirty: true,
            history: {
              past: [...state.history.past, state.cv].slice(-50),
              future: state.history.future.slice(1),
            },
          };
        }),

      loadCV: (cv) => set({ cv: withSectionDefaults(cv), isDirty: false, history: { past: [], future: [] } }),

      resetCV: () =>
        set({
          cv: createEmptyCV(),
          isDirty: false,
          activeSection: null,
          history: { past: [], future: [] },
        }),

      markSaved: () => set({ isDirty: false }),
    }),
    {
      name: "cv-store",
      partialize: (state) => ({
        cv: state.cv,
        isDirty: state.isDirty,
        activeSection: state.activeSection,
      }),
      merge: (persisted, current) => {
        const state = persisted as Partial<CVStore> | undefined;
        return {
          ...current,
          ...state,
          cv: withSectionDefaults((state?.cv ?? current.cv) as CVData),
          history: { past: [], future: [] },
        };
      },
    }
  )
);
