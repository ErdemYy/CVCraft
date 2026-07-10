export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  photo: string; // base64 or url
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string; // A1-C2 or Native
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CVSections {
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  references: ReferenceItem[];
  certificates: CertificateItem[];
}

export type SectionKey = keyof CVSections;

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "certificates",
  "references",
];

export interface CVTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  photoShape: "circle" | "square" | "rounded";
}

export interface CVData {
  id?: string;
  title: string;
  templateId: string;
  personalInfo: PersonalInfo;
  sections: CVSections;
  sectionOrder: SectionKey[];
  theme: CVTheme;
}

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
  photo: "",
};

export const DEFAULT_SECTIONS: CVSections = {
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  references: [],
  certificates: [],
};

export const DEFAULT_THEME: CVTheme = {
  primaryColor: "#B08D57",
  secondaryColor: "#2B2A28",
  fontFamily: "inter",
  fontSize: "medium",
  spacing: "normal",
  photoShape: "circle",
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  experience: "Deneyim",
  education: "Eğitim",
  skills: "Yetenekler",
  languages: "Diller",
  projects: "Projeler",
  references: "Referanslar",
  certificates: "Sertifikalar",
};
