export type TextAlignment = "left" | "center" | "right" | "justify";
export type ListStyleType = "disc" | "circle" | "square" | "dash" | "decimal" | "alpha";

export interface CVTextStyle {
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  isStrikethrough: boolean;
  textColor: string;
  alignment: TextAlignment;
  lineHeight: number;
  letterSpacing: number;
  listStyle?: ListStyleType | null;
  indentLevel?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export type PhotoShape = "circle" | "square" | "rounded" | "portrait" | "landscape";

export interface CvPhotoSettings {
  imagePath?: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  shape: PhotoShape;
  borderRadius: number;
  borderWidth: number;
}

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
  birthDate: string;
  nationality: string;
  maritalStatus: string;
  militaryStatus: string;
  drivingLicense: string;
  summary: string;
  photo: string; // base64 or url
  photoSettings: CvPhotoSettings;
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

export interface InterestItem {
  id: string;
  name: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export type SectionKey =
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "references"
  | "certificates"
  | "interests";

export type SectionId = SectionKey | string;
export type SectionColumn = "sidebar" | "main";

export interface SectionMeta {
  id: SectionId;
  type: SectionKey | "custom";
  title: string;
  visible: boolean;
  isCustom?: boolean;
  column?: SectionColumn;
}

export interface CVSections {
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  references: ReferenceItem[];
  certificates: CertificateItem[];
  interests: InterestItem[];
  customSections: CustomSection[];
  sectionMeta: Record<string, SectionMeta>;
}

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "certificates",
  "references",
  "interests",
];

export interface CVTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  photoShape: "circle" | "square" | "rounded";
  sidebarPosition: "auto" | "left" | "right";
  globalTextStyle: Partial<CVTextStyle>;
  textStyles: Record<string, Partial<CVTextStyle>>;
  richText: Record<string, string>;
}

export interface CVData {
  id?: string;
  title: string;
  templateId: string;
  personalInfo: PersonalInfo;
  sections: CVSections;
  sectionOrder: SectionId[];
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
  birthDate: "",
  nationality: "",
  maritalStatus: "",
  militaryStatus: "",
  drivingLicense: "",
  summary: "",
  photo: "",
  photoSettings: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    shape: "circle",
    borderRadius: 50,
    borderWidth: 0,
  },
};

export const DEFAULT_SECTIONS: CVSections = {
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  references: [],
  certificates: [],
  interests: [],
  customSections: [],
  sectionMeta: {},
};

export const DEFAULT_THEME: CVTheme = {
  primaryColor: "#B08D57",
  secondaryColor: "#2B2A28",
  fontFamily: "inter",
  fontSize: "medium",
  spacing: "normal",
  photoShape: "circle",
  sidebarPosition: "auto",
  globalTextStyle: {},
  textStyles: {},
  richText: {},
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  experience: "İş Deneyimi",
  education: "Eğitim",
  skills: "Yetenekler",
  languages: "Diller",
  projects: "Projeler",
  references: "Referanslar",
  certificates: "Sertifikalar",
  interests: "İlgi Alanları",
};
