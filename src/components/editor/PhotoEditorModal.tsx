"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CvPhotoSettings, PersonalInfo, PhotoShape } from "@/lib/cv-types";
import CVPhoto from "@/components/templates/CVPhoto";
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Square,
  Circle,
  RectangleHorizontal,
  RectangleVertical,
  X,
} from "lucide-react";

const SHAPES: Array<{ id: PhotoShape; label: string; icon: ReactNode }> = [
  { id: "circle", label: "Yuvarlak", icon: <Circle className="h-4 w-4" /> },
  { id: "square", label: "Kare", icon: <Square className="h-4 w-4" /> },
  { id: "rounded", label: "Yuvarlatılmış", icon: <Square className="h-4 w-4 rounded-sm" /> },
  { id: "portrait", label: "Dikey", icon: <RectangleVertical className="h-4 w-4" /> },
  { id: "landscape", label: "Yatay", icon: <RectangleHorizontal className="h-4 w-4" /> },
];

export const DEFAULT_PHOTO_SETTINGS: CvPhotoSettings = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: false,
  shape: "circle",
  borderRadius: 14,
  borderWidth: 0,
};

export default function PhotoEditorModal({
  photo,
  settings,
  onSave,
  onClose,
}: {
  photo: string;
  settings?: CvPhotoSettings;
  onSave: (settings: CvPhotoSettings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CvPhotoSettings>({ ...DEFAULT_PHOTO_SETTINGS, ...(settings ?? {}) });
  const previewInfo = useMemo<PersonalInfo>(() => ({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    birthDate: "",
    nationality: "",
    maritalStatus: "",
    militaryStatus: "",
    drivingLicense: "",
    summary: "",
    photo,
    photoSettings: draft,
  }), [draft, photo]);

  const update = (patch: Partial<CvPhotoSettings>) => setDraft((current) => ({ ...current, ...patch }));

  const range = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
  ) => (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-[#7A766E]">
        <span>{label}</span>
        <span className="font-medium text-[#2B2A28]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#B08D57]"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8E4DC] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2B2A28]">Fotoğraf Düzenle</h3>
            <p className="mt-1 text-xs text-[#7A766E]">Kırpma ve görünüm ayarları CV modelinde saklanır.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#7A766E] hover:bg-[#FAF9F6] hover:text-[#2B2A28]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[320px_1fr]">
          <div className="flex min-h-[420px] items-center justify-center bg-[#FAF9F6] p-8">
            <div className="rounded-2xl border border-[#E8E4DC] bg-white p-8 shadow-sm">
              <CVPhoto personalInfo={previewInfo} width={180} height={180} fallbackRadius="50%" border="3px solid rgba(176,141,87,0.35)" />
            </div>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 scrollbar-thin">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#2B2A28]">Fotoğraf şekli</label>
              <div className="grid grid-cols-2 gap-2">
                {SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => update({ shape: shape.id })}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      draft.shape === shape.id
                        ? "border-[#B08D57] bg-[#B08D57]/10 text-[#B08D57]"
                        : "border-[#E8E4DC] text-[#7A766E] hover:border-[#B08D57]/50"
                    }`}
                  >
                    {shape.icon}
                    {shape.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2B2A28]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Kırpma
              </div>
              {range("Yakınlaştır", draft.scale, 0.6, 2.4, 0.05, (value) => update({ scale: value }))}
              {range("Yatay konum", draft.offsetX, -80, 80, 1, (value) => update({ offsetX: value }))}
              {range("Dikey konum", draft.offsetY, -80, 80, 1, (value) => update({ offsetY: value }))}
              {range("Döndür", draft.rotation, -180, 180, 1, (value) => update({ rotation: value }))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => update({ flipHorizontal: !draft.flipHorizontal })}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${draft.flipHorizontal ? "border-[#B08D57] text-[#B08D57]" : "border-[#E8E4DC] text-[#7A766E]"}`}
              >
                <FlipHorizontal className="h-4 w-4" /> Yatay çevir
              </button>
              <button
                onClick={() => update({ flipVertical: !draft.flipVertical })}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${draft.flipVertical ? "border-[#B08D57] text-[#B08D57]" : "border-[#E8E4DC] text-[#7A766E]"}`}
              >
                <FlipVertical className="h-4 w-4" /> Dikey çevir
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#2B2A28]">Renk ve kenarlık</div>
              {range("Parlaklık", draft.brightness, 50, 150, 1, (value) => update({ brightness: value }))}
              {range("Kontrast", draft.contrast, 50, 150, 1, (value) => update({ contrast: value }))}
              {range("Doygunluk", draft.saturation, 0, 180, 1, (value) => update({ saturation: value }))}
              {range("Köşe yarıçapı", draft.borderRadius, 0, 48, 1, (value) => update({ borderRadius: value }))}
              {range("Kenarlık", draft.borderWidth, 0, 8, 1, (value) => update({ borderWidth: value }))}
              <label className="flex items-center gap-2 text-sm text-[#7A766E]">
                <input
                  type="checkbox"
                  checked={draft.grayscale}
                  onChange={(event) => update({ grayscale: event.target.checked })}
                  className="accent-[#B08D57]"
                />
                Siyah-beyaz filtre
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E8E4DC] px-5 py-4">
          <button
            onClick={() => setDraft(DEFAULT_PHOTO_SETTINGS)}
            className="flex items-center gap-2 rounded-lg border border-[#E8E4DC] px-4 py-2 text-sm font-semibold text-[#7A766E] hover:border-[#B08D57]"
          >
            <RotateCcw className="h-4 w-4" /> Varsayılana sıfırla
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-[#E8E4DC] px-4 py-2 text-sm font-semibold text-[#2B2A28] hover:border-[#B08D57]">
              İptal
            </button>
            <button onClick={() => onSave(draft)} className="flex items-center gap-2 rounded-lg bg-[#B08D57] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a7a4a]">
              <RotateCw className="h-4 w-4" /> Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
