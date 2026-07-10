"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AuthUser } from "@/lib/auth";
import { LogOut, Users, FileText, LayoutTemplate, BarChart3, Trash2 } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import type { CVRecord } from "@/lib/cv-record";
import { useCVStore } from "@/store/cv-store";

interface Props {
  user: AuthUser;
}

export default function AdminClient({ user }: Props) {
  const router = useRouter();
  const resetCV = useCVStore((state) => state.resetCV);
  const [cvList, setCVList] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "cvs" | "templates">("overview");
  const [cvToDelete, setCvToDelete] = useState<CVRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCVs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cvs");
        if (res.ok) {
          const data = await res.json();
          setCVList(data.cvs || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllCVs();
  }, []);

  const handleDeleteCV = async () => {
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
    resetCV();
    router.push("/");
    router.refresh();
  };

  const templateStats = TEMPLATES.map((t) => ({
    ...t,
    count: cvList.filter((c) => c.templateId === t.id).length,
  }));

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DC] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="px-2 py-0.5 bg-[#B08D57]/10 text-[#B08D57] text-xs font-bold rounded-full uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7A766E]">{user.displayName}</span>
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2B2A28]" style={{ fontFamily: "'Fraunces', serif" }}>
            Admin Paneli
          </h1>
          <p className="text-[#7A766E] mt-1">Platform yönetimi ve istatistikler</p>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <FileText className="w-5 h-5" />, label: "Toplam CV", value: cvList.length, color: "#B08D57" },
            { icon: <Users className="w-5 h-5" />, label: "Kullanıcılar", value: 2, color: "#1A3A5C" },
            { icon: <LayoutTemplate className="w-5 h-5" />, label: "Şablonlar", value: TEMPLATES.length, color: "#4F46E5" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E8E4DC] p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + "15", color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-[#2B2A28]" style={{ fontFamily: "'Fraunces', serif" }}>{stat.value}</div>
              <div className="text-sm text-[#7A766E] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-[#E8E4DC] rounded-xl p-1 w-fit">
          {[
            { id: "overview" as const, label: "Genel Bakış", icon: <BarChart3 className="w-4 h-4" /> },
            { id: "cvs" as const, label: "Tüm CV'ler", icon: <FileText className="w-4 h-4" /> },
            { id: "templates" as const, label: "Şablonlar", icon: <LayoutTemplate className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#2B2A28] text-white"
                  : "text-[#7A766E] hover:text-[#2B2A28]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Template usage */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6">
              <h2 className="font-semibold text-[#2B2A28] mb-4">Şablon Kullanımı</h2>
              <div className="space-y-3">
                {templateStats.map((t) => (
                  <div key={t.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#2B2A28]">{t.name}</span>
                      <span className="text-[#7A766E]">{t.count} CV</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: cvList.length > 0 ? `${(t.count / cvList.length) * 100}%` : "0%",
                          backgroundColor: t.primaryColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {cvList.length === 0 && <p className="text-sm text-[#7A766E]">Henüz CV oluşturulmamış.</p>}
              </div>
            </div>

            {/* Users */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6">
              <h2 className="font-semibold text-[#2B2A28] mb-4">Kullanıcılar</h2>
              <div className="space-y-3">
                {[
                  { username: "admin", role: "Admin", id: "1" },
                  { username: "asrın", role: "Kullanıcı", id: "2" },
                ].map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#B08D57] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#2B2A28]">{u.username}</div>
                        <div className="text-xs text-[#7A766E]">{u.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#7A766E]">
                      {cvList.filter((c) => c.userId === u.id).length} CV
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cvs" && (
          <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#7A766E]">Yükleniyor...</div>
            ) : cvList.length === 0 ? (
              <div className="p-8 text-center text-[#7A766E]">Henüz CV oluşturulmamış.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E4DC] bg-[#FAF9F6]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#7A766E] uppercase tracking-wider">CV Adı</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#7A766E] uppercase tracking-wider">Kullanıcı</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#7A766E] uppercase tracking-wider">Şablon</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#7A766E] uppercase tracking-wider">Tarih</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#7A766E] uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {cvList.map((cv) => {
                    const personalInfo = cv.personalInfo;
                    const name = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") || "—";
                    const template = TEMPLATES.find((t) => t.id === cv.templateId);
                    return (
                      <tr key={cv.id} className="border-b border-[#E8E4DC] last:border-0 hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#2B2A28]">{cv.title}</div>
                          <div className="text-xs text-[#7A766E]">{name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#7A766E]">
                          {cv.userId === "1" ? "admin" : "asrın"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ backgroundColor: (template?.primaryColor || "#B08D57") + "20", color: template?.primaryColor || "#B08D57" }}>
                            {template?.name || cv.templateId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#7A766E]">
                          {new Date(cv.updatedAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setCvToDelete(cv)}
                            disabled={deletingId === cv.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`${cv.title} CV'sini sil`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                <div className="h-32 flex items-center justify-center" style={{ backgroundColor: template.previewBg }}>
                  <div
                    className="w-12 h-16 rounded shadow-sm"
                    style={{ backgroundColor: template.primaryColor, opacity: 0.6 }}
                  />
                </div>
                <div className="p-4">
                  <div className="font-semibold text-[#2B2A28]">{template.name}</div>
                  <div className="text-xs text-[#7A766E] mt-0.5 capitalize">{template.category}</div>
                  <div className="text-xs text-[#7A766E] mt-1">{templateStats.find((s) => s.id === template.id)?.count || 0} kullanım</div>
                  <div className="mt-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${template.supportsPhoto ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {template.supportsPhoto ? "📷 Fotoğraf" : "Fotoğrafsız"}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${template.twoColumn ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      {template.twoColumn ? "2 Sütun" : "1 Sütun"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cvToDelete)}
        title="CV kaydı silinsin mi?"
        description={`"${cvToDelete?.title || "Bu CV"}" yönetim panelinden kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        confirmLabel="Kaydı Sil"
        cancelLabel="Vazgeç"
        loading={Boolean(cvToDelete && deletingId === cvToDelete.id)}
        onConfirm={handleDeleteCV}
        onCancel={() => {
          if (!deletingId) setCvToDelete(null);
        }}
      />
    </div>
  );
}
