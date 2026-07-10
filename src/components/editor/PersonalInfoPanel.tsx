/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { useCVStore } from "@/store/cv-store";
import { User, Mail, Phone, MapPin, Globe, Link, FileText, Camera, X, Calendar, BadgeCheck, HeartHandshake, ShieldCheck, Car } from "lucide-react";
import PhotoEditorModal, { DEFAULT_PHOTO_SETTINGS } from "@/components/editor/PhotoEditorModal";
import { handleListTextareaKeyDown } from "@/lib/text-list-utils";

export default function PersonalInfoPanel() {
  const { cv, setPersonalInfo } = useCVStore();
  const p = cv.personalInfo;
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);

  const readOriginalPhoto = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Fotoğraf okunamadı."));
      reader.readAsDataURL(file);
    });

  const optimizePhoto = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(imageUrl);

        const maxSize = 1600;
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Fotoğraf işlenemedi."));
          return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Fotoğraf işlenemedi."));
      };

      img.src = imageUrl;
    });

  const handlePhotoUpload = async (file: File) => {
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("Fotoğraf dosyası en fazla 8 MB olabilir.");
      return;
    }

    try {
      const optimized = await optimizePhoto(file);
      setPersonalInfo({ photo: optimized, photoSettings: { ...DEFAULT_PHOTO_SETTINGS, ...(p.photoSettings ?? {}) } });
      setPhotoEditorOpen(true);
    } catch {
      try {
        setPersonalInfo({ photo: await readOriginalPhoto(file), photoSettings: { ...DEFAULT_PHOTO_SETTINGS, ...(p.photoSettings ?? {}) } });
        setPhotoEditorOpen(true);
      } catch {
        setPhotoError("Fotoğraf yüklenemedi.");
      }
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-bold text-[#2B2A28] uppercase tracking-wider">Kişisel Bilgiler</h3>

      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <div
          className={`relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${
            isDragging ? "border-[#B08D57] bg-[#B08D57]/10" : "border-gray-300 hover:border-[#B08D57]"
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handlePhotoUpload(file);
          }}
        >
          {p.photo ? (
            <>
              <img src={p.photo} alt="Profil" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] text-gray-400 text-center leading-tight">Fotoğraf<br/>Ekle</span>
            </div>
          )}
        </div>
        {p.photo && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPhotoEditorOpen(true)}
              className="text-xs text-[#B08D57] hover:text-[#9a7a4a] flex items-center gap-1 font-semibold"
            >
              <Camera className="w-3 h-3" /> Düzenle
            </button>
            <button
              onClick={() => {
                setPhotoError("");
                setPersonalInfo({ photo: "", photoSettings: DEFAULT_PHOTO_SETTINGS });
              }}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Kaldır
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePhotoUpload(file);
          }}
        />
      </div>

      {photoError && (
        <p className="text-xs text-red-600 -mt-2">{photoError}</p>
      )}

      {photoEditorOpen && p.photo && (
        <PhotoEditorModal
          photo={p.photo}
          settings={p.photoSettings}
          onClose={() => setPhotoEditorOpen(false)}
          onSave={(photoSettings) => {
            setPersonalInfo({ photoSettings });
            setPhotoEditorOpen(false);
          }}
        />
      )}

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#7A766E] block mb-1">Ad</label>
          <input
            type="text"
            value={p.firstName}
            onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
            placeholder="Adınız"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-[#7A766E] block mb-1">Soyad</label>
          <input
            type="text"
            value={p.lastName}
            onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
            placeholder="Soyadınız"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Ünvan / Pozisyon</label>
        <input
          type="text"
          value={p.title}
          onChange={(e) => setPersonalInfo({ title: e.target.value })}
          placeholder="Yazılım Geliştirici"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
        />
      </div>

      <div>
        <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> E-posta</label>
        <input
          type="email"
          value={p.email}
          onChange={(e) => setPersonalInfo({ email: e.target.value })}
          placeholder="ornek@email.com"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</label>
          <input
            type="tel"
            value={p.phone}
            onChange={(e) => setPersonalInfo({ phone: e.target.value })}
            placeholder="+90 5xx xxx xx xx"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Konum</label>
          <input
            type="text"
            value={p.location}
            onChange={(e) => setPersonalInfo({ location: e.target.value })}
            placeholder="İstanbul, Türkiye"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Web Sitesi</label>
        <input
          type="url"
          value={p.website}
          onChange={(e) => setPersonalInfo({ website: e.target.value })}
          placeholder="https://portfolyo.com"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Link className="w-3 h-3" /> LinkedIn</label>
          <input
            type="text"
            value={p.linkedin}
            onChange={(e) => setPersonalInfo({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Link className="w-3 h-3" /> GitHub</label>
          <input
            type="text"
            value={p.github}
            onChange={(e) => setPersonalInfo({ github: e.target.value })}
            placeholder="github.com/..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-[#2B2A28] uppercase tracking-wider">Kişisel Detaylar</h4>
          <span className="text-[10px] text-[#7A766E]">İsteğe bağlı</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Doğum Tarihi</label>
            <input
              type="date"
              value={p.birthDate ?? ""}
              onChange={(e) => setPersonalInfo({ birthDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Uyruk</label>
            <input
              type="text"
              value={p.nationality ?? ""}
              onChange={(e) => setPersonalInfo({ nationality: e.target.value })}
              placeholder="T.C."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><HeartHandshake className="w-3 h-3" /> Medeni Durum</label>
            <select
              value={p.maritalStatus ?? ""}
              onChange={(e) => setPersonalInfo({ maritalStatus: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
            >
              <option value="">Seçiniz</option>
              <option value="Bekar">Bekar</option>
              <option value="Evli">Evli</option>
              <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Askerlik Durumu</label>
            <select
              value={p.militaryStatus ?? ""}
              onChange={(e) => setPersonalInfo({ militaryStatus: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
            >
              <option value="">Seçiniz</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="Muaf">Muaf</option>
              <option value="Tecilli">Tecilli</option>
              <option value="Yapılmadı">Yapılmadı</option>
              <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><Car className="w-3 h-3" /> Ehliyet</label>
          <input
            type="text"
            value={p.drivingLicense ?? ""}
            onChange={(e) => setPersonalInfo({ drivingLicense: e.target.value })}
            placeholder="B sınıfı"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[#7A766E] block mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Özet / Hakkımda</label>
        <textarea
          value={p.summary}
          onChange={(e) => setPersonalInfo({ summary: e.target.value })}
          onKeyDown={(event) => handleListTextareaKeyDown(event, (value) => setPersonalInfo({ summary: value }))}
          placeholder="Kendinizi kısaca tanıtın..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#B08D57] bg-white resize-none"
        />
      </div>
    </div>
  );
}
