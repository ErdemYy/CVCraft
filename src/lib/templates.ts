export interface Template {
  id: string;
  name: string;
  category: "modern" | "classic" | "creative" | "minimal";
  description: string;
  primaryColor: string;
  previewBg: string;
  accentColor: string;
  supportsPhoto: boolean;
  twoColumn: boolean;
}

export const TEMPLATES: Template[] = [
  {
    id: "modern",
    name: "Modern",
    category: "modern",
    description: "Temiz çizgiler, iki sütunlu düzen. Yazılım ve teknoloji sektörü için ideal.",
    primaryColor: "#B08D57",
    previewBg: "#FAF9F6",
    accentColor: "#2B2A28",
    supportsPhoto: true,
    twoColumn: true,
  },
  {
    id: "classic",
    name: "Klasik",
    category: "classic",
    description: "Geleneksel tek sütunlu düzen. Kurumsal başvurular ve akademik pozisyonlar için.",
    primaryColor: "#1A3A5C",
    previewBg: "#FFFFFF",
    accentColor: "#1A3A5C",
    supportsPhoto: false,
    twoColumn: false,
  },
  {
    id: "creative",
    name: "Yaratıcı",
    category: "creative",
    description: "Cesur tasarım, renk bloklarıyla dikkat çekici görünüm. Yaratıcı sektörler için.",
    primaryColor: "#4F46E5",
    previewBg: "#1E1B4B",
    accentColor: "#C7D2FE",
    supportsPhoto: true,
    twoColumn: true,
  },
  {
    id: "minimal",
    name: "Minimal",
    category: "minimal",
    description: "Saf tipografi odaklı, dekorasyon yok. ATS uyumlu, her sektöre uygun.",
    primaryColor: "#000000",
    previewBg: "#FFFFFF",
    accentColor: "#666666",
    supportsPhoto: false,
    twoColumn: false,
  },
  {
    id: "ats-pro",
    name: "ATS Pro",
    category: "minimal",
    description: "Tek kolonlu, sade ve taranabilir yapı. ATS sistemleri ve kurumsal başvurular için optimize edildi.",
    primaryColor: "#24515A",
    previewBg: "#FFFFFF",
    accentColor: "#111827",
    supportsPhoto: false,
    twoColumn: false,
  },
  {
    id: "executive",
    name: "Executive",
    category: "classic",
    description: "Üst düzey roller için güçlü başlık, dengeli boşluk ve prestijli tipografi.",
    primaryColor: "#1E3A5F",
    previewBg: "#F8FAFC",
    accentColor: "#C39A5F",
    supportsPhoto: false,
    twoColumn: false,
  },
  {
    id: "corporate",
    name: "Corporate",
    category: "modern",
    description: "Kurumsal ekipler, finans, operasyon ve yönetim rolleri için net iki sütunlu düzen.",
    primaryColor: "#2F4858",
    previewBg: "#F5F7F8",
    accentColor: "#86A8A8",
    supportsPhoto: false,
    twoColumn: true,
  },
  {
    id: "consultant",
    name: "Consultant",
    category: "modern",
    description: "Danışmanlık ve proje odaklı roller için çıktı, etki ve yetkinlikleri öne çıkaran tasarım.",
    primaryColor: "#7A4E2D",
    previewBg: "#FBF7F1",
    accentColor: "#D6B98C",
    supportsPhoto: false,
    twoColumn: true,
  },
  {
    id: "editorial",
    name: "Editorial",
    category: "creative",
    description: "Marka, içerik, tasarım ve iletişim rolleri için zarif, editoryal ve kontrollü görsel vurgu.",
    primaryColor: "#6B3F5F",
    previewBg: "#F7F0F4",
    accentColor: "#D8A7B1",
    supportsPhoto: true,
    twoColumn: true,
  },
  {
    id: "tech-focus",
    name: "Tech Focus",
    category: "modern",
    description: "Yazılım, ürün ve veri rolleri için beceri, proje ve deneyim akışını öne alan teknik düzen.",
    primaryColor: "#124E66",
    previewBg: "#EEF7FA",
    accentColor: "#2E8A99",
    supportsPhoto: false,
    twoColumn: true,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  all: "Tümü",
  modern: "Modern",
  classic: "Klasik",
  creative: "Yaratıcı",
  minimal: "Minimal",
};

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
