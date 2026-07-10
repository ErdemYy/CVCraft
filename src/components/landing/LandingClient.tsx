"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";
import { AuthUser } from "@/lib/auth";
import TemplatePreviewCard from "@/components/templates/TemplatePreviewCard";
import { TEMPLATES } from "@/lib/templates";
import { useRouter } from "next/navigation";

const FloatingCV = dynamic(() => import("./FloatingCV"), { ssr: false });

interface Props {
  user: AuthUser | null;
}

export default function LandingClient({ user }: Props) {
  const router = useRouter();

  const handleTemplateSelect = (templateId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/editor?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo className="min-w-0" />

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-[#7A766E]">Merhaba, {user.displayName}</span>
                {user.role === "admin" && (
                  <Link href="/admin" className="hidden sm:inline text-sm text-[#7A766E] hover:text-[#2B2A28] transition-colors">
                    Admin Panel
                  </Link>
                )}
                <Link href="/dashboard" className="px-3 sm:px-4 py-2 bg-[#B08D57] text-white text-sm font-semibold rounded-lg hover:bg-[#9a7a4a] transition-colors whitespace-nowrap">
                  CV&apos;lerim
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline text-sm text-[#7A766E] hover:text-[#2B2A28] transition-colors">
                  Giriş Yap
                </Link>
                <Link href="/login" className="px-3 sm:px-4 py-2 bg-[#B08D57] text-white text-sm font-semibold rounded-lg hover:bg-[#9a7a4a] transition-colors whitespace-nowrap">
                  <span className="sm:hidden">Başla</span>
                  <span className="hidden sm:inline">Ücretsiz Başla</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Text */}
          <div className="flex-1 max-w-xl w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B08D57]/10 rounded-full mb-6">
              <div className="w-1.5 h-1.5 bg-[#B08D57] rounded-full" />
              <span className="text-[#B08D57] text-xs font-semibold uppercase tracking-wider">Ücretsiz CV Oluşturucu</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B2A28] leading-[1.1] mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Dakikalar içinde
              <br />
              <span className="text-[#B08D57]">profesyonel</span>
              <br />
              CV&apos;ni oluştur
            </h1>

            <p className="text-[#7A766E] text-base sm:text-lg leading-relaxed mb-8">
              Şablon seç, bilgilerini gir ve PDF olarak indir. İşe alım yazılımları tarafından okunabilir, 
              görsel olarak çarpıcı CV&apos;ler — hiçbir tasarım bilgisi gerekmez.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="px-6 sm:px-7 py-3.5 bg-[#B08D57] text-white font-semibold rounded-xl text-center hover:bg-[#9a7a4a] transition-all hover:shadow-lg hover:shadow-[#B08D57]/25 hover:-translate-y-0.5 duration-200"
              >
                {user ? "CV'lerime Git →" : "Ücretsiz Başla →"}
              </Link>
              <a
                href="#templates"
                className="px-6 sm:px-7 py-3.5 border-2 border-[#2B2A28]/20 text-[#2B2A28] font-semibold rounded-xl text-center hover:border-[#B08D57] hover:text-[#B08D57] transition-all duration-200"
              >
                Şablonları Gör
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:flex sm:gap-8 mt-12 pt-8 border-t border-[#E8E4DC]">
              {[
                { num: String(TEMPLATES.length), label: "Profesyonel Şablon" },
                { num: "ATS", label: "Uyumlu PDF" },
                { num: "∞", label: "Ücretsiz İndirme" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-[#2B2A28]" style={{ fontFamily: "'Fraunces', serif" }}>{s.num}</div>
                  <div className="text-xs text-[#7A766E] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D CV */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="w-[280px] h-[350px] sm:w-[400px] sm:h-[500px] lg:w-[480px] lg:h-[580px]">
              <FloatingCV />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2B2A28] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Nasıl çalışır?
            </h2>
            <p className="text-[#7A766E]">3 adımda hazır CV</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "🎨",
                title: "Şablon Seç",
                desc: "ATS uyumlu, kurumsal, yaratıcı veya minimal profesyonel şablonlar arasından seçim yap.",
              },
              {
                step: "02",
                icon: "✏️",
                title: "Bilgilerini Gir",
                desc: "Gerçek zamanlı önizleme ile yazdıkça anında sonucu gör. Bölümleri istediğin sıraya dizebilirsin.",
              },
              {
                step: "03",
                icon: "📄",
                title: "PDF İndir",
                desc: "Pixel-perfect, metin seçilebilir ve ATS uyumlu PDF'i tek tıkla indir.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[#B08D57] tracking-[3px] mb-2">{item.step}</div>
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-[#2B2A28] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                      {item.title}
                    </h3>
                    <p className="text-[#7A766E] leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>
                {item.step !== "03" && (
                  <div className="hidden md:block absolute top-8 -right-4 text-[#E8E4DC] text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2B2A28] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Profesyonel Şablonlar
            </h2>
            <p className="text-[#7A766E]">Her sektör ve kariyer seviyesi için tasarlanmış şablonlar</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <TemplatePreviewCard
                key={template.id}
                template={template}
                onSelect={() => handleTemplateSelect(template.id)}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2B2A28] text-white font-semibold rounded-xl hover:bg-[#1a1a18] transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200"
            >
              Hemen Başla — Ücretsiz →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#2B2A28] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
                Veri kaybı yok, şablon değiştir özgürce
              </h2>
              <p className="text-[#7A766E] leading-relaxed mb-6">
                Bilgilerini bir kere gir; şablon değiştirmek sadece görünümü değiştirir. 
                Farklı şablonları sırayla dene, hangisinin daha iyi durduğuna karar ver — 
                hiçbir bilgiyi yeniden girmen gerekmez.
              </p>
              <ul className="space-y-3">
                {[
                  "Gerçek zamanlı önizleme",
                  "Sürükle-bırak bölüm sıralaması",
                  "Fotoğraf yükleme ve kırpma seçenekleri",
                  "Renk ve tipografi özelleştirme",
                  "ATS uyumlu metin seçilebilir PDF",
                  "Otomatik dosya adlandırma",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-[#2B2A28]">
                    <div className="w-5 h-5 bg-[#B08D57]/15 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" stroke="#B08D57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "⚡", title: "Anlık Önizleme", desc: "Yazdıkça CV'n güncellenir" },
                { icon: "🎯", title: "ATS Uyumlu", desc: "İşe alım yazılımları okuyabilir" },
                { icon: "🔒", title: "Güvenli", desc: "Veriler cihazında saklanır" },
                { icon: "📱", title: "Responsive", desc: "Her cihazda kullanılabilir" },
              ].map((f) => (
                <div key={f.title} className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E4DC]">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="font-semibold text-[#2B2A28] text-sm mb-1">{f.title}</div>
                  <div className="text-[#7A766E] text-xs">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2B2A28] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandLogo inverted />
          <p className="text-white/50 text-sm">© 2026 CVCraft. Tüm hakları saklıdır.</p>
          <Link href="/login" className="text-[#B08D57] text-sm hover:underline">Giriş Yap</Link>
        </div>
      </footer>
    </div>
  );
}
