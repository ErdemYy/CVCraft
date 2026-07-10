"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CVData,
  type PersonalInfo,
  type CVSections,
  type CVTheme,
  type SectionKey,
  DEFAULT_PERSONAL_INFO,
  DEFAULT_THEME,
  DEFAULT_SECTION_ORDER,
} from "@/lib/cv-types";

interface CVStore {
  cv: CVData;
  isDirty: boolean;
  activeSection: string | null;

  // Actions
  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  setSection: <K extends SectionKey>(key: K, data: CVSections[K]) => void;
  setSectionOrder: (order: SectionKey[]) => void;
  setTheme: (theme: Partial<CVTheme>) => void;
  setTemplate: (templateId: string) => void;
  setTitle: (title: string) => void;
  setActiveSection: (section: string | null) => void;
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
      experience: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      references: [],
      certificates: [],
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    theme: { ...DEFAULT_THEME },
  };
}

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      cv: createEmptyCV(),
      isDirty: false,
      activeSection: null,

      setPersonalInfo: (info) =>
        set((state) => ({
          cv: {
            ...state.cv,
            personalInfo: { ...state.cv.personalInfo, ...info },
          },
          isDirty: true,
        })),

      setSection: (key, data) =>
        set((state) => ({
          cv: {
            ...state.cv,
            sections: { ...state.cv.sections, [key]: data },
          },
          isDirty: true,
        })),

      setSectionOrder: (order) =>
        set((state) => ({
          cv: { ...state.cv, sectionOrder: order },
          isDirty: true,
        })),

      setTheme: (theme) =>
        set((state) => ({
          cv: {
            ...state.cv,
            theme: { ...state.cv.theme, ...theme },
          },
          isDirty: true,
        })),

      setTemplate: (templateId) =>
        set((state) => ({
          cv: { ...state.cv, templateId },
          isDirty: true,
        })),

      setTitle: (title) =>
        set((state) => ({
          cv: { ...state.cv, title },
          isDirty: true,
        })),

      setActiveSection: (section) => set({ activeSection: section }),

      loadCV: (cv) => set({ cv, isDirty: false }),

      resetCV: () =>
        set({
          cv: createEmptyCV(),
          isDirty: false,
          activeSection: null,
        }),

      markSaved: () => set({ isDirty: false }),
    }),
    {
      name: "cv-store",
    }
  )
);
