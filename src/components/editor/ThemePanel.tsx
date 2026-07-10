"use client";

import { useCVStore } from "@/store/cv-store";

const COLOR_PRESETS = [
  { label: "Bronz", value: "#B08D57" },
  { label: "Lacivert", value: "#1A3A5C" },
  { label: "Mor", value: "#4F46E5" },
  { label: "Yeşil", value: "#166534" },
  { label: "Kırmızı", value: "#991B1B" },
  { label: "Gri", value: "#374151" },
  { label: "Siyah", value: "#000000" },
  { label: "Teal", value: "#0F766E" },
];

export default function ThemePanel() {
  const { cv, setTheme } = useCVStore();
  const theme = cv.theme;

  return (
    <div className="space-y-5 p-4">
      <h3 className="text-sm font-bold text-[#2B2A28] uppercase tracking-wider">Tasarım Ayarları</h3>

      {/* Primary Color */}
      <div>
        <label className="text-xs text-[#7A766E] block mb-2">Ana Renk</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setTheme({ primaryColor: c.value })}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor: theme.primaryColor === c.value ? "#2B2A28" : "transparent",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => setTheme({ primaryColor: e.target.value })}
            className="w-10 h-8 rounded cursor-pointer border border-gray-200"
          />
          <input
            type="text"
            value={theme.primaryColor}
            onChange={(e) => setTheme({ primaryColor: e.target.value })}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white font-mono"
          />
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="text-xs text-[#7A766E] block mb-2">Yazı Tipi</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "inter", label: "Inter", desc: "Modern, sans-serif" },
            { id: "serif", label: "Georgia", desc: "Klasik, serif" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTheme({ fontFamily: f.id })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                theme.fontFamily === f.id
                  ? "border-[#B08D57] bg-[#B08D57]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-semibold text-[#2B2A28]" style={{ fontFamily: f.id === "serif" ? "Georgia, serif" : "Inter, sans-serif" }}>
                {f.label}
              </div>
              <div className="text-[10px] text-[#7A766E]">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-xs text-[#7A766E] block mb-2">Yazı Boyutu</label>
        <div className="flex gap-2">
          {[
            { id: "small", label: "Küçük" },
            { id: "medium", label: "Orta" },
            { id: "large", label: "Büyük" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setTheme({ fontSize: s.id })}
              className={`flex-1 py-2 text-xs rounded-lg border-2 transition-all ${
                theme.fontSize === s.id
                  ? "border-[#B08D57] bg-[#B08D57]/5 text-[#B08D57] font-semibold"
                  : "border-gray-200 text-[#7A766E] hover:border-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="text-xs text-[#7A766E] block mb-2">Boşluk</label>
        <div className="flex gap-2">
          {[
            { id: "compact", label: "Sıkışık" },
            { id: "normal", label: "Normal" },
            { id: "spacious", label: "Ferah" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setTheme({ spacing: s.id })}
              className={`flex-1 py-2 text-xs rounded-lg border-2 transition-all ${
                theme.spacing === s.id
                  ? "border-[#B08D57] bg-[#B08D57]/5 text-[#B08D57] font-semibold"
                  : "border-gray-200 text-[#7A766E] hover:border-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo shape */}
      <div>
        <label className="text-xs text-[#7A766E] block mb-2">Fotoğraf Şekli</label>
        <div className="flex gap-3">
          {[
            { id: "circle" as const, label: "Yuvarlak", shape: "rounded-full" },
            { id: "rounded" as const, label: "Oval", shape: "rounded-xl" },
            { id: "square" as const, label: "Kare", shape: "rounded-none" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setTheme({ photoShape: s.id })}
              className={`flex flex-col items-center gap-1.5 flex-1 p-2 rounded-lg border-2 transition-all ${
                theme.photoShape === s.id
                  ? "border-[#B08D57]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-8 h-8 bg-[#B08D57]/40 ${s.shape}`} />
              <span className="text-[10px] text-[#7A766E]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
