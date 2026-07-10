"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthUser } from "@/lib/auth";
import { useCVStore } from "@/store/cv-store";
import { SECTION_LABELS, type SectionKey } from "@/lib/cv-types";
import CVRenderer from "@/components/templates/CVRenderer";
import PersonalInfoPanel from "./PersonalInfoPanel";
import SectionPanel from "./SectionPanel";
import ThemePanel from "./ThemePanel";
import SectionOrderPanel from "./SectionOrderPanel";
import {
  ChevronLeft, Save, Download, Palette, List, User, ArrowLeftRight, Loader2,
  LayoutTemplate
} from "lucide-react";
import { TEMPLATES } from "@/lib/templates";

interface Props {
  user: AuthUser;
}

type LeftTab = "personal" | "sections" | "order" | "theme";

const SECTION_KEYS: SectionKey[] = [
  "experience", "education", "skills", "languages", "projects", "certificates", "references"
];

const SECTION_ICONS: Record<SectionKey, string> = {
  experience: "💼",
  education: "🎓",
  skills: "⚡",
  languages: "🌐",
  projects: "🚀",
  references: "👥",
  certificates: "🏆",
};

export default function EditorClient({ user }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cv, setTemplate, isDirty, markSaved, setTitle, loadCV } = useCVStore();

  const [leftTab, setLeftTab] = useState<LeftTab>("personal");
  const [activeSection, setActiveSection] = useState<SectionKey>("experience");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [exportError, setExportError] = useState("");
  const [titleEditing, setTitleEditing] = useState(false);
  const previewScale = 0.55;

  // Apply template from URL param if fresh
  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) {
      setTemplate(templateParam);
    }
  }, [searchParams, setTemplate]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        title: cv.title,
        templateId: cv.templateId,
        personalInfo: cv.personalInfo,
        sections: cv.sections,
        sectionOrder: cv.sectionOrder,
        theme: cv.theme,
      };

      const saveRequest = (method: "POST" | "PUT", url: string) =>
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

      let res = cv.id
        ? await saveRequest("PUT", `/api/cvs/${cv.id}`)
        : await saveRequest("POST", "/api/cvs");

      if (res.status === 404 && cv.id) {
        res = await saveRequest("POST", "/api/cvs");
      }

      if (res.ok) {
        const data = await res.json();
        if (data.cv) {
          loadCV(data.cv);
        } else {
          markSaved();
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error || "CV kaydedilemedi.");
      }
    } catch {
      setSaveError("CV kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setExportError("");
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: cv }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const firstName = cv.personalInfo.firstName || "";
        const lastName = cv.personalInfo.lastName || "";
        const name = firstName || lastName
          ? `${firstName}_${lastName}_CV`.replace(/\s+/g, "_")
          : "CV";
        a.href = url;
        a.download = `${name}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const data = await res.json().catch(() => null);
        setExportError(data?.error || "PDF oluşturulamadı.");
      }
    } catch {
      setExportError("PDF oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setExporting(false);
    }
  };

  const currentTemplate = TEMPLATES.find((t) => t.id === cv.templateId) || TEMPLATES[0];

  return (
    <div className="h-screen flex flex-col bg-[#FAF9F6] overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E8E4DC] h-14 flex items-center px-4 gap-4 flex-shrink-0 z-30">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-[#7A766E] hover:text-[#2B2A28] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Geri</span>
        </Link>

        <div className="w-px h-5 bg-[#E8E4DC]" />

        {/* CV Title */}
        <div className="flex-1 min-w-0">
          {titleEditing ? (
            <input
              autoFocus
              type="text"
              value={cv.title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
              className="text-sm font-semibold text-[#2B2A28] bg-transparent border-b border-[#B08D57] outline-none w-full max-w-xs"
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              className="text-sm font-semibold text-[#2B2A28] hover:text-[#B08D57] transition-colors truncate max-w-xs"
              title="Başlığı düzenle"
            >
              {cv.title}
            </button>
          )}
        </div>

        {/* Template pill */}
        <Link
          href="/templates"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E4DC] text-xs text-[#7A766E] hover:border-[#B08D57] hover:text-[#B08D57] transition-all"
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          {currentTemplate.name}
          <ArrowLeftRight className="w-3 h-3" />
        </Link>

        <span className="hidden lg:inline text-xs text-[#7A766E]">
          {user.displayName}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-[#7A766E] hidden sm:inline">Kaydedilmemiş değişiklikler</span>
          )}
          {saveSuccess && (
            <span className="text-xs text-green-600 font-medium">✓ Kaydedildi</span>
          )}
          {saveError && (
            <span className="hidden md:inline text-xs text-red-600 font-medium">{saveError}</span>
          )}
          {exportError && (
            <span className="hidden md:inline text-xs text-red-600 font-medium">{exportError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2B2A28] border border-[#E8E4DC] rounded-lg hover:border-[#B08D57] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Kaydet</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B08D57] text-white text-sm font-semibold rounded-lg hover:bg-[#9a7a4a] disabled:opacity-60 transition-all"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? "Hazırlanıyor..." : "PDF İndir"}
          </button>
        </div>
      </header>

      {/* Main editor layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-[#E8E4DC] flex flex-col overflow-hidden">
          {/* Tab navigation */}
          <div className="flex border-b border-[#E8E4DC] flex-shrink-0">
            {[
              { id: "personal" as const, icon: <User className="w-3.5 h-3.5" />, label: "Kişisel" },
              { id: "sections" as const, icon: <List className="w-3.5 h-3.5" />, label: "Bölümler" },
              { id: "order" as const, icon: <ArrowLeftRight className="w-3.5 h-3.5" />, label: "Sıra" },
              { id: "theme" as const, icon: <Palette className="w-3.5 h-3.5" />, label: "Tema" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors border-b-2 ${
                  leftTab === tab.id
                    ? "border-[#B08D57] text-[#B08D57] bg-[#B08D57]/5"
                    : "border-transparent text-[#7A766E] hover:text-[#2B2A28]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {leftTab === "personal" && <PersonalInfoPanel />}

            {leftTab === "sections" && (
              <div>
                {/* Section selector */}
                <div className="p-4 border-b border-[#E8E4DC]">
                  <p className="text-xs text-[#7A766E] mb-2">Düzenlenecek bölümü seç:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SECTION_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          activeSection === key
                            ? "bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/30"
                            : "bg-gray-50 text-[#7A766E] border border-transparent hover:border-gray-200"
                        }`}
                      >
                        <span>{SECTION_ICONS[key]}</span>
                        <span className="truncate">{SECTION_LABELS[key]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <SectionPanel sectionKey={activeSection} />
              </div>
            )}

            {leftTab === "order" && <SectionOrderPanel />}
            {leftTab === "theme" && <ThemePanel />}
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-[#EDEAE3] flex flex-col items-center py-8 px-4">
          <div className="mb-4 flex items-center gap-2 text-xs text-[#7A766E]">
            <span>A4 Önizleme</span>
            <span className="px-2 py-0.5 bg-white rounded-full border border-[#E8E4DC]">
              Gerçek boyut: 794 × 1123px
            </span>
          </div>

          {/* CV Preview */}
          <div
            className="shadow-2xl rounded overflow-hidden flex-shrink-0"
            style={{
              width: `${794 * previewScale}px`,
              height: `${1123 * previewScale}px`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transformOrigin: "top left",
                transform: `scale(${previewScale})`,
                width: "794px",
                pointerEvents: "none",
              }}
            >
              <CVRenderer cv={cv} />
            </div>
          </div>

          {/* Scroll hint */}
          <p className="mt-4 text-xs text-[#7A766E] opacity-60">
            PDF çıktısı ekrandaki görünümle birebir aynı olacak
          </p>
        </div>
      </div>
    </div>
  );
}
