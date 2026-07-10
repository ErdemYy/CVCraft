"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import { AuthUser } from "@/lib/auth";
import { TEMPLATES, CATEGORY_LABELS, type Template } from "@/lib/templates";
import { useCVStore } from "@/store/cv-store";
import TemplatePreviewCard from "./TemplatePreviewCard";
import { ArrowLeft } from "lucide-react";

interface Props {
  user: AuthUser;
}

type Category = "all" | Template["category"];

export default function TemplatesClient({ user }: Props) {
  const router = useRouter();
  const { cv, setTemplate } = useCVStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedTemplate, setSelectedTemplate] = useState(cv.templateId);

  const categories: Category[] = ["all", "modern", "classic", "creative", "minimal"];

  const filtered = selectedCategory === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleUse = () => {
    setTemplate(selectedTemplate);
    router.push("/editor");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DC] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#7A766E] hover:text-[#2B2A28] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              CV&apos;lerime Dön
            </Link>
          </div>

          <BrandLogo />

          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <button
                onClick={handleUse}
                className="px-5 py-2 bg-[#B08D57] text-white font-semibold text-sm rounded-xl hover:bg-[#9a7a4a] transition-colors"
              >
                Bu Şablonu Kullan →
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2B2A28] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            Şablon Seç
          </h1>
          <p className="text-[#7A766E]">
            {cv.personalInfo.firstName ? `${cv.personalInfo.firstName}, ` : ""}bilgilerini sakladık — şablon değiştirmek verini etkilemez.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                selectedCategory === cat
                  ? "bg-[#2B2A28] text-white"
                  : "bg-white text-[#7A766E] border border-[#E8E4DC] hover:border-[#2B2A28]"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((template) => (
            <div key={template.id}>
              <TemplatePreviewCard
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => handleSelect(template.id)}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {selectedTemplate && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-[#E8E4DC] px-6 py-4 flex items-center gap-5">
              <div>
                <p className="text-xs text-[#7A766E]">Seçilen şablon</p>
                <p className="font-semibold text-[#2B2A28]">
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                </p>
              </div>
              <button
                onClick={handleUse}
                className="px-6 py-2.5 bg-[#B08D57] text-white font-semibold rounded-xl hover:bg-[#9a7a4a] transition-colors"
              >
                Editöre Geç →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
