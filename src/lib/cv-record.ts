import type { CVData } from "@/lib/cv-types";

export interface CVRecord extends CVData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type CVPayload = Pick<
  CVData,
  "title" | "templateId" | "personalInfo" | "sections" | "sectionOrder" | "theme"
>;
