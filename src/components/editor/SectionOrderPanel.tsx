"use client";

import { useMemo, useState, type ComponentType, type DragEvent, type ReactNode } from "react";
import { useCVStore } from "@/store/cv-store";
import { type SectionId, type SectionKey } from "@/lib/cv-types";
import {
  SECTION_TYPE_OPTIONS,
  getEditableSectionIds,
  getSectionItemCount,
  getSectionTitle,
  isBuiltInSectionId,
  isSectionVisible,
} from "@/lib/section-utils";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  FolderKanban,
  GraduationCap,
  GripVertical,
  Heart,
  Languages,
  MoreVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

const SECTION_ICONS: Record<SectionKey, ComponentType<{ className?: string }>> = {
  experience: BriefcaseBusiness,
  education: GraduationCap,
  skills: Sparkles,
  languages: Languages,
  projects: FolderKanban,
  references: Users,
  certificates: Award,
  interests: Heart,
};

type SectionDropPosition = "before" | "after";
type DragOverState = { index: number; position: SectionDropPosition } | null;

export default function SectionOrderPanel() {
  const {
    cv,
    setSectionOrder,
    setSectionTitle,
    setSectionVisibility,
    addSection,
    duplicateSection,
    removeSection,
  } = useCVStore();
  const order = getEditableSectionIds(cv);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<DragOverState>(null);
  const [menuId, setMenuId] = useState<SectionId | null>(null);
  const [editingId, setEditingId] = useState<SectionId | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [selectedType, setSelectedType] = useState<SectionKey | "custom">("experience");
  const [customTitle, setCustomTitle] = useState("");
  const usedBuiltIns = useMemo(() => new Set(order.filter(isBuiltInSectionId)), [order]);

  const commitTitle = (sectionId: SectionId) => {
    setSectionTitle(sectionId, draftTitle);
    setEditingId(null);
    setDraftTitle("");
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(Math.max(0, Math.min(toIndex, newOrder.length)), 0, moved);
    setSectionOrder(newOrder);
  };

  const moveUp = (index: number) => moveSection(index, index - 1);
  const moveDown = (index: number) => moveSection(index, index + 1);

  const handleDragStart = (index: number) => setDragging(index);
  const resolveDropPosition = (event: DragEvent<HTMLElement>): SectionDropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    setDragOver({ index, position: resolveDropPosition(event) });
  };

  const handleDrop = (event: DragEvent<HTMLElement>, targetIndex: number) => {
    const position = resolveDropPosition(event);
    if (dragging !== null) {
      let insertIndex = targetIndex + (position === "after" ? 1 : 0);
      if (dragging < insertIndex) insertIndex -= 1;
      moveSection(dragging, insertIndex);
    }
    setDragging(null);
    setDragOver(null);
  };

  const availableOptions = SECTION_TYPE_OPTIONS.filter((option) => {
    if (option.id === "custom") return true;
    return !usedBuiltIns.has(option.id);
  });

  const selectedOption = availableOptions.some((option) => option.id === selectedType)
    ? selectedType
    : availableOptions[0]?.id ?? "custom";

  const handleAddSection = () => {
    const title = customTitle.trim();
    if (selectedOption === "custom" && !title) return;
    addSection(selectedOption, title);
    setCustomTitle("");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#2B2A28] uppercase tracking-wider mb-2">Bölümler</h3>
        <p className="text-xs text-[#7A766E]">
          Bölüm başlıklarını düzenleyin, görünürlüğü yönetin ve sıralamayı sürükleyerek değiştirin.
        </p>
      </div>

      <div className="rounded-lg border border-[#E8E4DC] bg-[#FAF9F6] p-3 space-y-2">
        <label className="text-xs font-semibold text-[#2B2A28]">Yeni bölüm ekle</label>
        <div className="flex gap-2">
          <select
            value={selectedOption}
            onChange={(event) => setSelectedType(event.target.value as SectionKey | "custom")}
            className="min-w-0 flex-1 px-3 py-2 text-sm border border-[#E8E4DC] rounded-lg bg-white focus:outline-none focus:border-[#B08D57]"
          >
            {availableOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={handleAddSection}
            disabled={selectedOption === "custom" && !customTitle.trim()}
            className="flex items-center justify-center w-10 rounded-lg bg-[#B08D57] text-white hover:bg-[#9a7a4a] disabled:opacity-40 transition-colors"
            title="Bölüm ekle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {selectedOption === "custom" && (
          <input
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAddSection();
            }}
            placeholder="Özel bölüm başlığı"
            className="w-full px-3 py-2 text-sm border border-[#E8E4DC] rounded-lg bg-white focus:outline-none focus:border-[#B08D57]"
          />
        )}
      </div>

      <div className="space-y-2">
        {order.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#E8E4DC] p-5 text-center text-sm text-[#7A766E]">
            Henüz aktif bölüm yok.
          </div>
        )}

        {order.map((sectionId, index) => {
          const visible = isSectionVisible(cv, sectionId);
          const count = getSectionItemCount(cv, sectionId);
          const Icon = isBuiltInSectionId(sectionId) ? SECTION_ICONS[sectionId] : BookOpen;
          const isMenuOpen = menuId === sectionId;

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
              className={`relative flex items-center gap-2 rounded-lg border-2 bg-white p-3 transition-all cursor-grab active:cursor-grabbing ${
                dragOver?.index === index
                  ? "border-[#B08D57] bg-[#B08D57]/5 scale-[1.01]"
                  : dragging === index
                    ? "border-dashed border-gray-300 opacity-60"
                    : visible
                      ? "border-gray-200 hover:border-gray-300"
                      : "border-gray-100 bg-gray-50 opacity-75"
              }`}
            >
              {dragOver?.index === index && (
                <div
                  className={`absolute left-2 right-2 h-0.5 rounded-full bg-[#B08D57] shadow-[0_0_0_3px_rgba(176,141,87,0.16)] ${
                    dragOver.position === "before" ? "-top-1" : "-bottom-1"
                  }`}
                />
              )}
              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Icon className="w-4 h-4 text-[#B08D57] flex-shrink-0" />

              <div className="min-w-0 flex-1">
                {editingId === sectionId ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={() => commitTitle(sectionId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitTitle(sectionId);
                      if (event.key === "Escape") {
                        setEditingId(null);
                        setDraftTitle("");
                      }
                    }}
                    className="w-full text-sm font-semibold text-[#2B2A28] bg-transparent border-b border-[#B08D57] outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[#2B2A28]">
                      {getSectionTitle(cv, sectionId)}
                    </span>
                    {!visible && <EyeOff className="w-3.5 h-3.5 text-[#7A766E] flex-shrink-0" />}
                  </div>
                )}
                <div className="mt-0.5 text-[11px] text-[#7A766E]">
                  {count} içerik
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(index)} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-[#B08D57] disabled:opacity-30" title="Yukarı taşı">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => moveDown(index)} disabled={index === order.length - 1} className="p-0.5 text-gray-400 hover:text-[#B08D57] disabled:opacity-30" title="Aşağı taşı">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setMenuId(isMenuOpen ? null : sectionId)}
                className="p-1.5 text-gray-400 hover:text-[#2B2A28] rounded-md hover:bg-gray-100"
                title="Bölüm işlemleri"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-2 top-12 z-20 w-44 rounded-lg border border-[#E8E4DC] bg-white shadow-xl py-1">
                  <MenuButton
                    icon={<Pencil className="w-3.5 h-3.5" />}
                    label="Başlığı değiştir"
                    onClick={() => {
                      setEditingId(sectionId);
                      setDraftTitle(getSectionTitle(cv, sectionId));
                      setMenuId(null);
                    }}
                  />
                  <MenuButton
                    icon={<Copy className="w-3.5 h-3.5" />}
                    label="Bölümü çoğalt"
                    onClick={() => {
                      duplicateSection(sectionId);
                      setMenuId(null);
                    }}
                  />
                  <MenuButton
                    icon={visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    label={visible ? "Bölümü gizle" : "Bölümü göster"}
                    onClick={() => {
                      setSectionVisibility(sectionId, !visible);
                      setMenuId(null);
                    }}
                  />
                  <div className="my-1 h-px bg-[#E8E4DC]" />
                  <MenuButton
                    danger
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    label="Bölümü sil"
                    onClick={() => {
                      removeSection(sectionId);
                      setMenuId(null);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-[#2B2A28] hover:bg-[#FAF9F6]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
