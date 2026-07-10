"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { useCVStore } from "@/store/cv-store";

type AuthMode = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const resetCV = useCVStore((state) => state.resetCV);
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = mode === "login"
    ? {
        eyebrow: "Güvenli Oturum",
        title: "Hesabına giriş yap",
        description: "CV çalışmalarına kaldığın yerden devam et.",
      }
    : {
        eyebrow: "Yeni Hesap",
        title: "Kayıt oluştur",
        description: "Kayıt akışı güvenli hesap altyapısı ile birlikte aktif edilecek.",
      };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Giriş başarısız.");
        return;
      }

      resetCV();
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-[#E4D9C8] bg-white p-6 shadow-[0_28px_70px_rgba(43,42,40,0.12)] sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#B08D57]">
          {copy.eyebrow}
        </p>
        <h2 className="text-2xl font-bold text-[#2B2A28]" style={{ fontFamily: "'Fraunces', serif" }}>
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7A766E]">
          {copy.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#FAF9F6] border border-[#E8E4DC] p-1 mb-6">
        {[
          { id: "login" as const, label: "Giriş", icon: <LogIn className="w-4 h-4" /> },
          { id: "register" as const, label: "Kayıt", icon: <UserPlus className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id);
              setError("");
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              mode === tab.id
                ? "bg-white text-[#2B2A28] shadow-sm"
                : "text-[#7A766E] hover:text-[#2B2A28]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2B2A28] mb-1.5">
              Kullanıcı adı
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766E]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınız"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#E8E4DC] rounded-xl focus:outline-none focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/10 bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B2A28] mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766E]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreniz"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 text-sm border border-[#E8E4DC] rounded-xl focus:outline-none focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/10 bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A766E] hover:text-[#2B2A28] transition-colors"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#B08D57] text-white font-semibold rounded-xl hover:bg-[#9a7a4a] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[#B08D57]/25"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#E8E4DC] bg-[#FAF9F6] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#B08D57]/12 text-[#B08D57] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#2B2A28]">Kayıt altyapısı hazırlanıyor</h2>
                <p className="text-xs leading-relaxed text-[#7A766E] mt-1">
                  Hesap oluşturma akışı veritabanı bağlantısı ve güvenli parola saklama ile birlikte aktif edilecek.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 opacity-75">
            <div>
              <label className="block text-sm font-medium text-[#2B2A28] mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766E]" />
                <input
                  type="text"
                  disabled
                  placeholder="Adınız ve soyadınız"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-[#E8E4DC] rounded-xl bg-white text-[#7A766E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2B2A28] mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766E]" />
                <input
                  type="email"
                  disabled
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-[#E8E4DC] rounded-xl bg-white text-[#7A766E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2B2A28] mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766E]" />
                <input
                  type="password"
                  disabled
                  placeholder="En az 8 karakter"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-[#E8E4DC] rounded-xl bg-white text-[#7A766E]"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2B2A28]/12 text-[#7A766E] font-semibold rounded-xl cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            Kayıt Yakında Aktif
          </button>
        </div>
      )}
    </div>
  );
}
