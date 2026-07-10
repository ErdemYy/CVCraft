"use client";

import { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import {
  type CertificateItem,
  type CustomSectionItem,
  type EducationItem,
  type ExperienceItem,
  type InterestItem,
  type LanguageItem,
  type ProjectItem,
  type ReferenceItem,
  type SectionId,
  type SkillItem,
} from "@/lib/cv-types";
import { getCustomSection, getSectionTitle, isBuiltInSectionId } from "@/lib/section-utils";
import { nanoid } from "@/lib/nanoid";
import { handleListTextareaKeyDown } from "@/lib/text-list-utils";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, EyeOff } from "lucide-react";

interface Props {
  sectionId: SectionId;
}

export default function SectionPanel({ sectionId }: Props) {
  const { cv, setSection, setCustomSectionItems } = useCVStore();
  const customSection = getCustomSection(cv, sectionId);
  const isBuiltIn = isBuiltInSectionId(sectionId);
  const items = isBuiltIn
    ? cv.sections[sectionId] as unknown[]
    : customSection?.items as unknown[] ?? [];
  const isVisible = cv.sections.sectionMeta[String(sectionId)]?.visible ?? true;
  const [expandedId, setExpandedId] = useState<string | null>(items[0] ? (items[0] as { id: string }).id : null);

  const persistItems = (nextItems: unknown[]) => {
    if (isBuiltIn) {
      setSection(sectionId, nextItems as never);
      return;
    }

    setCustomSectionItems(sectionId, nextItems as CustomSectionItem[]);
  };

  const addItem = () => {
    const base = { id: nanoid() };
    let newItem: unknown;

    if (!isBuiltIn) {
      newItem = { ...base, title: "", description: "" } as CustomSectionItem;
    } else {
      switch (sectionId) {
        case "experience":
          newItem = { ...base, company: "", position: "", startDate: "", endDate: "", current: false, location: "", description: "" } as ExperienceItem;
          break;
        case "education":
          newItem = { ...base, school: "", degree: "", field: "", startDate: "", endDate: "", current: false, gpa: "", description: "" } as EducationItem;
          break;
        case "skills":
          newItem = { ...base, name: "", level: 3 } as SkillItem;
          break;
        case "languages":
          newItem = { ...base, name: "", level: "B2" } as LanguageItem;
          break;
        case "projects":
          newItem = { ...base, name: "", description: "", url: "", technologies: "" } as ProjectItem;
          break;
        case "references":
          newItem = { ...base, name: "", title: "", company: "", email: "", phone: "" } as ReferenceItem;
          break;
        case "certificates":
          newItem = { ...base, name: "", issuer: "", date: "", url: "" } as CertificateItem;
          break;
        case "interests":
          newItem = { ...base, name: "" } as InterestItem;
          break;
      }
    }

    if (newItem) {
      persistItems([...items, newItem]);
      setExpandedId((newItem as { id: string }).id);
    }
  };

  const removeItem = (id: string) => {
    persistItems(items.filter((item) => (item as { id: string }).id !== id));
  };

  const updateItem = (id: string, data: Record<string, unknown>) => {
    persistItems(items.map((item) => {
      const current = item as { id: string };
      return current.id === id ? { ...current, ...data } : current;
    }));
  };

  const panelTitle = getSectionTitle(cv, sectionId);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#2B2A28] uppercase tracking-wider truncate">
            {panelTitle}
          </h3>
          {!isVisible && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[#7A766E]">
              <EyeOff className="h-3 w-3" />
              Ön izlemede gizli
            </div>
          )}
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-xs text-[#B08D57] hover:text-[#9a7a4a] font-semibold flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Ekle
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 text-sm text-[#7A766E] border border-dashed border-[#E8E4DC] rounded-lg">
          <p>Bu bölümde henüz içerik yok.</p>
          <button onClick={addItem} className="mt-2 text-[#B08D57] hover:underline text-xs">
            İlk öğeyi ekle
          </button>
        </div>
      )}

      {items.map((item) => {
        const current = item as Record<string, unknown> & { id: string };
        const isOpen = expandedId === current.id;

        return (
          <div key={current.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              onClick={() => setExpandedId(isOpen ? null : current.id)}
            >
              <GripVertical className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-[#2B2A28] truncate">
                {getItemLabel(sectionId, current)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(current.id); }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Öğeyi sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            </div>

            {isOpen && (
              <div className="p-3 space-y-3 border-t border-gray-100">
                <ItemForm sectionId={sectionId} item={current} onChange={(data) => updateItem(current.id, data)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getItemLabel(sectionId: SectionId, item: Record<string, unknown>): string {
  if (!isBuiltInSectionId(sectionId)) return (item.title as string) || "Yeni Özel İçerik";

  switch (sectionId) {
    case "experience": return (item.position as string) || (item.company as string) || "Yeni Deneyim";
    case "education": return (item.school as string) || "Yeni Eğitim";
    case "skills": return (item.name as string) || "Yeni Yetenek";
    case "languages": return (item.name as string) || "Yeni Dil";
    case "projects": return (item.name as string) || "Yeni Proje";
    case "references": return (item.name as string) || "Yeni Referans";
    case "certificates": return (item.name as string) || "Yeni Sertifika";
    case "interests": return (item.name as string) || "Yeni İlgi Alanı";
  }
}

interface ItemFormProps {
  sectionId: SectionId;
  item: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

function ItemForm({ sectionId, item, onChange }: ItemFormProps) {
  const input = (label: string, field: string, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs text-[#7A766E] block mb-1">{label}</label>
      <input
        type={type}
        value={(item[field] as string) || ""}
        onChange={(e) => onChange({ [field]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
      />
    </div>
  );

  const textarea = (label: string, field: string, placeholder = "") => (
    <div>
      <label className="text-xs text-[#7A766E] block mb-1">{label}</label>
      <textarea
        value={(item[field] as string) || ""}
        onChange={(e) => onChange({ [field]: e.target.value })}
        onKeyDown={(event) => handleListTextareaKeyDown(event, (value) => onChange({ [field]: value }))}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white resize-none"
      />
    </div>
  );

  if (!isBuiltInSectionId(sectionId)) {
    return (
      <>
        {input("Başlık", "title", "text", "Örn. Gönüllülük, Yayınlar")}
        {textarea("Açıklama", "description", "Bu bölüme ait bilgileri yazın...")}
      </>
    );
  }

  if (sectionId === "experience") {
    return (
      <>
        {input("Pozisyon", "position", "text", "Yazılım Geliştirici")}
        {input("Şirket", "company", "text", "ABC Teknoloji")}
        <div className="grid grid-cols-2 gap-3">
          {input("Başlangıç", "startDate", "text", "Ocak 2022")}
          {input("Bitiş", "endDate", "text", "Aralık 2023")}
        </div>
        <label className="flex items-center gap-2 text-sm text-[#7A766E] cursor-pointer">
          <input
            type="checkbox"
            checked={(item.current as boolean) || false}
            onChange={(e) => onChange({ current: e.target.checked, endDate: e.target.checked ? "" : item.endDate })}
            className="accent-[#B08D57]"
          />
          Devam ediyor
        </label>
        {input("Konum", "location", "text", "İstanbul, Türkiye")}
        {textarea("Açıklama", "description", "Görev ve sorumluluklarınız...")}
      </>
    );
  }

  if (sectionId === "education") {
    return (
      <>
        {input("Okul", "school", "text", "İstanbul Teknik Üniversitesi")}
        {input("Derece", "degree", "text", "Lisans")}
        {input("Bölüm", "field", "text", "Bilgisayar Mühendisliği")}
        <div className="grid grid-cols-2 gap-3">
          {input("Başlangıç", "startDate", "text", "2018")}
          {input("Bitiş", "endDate", "text", "2022")}
        </div>
        <label className="flex items-center gap-2 text-sm text-[#7A766E] cursor-pointer">
          <input
            type="checkbox"
            checked={(item.current as boolean) || false}
            onChange={(e) => onChange({ current: e.target.checked })}
            className="accent-[#B08D57]"
          />
          Devam ediyor
        </label>
        {input("GPA / Not", "gpa", "text", "3.5 / 4.0")}
        {textarea("Açıklama", "description", "Bitirme projesi, aktiviteler...")}
      </>
    );
  }

  if (sectionId === "skills") {
    return (
      <>
        {input("Yetenek Adı", "name", "text", "React, Node.js...")}
        <div>
          <label className="text-xs text-[#7A766E] block mb-1">
            Seviye: {["", "Başlangıç", "Temel", "Orta", "İleri", "Uzman"][(item.level as number) || 3]}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={(item.level as number) || 3}
            onChange={(e) => onChange({ level: parseInt(e.target.value, 10) })}
            className="w-full accent-[#B08D57]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>Başlangıç</span><span>Uzman</span>
          </div>
        </div>
      </>
    );
  }

  if (sectionId === "languages") {
    return (
      <>
        {input("Dil Adı", "name", "text", "İngilizce")}
        <div>
          <label className="text-xs text-[#7A766E] block mb-1">Seviye</label>
          <select
            value={(item.level as string) || "B2"}
            onChange={(e) => onChange({ level: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          >
            {["A1", "A2", "B1", "B2", "C1", "C2", "Ana Dil"].map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </>
    );
  }

  if (sectionId === "projects") {
    return (
      <>
        {input("Proje Adı", "name", "text", "Portfolyo Sitesi")}
        {input("Teknolojiler", "technologies", "text", "React, Next.js, Tailwind")}
        {textarea("Açıklama", "description", "Projeyi kısaca tanıtın...")}
        {input("Proje URL", "url", "url", "https://github.com/...")}
      </>
    );
  }

  if (sectionId === "references") {
    return (
      <>
        {input("Ad Soyad", "name", "text", "Dr. Ahmet Yılmaz")}
        {input("Unvan", "title", "text", "Kıdemli Yazılım Mimarı")}
        {input("Şirket", "company", "text", "ABC Teknoloji")}
        {input("E-posta", "email", "email", "ahmet@abc.com")}
        {input("Telefon", "phone", "tel", "+90 5xx xxx xx xx")}
      </>
    );
  }

  if (sectionId === "certificates") {
    return (
      <>
        {input("Sertifika Adı", "name", "text", "AWS Cloud Practitioner")}
        {input("Kurum", "issuer", "text", "Amazon Web Services")}
        {input("Tarih", "date", "text", "2023")}
        {input("URL", "url", "url", "https://...")}
      </>
    );
  }

  if (sectionId === "interests") {
    return <>{input("İlgi Alanı", "name", "text", "Ürün tasarımı, açık kaynak, koşu...")}</>;
  }

  return null;
}
