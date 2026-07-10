"use client";

import { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { SectionKey, SECTION_LABELS } from "@/lib/cv-types";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";

export default function SectionOrderPanel() {
  const { cv, setSectionOrder } = useCVStore();
  const order = cv.sectionOrder;
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSectionOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const handleDragStart = (index: number) => setDragging(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragging === null || dragging === targetIndex) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragging, 1);
    newOrder.splice(targetIndex, 0, moved);
    setSectionOrder(newOrder);
    setDragging(null);
    setDragOver(null);
  };

  const SECTION_ICONS: Record<SectionKey, string> = {
    experience: "💼",
    education: "🎓",
    skills: "⚡",
    languages: "🌐",
    projects: "🚀",
    references: "👥",
    certificates: "🏆",
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-[#2B2A28] uppercase tracking-wider mb-3">Bölüm Sıralaması</h3>
      <p className="text-xs text-[#7A766E] mb-4">Sürükleyerek veya ok tuşlarıyla bölümleri yeniden sıralayın.</p>

      <div className="space-y-2">
        {order.map((key, index) => (
          <div
            key={key}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 bg-white transition-all cursor-grab active:cursor-grabbing ${
              dragOver === index ? "border-[#B08D57] bg-[#B08D57]/5 scale-[1.02]" :
              dragging === index ? "border-dashed border-gray-300 opacity-50" :
              "border-gray-200 hover:border-gray-300"
            }`}
          >
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-base">{SECTION_ICONS[key]}</span>
            <span className="flex-1 text-sm font-medium text-[#2B2A28]">{SECTION_LABELS[key]}</span>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(index)} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-[#B08D57] disabled:opacity-30">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => moveDown(index)} disabled={index === order.length - 1} className="p-0.5 text-gray-400 hover:text-[#B08D57] disabled:opacity-30">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
