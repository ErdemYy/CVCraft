"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthUser } from "@/lib/auth";
import { useCVStore } from "@/store/cv-store";
import { type SectionColumn, type SectionId } from "@/lib/cv-types";
import { getEditableSectionIds, getSectionColumn, getSectionTitle, isSectionVisible } from "@/lib/section-utils";
import { deleteDeviceCV, saveDeviceCV } from "@/lib/device-cv-storage";
import CVRenderer from "@/components/templates/CVRenderer";
import PersonalInfoPanel from "./PersonalInfoPanel";
import SectionPanel from "./SectionPanel";
import ThemePanel from "./ThemePanel";
import SectionOrderPanel from "./SectionOrderPanel";
import RichTextToolbar from "./RichTextToolbar";
import {
  ChevronLeft, Save, Download, Palette, List, User, ArrowLeftRight, Loader2,
  LayoutTemplate
} from "lucide-react";
import { TEMPLATES } from "@/lib/templates";

interface Props {
  user: AuthUser;
}

type LeftTab = "personal" | "sections" | "order" | "theme";
type SaveStatus = "idle" | "saving" | "saved" | "device" | "error";

export default function EditorClient({ user }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    cv,
    setTemplate,
    isDirty,
    markSaved,
    setTitle,
    loadCV,
    setPersonalInfo,
    setSection,
    setCustomSectionItems,
    setSectionTitle,
    setSectionOrder,
    setSectionColumn,
    setTextStyle,
    setRichText,
    clearTextStyle,
    undo,
    redo,
    history,
  } = useCVStore();

  const [leftTab, setLeftTab] = useState<LeftTab>("personal");
  const [activeSection, setActiveSection] = useState<SectionId>("experience");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [exportError, setExportError] = useState("");
  const [titleEditing, setTitleEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [activeTextField, setActiveTextField] = useState<string | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(1123);
  const previewContentRef = useRef<HTMLDivElement | null>(null);
  const previewScale = 0.55;
  const previewPageCount = Math.max(1, Math.ceil(previewHeight / 1123));
  const editableSections = getEditableSectionIds(cv);
  const currentActiveSection = editableSections.includes(activeSection)
    ? activeSection
    : editableSections[0] ?? activeSection;

  // Apply template from URL param if fresh
  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) {
      setTemplate(templateParam);
    }
  }, [searchParams, setTemplate]);

  useEffect(() => {
    const content = previewContentRef.current;
    if (!content) return;

    const measure = () => {
      const documentElement = content.firstElementChild as HTMLElement | null;
      const nextHeight = Math.max(1123, content.scrollHeight, documentElement?.scrollHeight ?? 0);
      setPreviewHeight(Math.ceil(nextHeight));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    if (content.firstElementChild) observer.observe(content.firstElementChild);
    return () => observer.disconnect();
  }, [cv.templateId]);

  const activeTextStyle = useMemo(
    () => activeTextField
      ? cv.theme.textStyles[activeTextField] ?? {}
      : cv.theme.globalTextStyle ?? {},
    [activeTextField, cv.theme.globalTextStyle, cv.theme.textStyles],
  );

  const saveCV = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setSaving(true);
    setSaveStatus("saving");
    setSaveError("");

    const saveOnDevice = async () => {
      try {
        const localRecord = await saveDeviceCV(user.id, cv);
        loadCV(localRecord);
        setSaveStatus("device");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return true;
      } catch {
        setSaveStatus("error");
        setSaveError("CV kaydedilemedi. Tarayıcı depolama iznini kontrol edip tekrar deneyin.");
        return false;
      }
    };

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await saveOnDevice();
        return;
      }

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
        if (cv.id) await deleteDeviceCV(user.id, cv.id);
        if (data.cv) {
          loadCV(data.cv);
        } else {
          markSaved();
        }
        setSaveStatus("saved");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else if (res.status === 401) {
        setSaveStatus("error");
        setSaveError("Oturum süreniz doldu. Lütfen yeniden giriş yapın.");
        router.push("/login");
      } else {
        await saveOnDevice();
      }
    } catch {
      await saveOnDevice();
    } finally {
      if (!silent) setSaving(false);
    }
  }, [cv, loadCV, markSaved, router, user.id]);

  const handleSave = () => {
    void saveCV({ silent: false });
  };

  const handlePreviewFieldChange = useCallback((fieldId: string, value: string, html?: string) => {
    if (html) setRichText(fieldId, html);

    if (fieldId === "personal.fullName") {
      const parts = value.trim().split(/\s+/);
      setPersonalInfo({
        firstName: parts.slice(0, -1).join(" ") || parts[0] || "",
        lastName: parts.length > 1 ? parts.at(-1) ?? "" : "",
      });
      return;
    }

    if (fieldId.startsWith("personal.")) {
      const field = fieldId.replace("personal.", "") as keyof typeof cv.personalInfo;
      setPersonalInfo({ [field]: value } as never);
      return;
    }

    if (fieldId.startsWith("sectionTitle:")) {
      const sectionId = fieldId.replace("sectionTitle:", "");
      if (sectionId !== "summary") setSectionTitle(sectionId, value);
      return;
    }

    const customMatch = fieldId.match(/^custom:(.+):item:(.+):field:(.+)$/);
    if (customMatch) {
      const [, sectionId, itemId, field] = customMatch;
      const section = cv.sections.customSections.find((item) => item.id === sectionId);
      if (!section) return;
      setCustomSectionItems(sectionId, section.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ));
      return;
    }

    const sectionMatch = fieldId.match(/^section:(.+):item:(.+):field:(.+)$/);
    if (sectionMatch) {
      const [, sectionKey, itemId, field] = sectionMatch;
      if (!(sectionKey in cv.sections)) return;
      const items = cv.sections[sectionKey as keyof typeof cv.sections];
      if (!Array.isArray(items)) return;
      const updated = items.map((item) => {
        if (!("id" in item) || item.id !== itemId) return item;
        if (sectionKey === "education" && field === "degree") {
          const [degree, fieldName] = value.split(/\s+—\s+/, 2);
          return { ...item, degree: degree ?? "", field: fieldName ?? "" };
        }
        return { ...item, [field]: value };
      });
      setSection(sectionKey as never, updated as never);
    }
  }, [cv, setCustomSectionItems, setPersonalInfo, setRichText, setSection, setSectionTitle]);

  const handlePreviewSectionDrop = useCallback((sourceId: string, targetId: string, position: "before" | "after") => {
    if (sourceId === targetId) return;
    const currentOrder = [...cv.sectionOrder];
    const sourceIndex = currentOrder.indexOf(sourceId);
    const targetIndex = currentOrder.indexOf(targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const [moved] = currentOrder.splice(sourceIndex, 1);
    let insertIndex = targetIndex + (position === "after" ? 1 : 0);
    if (sourceIndex < insertIndex) insertIndex -= 1;
    currentOrder.splice(Math.max(0, Math.min(insertIndex, currentOrder.length)), 0, moved);
    setSectionColumn(sourceId, getSectionColumn(cv, targetId));
    setSectionOrder(currentOrder);
  }, [cv, setSectionColumn, setSectionOrder]);

  const handlePreviewColumnDrop = useCallback((sourceId: string, column: SectionColumn) => {
    setSectionColumn(sourceId, column);
  }, [setSectionColumn]);

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
          {saveStatus === "saving" && (
            <span className="text-xs text-[#7A766E] hidden sm:inline">Kaydediliyor</span>
          )}
          {saveSuccess && (
            <span className="text-xs text-green-600 font-medium">
              {saveStatus === "device" ? "Bu cihazda kaydedildi" : "Kaydedildi"}
            </span>
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
            onClick={() => setPdfPreviewOpen(true)}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B08D57] text-white text-sm font-semibold rounded-lg hover:bg-[#9a7a4a] disabled:opacity-60 transition-all"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? "Hazırlanıyor..." : "PDF İndir"}
          </button>
        </div>
      </header>

      <RichTextToolbar
        activeFieldId={activeTextField}
        style={activeTextStyle}
        onStyleChange={(patch) => setTextStyle(activeTextField ?? "__global", patch)}
        onClear={() => clearTextStyle(activeTextField ?? "__global")}
        onUndo={undo}
        onRedo={redo}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
      />

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
                    {editableSections.map((key) => {
                      const visible = isSectionVisible(cv, key);
                      return (
                      <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          currentActiveSection === key
                            ? "bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/30"
                            : "bg-gray-50 text-[#7A766E] border border-transparent hover:border-gray-200"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${visible ? "bg-[#B08D57]" : "bg-gray-300"}`} />
                        <span className="truncate">{getSectionTitle(cv, key)}</span>
                      </button>
                      );
                    })}
                  </div>
                </div>
                {editableSections.length > 0 ? (
                  <SectionPanel sectionId={currentActiveSection} />
                ) : (
                  <div className="p-4 text-sm text-[#7A766E]">Düzenlenecek bölüm bulunmuyor.</div>
                )}
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
              {previewPageCount === 1 ? "A4 · 1 sayfa" : `A4 · ${previewPageCount} sayfa`}
            </span>
          </div>

          {/* CV Preview */}
          <div
            className="shadow-2xl rounded flex-shrink-0 bg-white"
            style={{
              width: `${794 * previewScale}px`,
              height: `${previewHeight * previewScale}px`,
              position: "relative",
            }}
          >
            <div
              ref={previewContentRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transformOrigin: "top left",
                transform: `scale(${previewScale})`,
                width: "794px",
                pointerEvents: "auto",
              }}
            >
              <CVRenderer
                cv={cv}
                editable
                activeFieldId={activeTextField}
                onActiveFieldChange={setActiveTextField}
                onEditableFieldChange={handlePreviewFieldChange}
                onRichTextChange={setRichText}
                onSectionDrop={handlePreviewSectionDrop}
                onSectionColumnDrop={handlePreviewColumnDrop}
              />
            </div>
            {Array.from({ length: Math.max(0, previewPageCount - 1) }, (_, index) => (
              <div
                key={index}
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${(index + 1) * 1123 * previewScale}px`,
                  borderTop: "1px dashed rgba(43,42,40,0.28)",
                  zIndex: 15,
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>

          {/* Scroll hint */}
          <p className="mt-4 text-xs text-[#7A766E] opacity-60">
            PDF çıktısı ekrandaki görünümle birebir aynı olacak
          </p>
        </div>
      </div>

      {pdfPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] px-5 py-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#2B2A28]">PDF Ön İzleme</h3>
                <p className="mt-1 text-xs text-[#7A766E]">CV çıktısını kontrol edin, onayladığınızda PDF indirme başlar.</p>
              </div>
              <button
                onClick={() => setPdfPreviewOpen(false)}
                className="rounded-lg border border-[#E8E4DC] px-3 py-1.5 text-sm font-semibold text-[#2B2A28] hover:border-[#B08D57]"
              >
                Kapat
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#EDEAE3] p-6">
              <div className="mx-auto origin-top shadow-2xl" style={{ width: 794, minHeight: 1123 }}>
                <CVRenderer cv={cv} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#E8E4DC] px-5 py-4">
              <button
                onClick={() => setPdfPreviewOpen(false)}
                className="rounded-lg border border-[#E8E4DC] px-4 py-2 text-sm font-semibold text-[#2B2A28] hover:border-[#B08D57]"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setPdfPreviewOpen(false);
                  void handleExportPDF();
                }}
                disabled={exporting}
                className="flex items-center gap-2 rounded-lg bg-[#B08D57] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a7a4a] disabled:opacity-60"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Onayla ve İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
