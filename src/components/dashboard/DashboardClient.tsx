"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AuthUser } from "@/lib/auth";
import { Plus, FileText, Trash2, Edit2, LogOut } from "lucide-react";
import { useCVStore } from "@/store/cv-store";
import { TEMPLATES } from "@/lib/templates";
import type { CVRecord } from "@/lib/cv-record";

interface Props {
  user: AuthUser;
}

export default function DashboardClient({ user }: Props) {
  const router = useRouter();
  const { loadCV, resetCV } = useCVStore();
  const [cvList, setCVList] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cvToDelete, setCvToDelete] = useState<CVRecord | null>(null);

  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cvs");
        if (res.ok) {
          const data = await res.json();
          setCVList(data.cvs || []);
        }
      } catch {
        console.error("CV yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleCreateNew = () => {
    resetCV();
    router.push("/templates");
  };

  const handleEdit = (cv: CVRecord) => {
    loadCV({
      id: cv.id,
      title: cv.title,
      templateId: cv.templateId,
      personalInfo: cv.personalInfo as Parameters<typeof loadCV>[0]["personalInfo"],
      sections: cv.sections as Parameters<typeof loadCV>[0]["sections"],
      sectionOrder: cv.sectionOrder as Parameters<typeof loadCV>[0]["sectionOrder"],
      theme: cv.theme as Parameters<typeof loadCV>[0]["theme"],
    });
    router.push("/editor");
  };

  const handleDelete = async () => {
    if (!cvToDelete) return;

    setDeletingId(cvToDelete.id);
    try {
      await fetch(`/api/cvs/${cvToDelete.id}`, { method: "DELETE" });
      setCVList((prev) => prev.filter((c) => c.id !== cvToDelete.id));
      setCvToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DC] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7A766E]">Merhaba, <span className="font-semibold text-[#2B2A28]">{user.displayName}</span></span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-[#7A766E] hover:text-[#2B2A28] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#2B2A28]" style={{ fontFamily: "'Fraunces', serif" }}>
              CV&apos;lerim
            </h1>
            <p className="text-[#7A766E] mt-1">Kayıtlı CV&apos;lerini yönet veya yeni bir tane oluştur.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B08D57] text-white font-semibold rounded-xl hover:bg-[#9a7a4a] transition-all hover:shadow-lg hover:shadow-[#B08D57]/25 hover:-translate-y-0.5 duration-200"
          >
            <Plus className="w-4 h-4" />
            Yeni CV Oluştur
          </button>
        </div>

        {/* CV List */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-[#E8E4DC]" />
            ))}
          </div>
        ) : cvList.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-[#B08D57]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <FileText className="w-10 h-10 text-[#B08D57]" />
            </div>
            <h2 className="text-xl font-semibold text-[#2B2A28] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              Henüz CV yok
            </h2>
            <p className="text-[#7A766E] mb-6">İlk CV&apos;ni oluşturmak için başla.</p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-[#B08D57] text-white font-semibold rounded-xl hover:bg-[#9a7a4a] transition-colors"
            >
              İlk CV&apos;mi Oluştur →
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvList.map((cv) => {
              const template = TEMPLATES.find((t) => t.id === cv.templateId) || TEMPLATES[0];
              const personalInfo = cv.personalInfo;
              const name = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") || "İsimsiz CV";

              return (
                <div key={cv.id} className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Preview bar */}
                  <div
                    className="h-24 flex items-center justify-center relative"
                    style={{ backgroundColor: template.previewBg }}
                  >
                    <div
                      className="w-14 h-20 rounded shadow-sm flex flex-col overflow-hidden"
                      style={{ backgroundColor: template.primaryColor }}
                    >
                      <div className="h-6 flex-shrink-0" style={{ backgroundColor: template.primaryColor }} />
                      <div className="flex-1 bg-white/90 p-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-0.5 bg-gray-300 rounded mb-0.5" style={{ width: `${70 + (i % 2) * 20}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ backgroundColor: template.primaryColor + "20", color: template.primaryColor }}>
                        {template.name}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-[#2B2A28] text-sm truncate">{cv.title}</h3>
                    <p className="text-xs text-[#7A766E] mt-0.5 truncate">{name}</p>
                    <p className="text-xs text-[#7A766E] mt-0.5">
                      {new Date(cv.updatedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(cv)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#B08D57] text-white text-xs font-semibold rounded-lg hover:bg-[#9a7a4a] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => setCvToDelete(cv)}
                      disabled={deletingId === cv.id}
                      className="p-2 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      aria-label={`${cv.title} CV'sini sil`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Create new card */}
            <button
              onClick={handleCreateNew}
              className="h-full min-h-[200px] rounded-2xl border-2 border-dashed border-[#E8E4DC] hover:border-[#B08D57] text-[#7A766E] hover:text-[#B08D57] flex flex-col items-center justify-center gap-3 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Yeni CV Oluştur</span>
            </button>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(cvToDelete)}
        title="CV silinsin mi?"
        description={`"${cvToDelete?.title || "Bu CV"}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        confirmLabel="CV'yi Sil"
        cancelLabel="Vazgeç"
        loading={Boolean(cvToDelete && deletingId === cvToDelete.id)}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deletingId) setCvToDelete(null);
        }}
      />
    </div>
  );
}
