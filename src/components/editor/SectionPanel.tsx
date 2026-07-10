"use client";

import { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import {
  ExperienceItem, EducationItem, SkillItem, LanguageItem,
  ProjectItem, ReferenceItem, CertificateItem, SectionKey, SECTION_LABELS
} from "@/lib/cv-types";
import { nanoid } from "@/lib/nanoid";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

interface Props {
  sectionKey: SectionKey;
}

export default function SectionPanel({ sectionKey }: Props) {
  const { cv, setSection } = useCVStore();
  const items = cv.sections[sectionKey] as unknown[];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addItem = () => {
    const base = { id: nanoid() };
    let newItem: unknown;

    switch (sectionKey) {
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
    }

    if (newItem) {
      const updated = [...items, newItem];
      setSection(sectionKey, updated as any);
      setExpandedId((newItem as { id: string }).id);
    }
  };

  const removeItem = (id: string) => {
    const updated = items.filter((item) => (item as { id: string }).id !== id);
    setSection(sectionKey, updated as any);
  };

  const updateItem = (id: string, data: Record<string, unknown>) => {
    const updated = items.map((item) => {
      const i = item as { id: string };
      return i.id === id ? { ...i, ...data } : i;
    });
    setSection(sectionKey, updated as any);
  };

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2B2A28] uppercase tracking-wider">
          {SECTION_LABELS[sectionKey]}
        </h3>
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-xs text-[#B08D57] hover:text-[#9a7a4a] font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Ekle
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 text-sm text-[#7A766E]">
          <p>Henüz içerik yok.</p>
          <button onClick={addItem} className="mt-2 text-[#B08D57] hover:underline text-xs">
            İlk öğeyi ekle →
          </button>
        </div>
      )}

      {items.map((item) => {
        const i = item as Record<string, unknown> & { id: string };
        const isOpen = expandedId === i.id;

        return (
          <div key={i.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Item header */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              onClick={() => setExpandedId(isOpen ? null : i.id)}>
              <GripVertical className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-[#2B2A28] truncate">
                {getItemLabel(sectionKey, i)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(i.id); }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            </div>

            {/* Item form */}
            {isOpen && (
              <div className="p-3 space-y-3 border-t border-gray-100">
                <ItemForm sectionKey={sectionKey} item={i} onChange={(data) => updateItem(i.id, data)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getItemLabel(key: SectionKey, item: Record<string, unknown>): string {
  switch (key) {
    case "experience": return (item.position as string) || (item.company as string) || "Yeni Deneyim";
    case "education": return (item.school as string) || "Yeni Eğitim";
    case "skills": return (item.name as string) || "Yeni Yetenek";
    case "languages": return (item.name as string) || "Yeni Dil";
    case "projects": return (item.name as string) || "Yeni Proje";
    case "references": return (item.name as string) || "Yeni Referans";
    case "certificates": return (item.name as string) || "Yeni Sertifika";
    default: return "Öğe";
  }
}

interface ItemFormProps {
  sectionKey: SectionKey;
  item: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

function ItemForm({ sectionKey, item, onChange }: ItemFormProps) {
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
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white resize-none"
      />
    </div>
  );

  if (sectionKey === "experience") {
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

  if (sectionKey === "education") {
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

  if (sectionKey === "skills") {
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
            onChange={(e) => onChange({ level: parseInt(e.target.value) })}
            className="w-full accent-[#B08D57]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>Başlangıç</span><span>Uzman</span>
          </div>
        </div>
      </>
    );
  }

  if (sectionKey === "languages") {
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
            {["A1", "A2", "B1", "B2", "C1", "C2", "Ana Dil"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </>
    );
  }

  if (sectionKey === "projects") {
    return (
      <>
        {input("Proje Adı", "name", "text", "Portfolyo Sitesi")}
        {input("Teknolojiler", "technologies", "text", "React, Next.js, Tailwind")}
        {textarea("Açıklama", "description", "Projeyi kısaca tanıtın...")}
        {input("Proje URL", "url", "url", "https://github.com/...")}
      </>
    );
  }

  if (sectionKey === "references") {
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

  if (sectionKey === "certificates") {
    return (
      <>
        {input("Sertifika Adı", "name", "text", "AWS Cloud Practitioner")}
        {input("Kurum", "issuer", "text", "Amazon Web Services")}
        {input("Tarih", "date", "text", "2023")}
        {input("URL", "url", "url", "https://...")}
      </>
    );
  }

  return null;
}
