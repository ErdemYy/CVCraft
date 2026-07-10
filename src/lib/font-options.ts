export interface FontOption {
  id: string;
  label: string;
  family: string;
  category: "serif" | "sans" | "mono";
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "times-new-roman", label: "Times New Roman", family: '"Times New Roman", Times, serif', category: "serif" },
  { id: "arial", label: "Arial", family: "Arial, Helvetica, sans-serif", category: "sans" },
  { id: "calibri", label: "Calibri", family: "Calibri, Arial, sans-serif", category: "sans" },
  { id: "georgia", label: "Georgia", family: "Georgia, serif", category: "serif" },
  { id: "garamond", label: "Garamond", family: "Garamond, 'Times New Roman', serif", category: "serif" },
  { id: "helvetica", label: "Helvetica", family: "Helvetica, Arial, sans-serif", category: "sans" },
  { id: "verdana", label: "Verdana", family: "Verdana, Geneva, sans-serif", category: "sans" },
  { id: "tahoma", label: "Tahoma", family: "Tahoma, Geneva, sans-serif", category: "sans" },
  { id: "trebuchet-ms", label: "Trebuchet MS", family: "'Trebuchet MS', Arial, sans-serif", category: "sans" },
  { id: "courier-new", label: "Courier New", family: "'Courier New', Courier, monospace", category: "mono" },
  { id: "baskerville", label: "Baskerville", family: "Baskerville, Georgia, serif", category: "serif" },
  { id: "cambria", label: "Cambria", family: "Cambria, Georgia, serif", category: "serif" },
  { id: "inter", label: "Inter", family: "Inter, Arial, sans-serif", category: "sans" },
  { id: "roboto", label: "Roboto", family: "Roboto, Arial, sans-serif", category: "sans" },
  { id: "open-sans", label: "Open Sans", family: "'Open Sans', Arial, sans-serif", category: "sans" },
  { id: "lato", label: "Lato", family: "Lato, Arial, sans-serif", category: "sans" },
  { id: "montserrat", label: "Montserrat", family: "Montserrat, Arial, sans-serif", category: "sans" },
  { id: "merriweather", label: "Merriweather", family: "Merriweather, Georgia, serif", category: "serif" },
  { id: "playfair-display", label: "Playfair Display", family: "'Playfair Display', Georgia, serif", category: "serif" },
  { id: "poppins", label: "Poppins", family: "Poppins, Arial, sans-serif", category: "sans" },
];

const FALLBACK_FONT = FONT_OPTIONS.find((font) => font.id === "inter") ?? FONT_OPTIONS[0];

export function resolveFontFamily(fontId?: string) {
  if (fontId === "serif") return "Georgia, serif";
  return (FONT_OPTIONS.find((font) => font.id === fontId) ?? FALLBACK_FONT).family;
}

export function getFontLabel(fontId?: string) {
  if (fontId === "serif") return "Georgia";
  return (FONT_OPTIONS.find((font) => font.id === fontId) ?? FALLBACK_FONT).label;
}
