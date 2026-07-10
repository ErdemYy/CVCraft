"use client";

import { useState } from "react";
import { CATEGORY_LABELS, Template } from "@/lib/templates";
import { cn } from "@/lib/cn";

interface Props {
  template: Template;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function TemplatePreviewCard({ template, isSelected, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300",
        "border-2",
        isSelected
          ? "border-[#B08D57] shadow-lg shadow-[#B08D57]/20"
          : "border-transparent hover:border-[#B08D57]/40",
        hovered && "scale-[1.02]"
      )}
      style={{
        transform: hovered
          ? `perspective(800px) rotateY(${hovered ? "3" : "0"}deg) scale(1.02)`
          : "perspective(800px) rotateY(0deg) scale(1)",
        transition: "transform 0.3s ease, border-color 0.2s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* A4 Preview */}
      <div
        className="relative"
        style={{
          aspectRatio: "210/297",
          backgroundColor: template.previewBg,
          overflow: "hidden",
        }}
      >
        {/* Template preview mockup */}
        <TemplateMockup template={template} />

        {/* Overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-300",
            hovered ? "opacity-100 bg-black/40" : "opacity-0"
          )}
        >
          <button
            className="px-5 py-2 bg-[#B08D57] text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-[#9a7a4a] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Bu Şablonu Kullan
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[#2B2A28] text-sm">{template.name}</div>
            <div className="text-xs text-[#7A766E] mt-0.5">{CATEGORY_LABELS[template.category]}</div>
          </div>
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: template.primaryColor }}
          />
        </div>
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#B08D57] rounded-full flex items-center justify-center">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function TemplateMockup({ template }: { template: Template }) {
  if (template.id === "modern") {
    return (
      <div className="w-full h-full flex" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Sidebar */}
        <div className="flex-shrink-0" style={{ width: "35%", backgroundColor: template.primaryColor, padding: "12px 8px" }}>
          <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-3" />
          <div className="h-2 bg-white/70 rounded mb-1 mx-2" />
          <div className="h-1.5 bg-white/40 rounded mb-4 mx-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1 bg-white/30 rounded mb-1.5 mx-1" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
          <div className="mt-3 mb-1 h-1.5 bg-white/50 rounded mx-1" style={{ width: "60%" }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-1.5 mx-1">
              <div className="h-1 bg-white/25 rounded mb-0.5" style={{ width: `${80 + (i % 2) * 10}%` }} />
              <div className="h-0.5 bg-white/50 rounded" />
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 p-3">
          <div className="h-1.5 mb-1 rounded" style={{ backgroundColor: template.primaryColor, width: "40%", opacity: 0.6 }} />
          <div className="h-0.5 mb-2 rounded" style={{ backgroundColor: template.primaryColor, opacity: 0.3 }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1 bg-gray-200 rounded mb-1.5" style={{ width: `${90 - i * 10}%` }} />
          ))}
          <div className="mt-3 h-1.5 mb-1 rounded" style={{ backgroundColor: template.primaryColor, width: "40%", opacity: 0.6 }} />
          <div className="h-0.5 mb-2 rounded" style={{ backgroundColor: template.primaryColor, opacity: 0.3 }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-1 bg-gray-200 rounded mb-1.5" style={{ width: `${85 - i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (template.id === "classic") {
    return (
      <div className="w-full h-full p-4" style={{ backgroundColor: "#fff" }}>
        <div className="text-center mb-2">
          <div className="h-3 rounded mx-auto mb-1" style={{ backgroundColor: template.primaryColor, width: "50%", opacity: 0.8 }} />
          <div className="h-1.5 bg-gray-200 rounded mx-auto mb-2" style={{ width: "35%" }} />
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1 bg-gray-200 rounded" style={{ width: "20%" }} />
            ))}
          </div>
        </div>
        <div className="h-0.5 mb-2" style={{ backgroundColor: template.primaryColor }} />
        {[...Array(3)].map((_, section) => (
          <div key={section} className="mb-2">
            <div className="h-1.5 rounded mb-1" style={{ backgroundColor: template.primaryColor, width: "30%", opacity: 0.7 }} />
            <div className="h-0.5 bg-gray-300 mb-1" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1 bg-gray-200 rounded mb-1" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (template.id === "creative") {
    return (
      <div className="w-full h-full flex" style={{ backgroundColor: "#1E1B4B" }}>
        <div className="flex-shrink-0" style={{ width: "38%", backgroundColor: "#312E81", padding: "10px 8px" }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{ backgroundColor: template.primaryColor, opacity: 0.6 }} />
          <div className="h-2 bg-white/50 rounded mb-1 mx-1" />
          <div className="h-1 mb-3" style={{ backgroundColor: template.primaryColor, opacity: 0.5, borderRadius: "2px" }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1 rounded mb-2 mx-1" style={{ backgroundColor: "rgba(199,210,254,0.3)", width: `${75 + (i % 2) * 15}%` }} />
          ))}
        </div>
        <div className="flex-1 p-3">
          <div className="h-1.5 rounded mb-1" style={{ backgroundColor: template.primaryColor, width: "50%", opacity: 0.7 }} />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-1 rounded mb-1.5" style={{ backgroundColor: "rgba(199,210,254,0.3)", width: `${85 - (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (template.id === "ats-pro") {
    return (
      <div className="w-full h-full p-4" style={{ backgroundColor: "#fff" }}>
        <div className="flex justify-between items-end gap-3 mb-3">
          <div className="flex-1">
            <div className="h-4 rounded mb-1" style={{ backgroundColor: template.accentColor, width: "70%" }} />
            <div className="h-1.5 rounded" style={{ backgroundColor: template.primaryColor, width: "52%", opacity: 0.75 }} />
          </div>
          <div className="space-y-1 w-[35%]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-0.5 bg-gray-300 rounded" style={{ width: `${100 - i * 12}%` }} />
            ))}
          </div>
        </div>
        <div className="h-0.5 mb-3" style={{ backgroundColor: template.primaryColor }} />
        {[...Array(5)].map((_, section) => (
          <div key={section} className="mb-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 rounded" style={{ backgroundColor: template.primaryColor, width: "24%" }} />
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-0.5 bg-gray-300 rounded mb-1" style={{ width: `${92 - i * 14}%` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (template.id === "executive") {
    return (
      <div className="w-full h-full p-4" style={{ backgroundColor: "#FDFCF9" }}>
        <div className="border-l-4 pl-2 mb-3" style={{ borderColor: template.primaryColor }}>
          <div className="h-4 rounded mb-1" style={{ backgroundColor: template.accentColor, width: "58%" }} />
          <div className="h-2 bg-gray-300 rounded" style={{ width: "42%" }} />
        </div>
        <div className="h-1 mb-3" style={{ backgroundColor: template.accentColor }} />
        {[...Array(4)].map((_, section) => (
          <div key={section} className="mb-3">
            <div className="h-1.5 rounded mb-1.5" style={{ backgroundColor: template.primaryColor, width: "34%" }} />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-0.5 bg-gray-300 rounded mb-1" style={{ width: `${90 - (i % 3) * 12}%` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (template.id === "corporate" || template.id === "consultant" || template.id === "tech-focus") {
    const sidebarBg = template.id === "consultant" ? "#F3E9D9" : template.id === "tech-focus" ? "#E9F5F8" : "#EEF3F3";
    return (
      <div className="w-full h-full flex" style={{ backgroundColor: template.previewBg }}>
        <div className="flex-shrink-0 p-3" style={{ width: "34%", backgroundColor: sidebarBg }}>
          <div className="h-1 rounded mb-3" style={{ backgroundColor: template.primaryColor, width: "34%" }} />
          <div className="h-3 rounded mb-1" style={{ backgroundColor: template.accentColor, width: "78%" }} />
          <div className="h-1.5 bg-gray-300 rounded mb-4" style={{ width: "60%" }} />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="mb-1.5">
              <div className="h-0.5 bg-gray-400/50 rounded mb-0.5" style={{ width: `${82 - (i % 3) * 10}%` }} />
              {i > 3 && <div className="h-0.5 rounded" style={{ backgroundColor: template.primaryColor, width: `${55 + (i % 2) * 20}%`, opacity: 0.55 }} />}
            </div>
          ))}
        </div>
        <div className="flex-1 p-3">
          <div className="h-1.5 rounded mb-1" style={{ backgroundColor: template.primaryColor, width: "44%" }} />
          <div className="h-px mb-2" style={{ backgroundColor: template.accentColor }} />
          {[...Array(4)].map((_, section) => (
            <div key={section} className="mb-2.5">
              <div className="h-1 rounded mb-1" style={{ backgroundColor: template.primaryColor, width: "32%", opacity: 0.8 }} />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-0.5 bg-gray-300 rounded mb-1" style={{ width: `${92 - i * 11}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (template.id === "editorial") {
    return (
      <div className="w-full h-full" style={{ backgroundColor: "#FFF9FB" }}>
        <div className="h-[30%] p-4 relative" style={{ backgroundColor: "#F3E5EB" }}>
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full border" style={{ borderColor: template.accentColor }} />
          <div className="h-1 rounded mb-2" style={{ backgroundColor: template.primaryColor, width: "30%" }} />
          <div className="h-4 rounded mb-1" style={{ backgroundColor: template.accentColor, width: "58%" }} />
          <div className="h-1.5 bg-gray-300 rounded" style={{ width: "42%" }} />
        </div>
        <div className="grid grid-cols-[1fr_34%] gap-3 p-4">
          <div>
            {[...Array(4)].map((_, section) => (
              <div key={section} className="mb-3">
                <div className="h-1 rounded mb-1" style={{ backgroundColor: template.primaryColor, width: "34%" }} />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-0.5 bg-gray-300 rounded mb-1" style={{ width: `${92 - i * 13}%` }} />
                ))}
              </div>
            ))}
          </div>
          <div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-0.5 bg-gray-300 rounded mb-1.5" style={{ width: `${92 - (i % 3) * 12}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Minimal
  return (
    <div className="w-full h-full p-5" style={{ backgroundColor: "#fff" }}>
      <div className="h-4 bg-black rounded mb-1" style={{ width: "45%" }} />
      <div className="h-2 bg-gray-300 rounded mb-1" style={{ width: "30%" }} />
      <div className="flex gap-2 mb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-1 bg-gray-200 rounded" style={{ width: "20%" }} />
        ))}
      </div>
      <div className="h-px bg-black mb-2" />
      {[...Array(4)].map((_, section) => (
        <div key={section} className="mb-2">
          <div className="h-1 bg-black rounded mb-1" style={{ width: "20%", opacity: 0.7 }} />
          <div className="h-px bg-gray-200 mb-1" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-0.5 bg-gray-300 rounded mb-1" style={{ width: `${90 - i * 15}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
