import { redirect } from "next/navigation";
import AuthHeroScene from "@/components/auth/AuthHeroScene";
import BrandLogo from "@/components/brand/BrandLogo";
import { getSession } from "@/lib/session";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const user = await getSession();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F3EA] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-12">
        <section className="relative flex min-h-[430px] flex-col overflow-hidden rounded-[28px] border border-[#E4D9C8] bg-[#EFE7DA] p-6 shadow-[0_30px_80px_rgba(43,42,40,0.10)] sm:min-h-[520px] sm:p-8 lg:min-h-[720px]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(43,42,40,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(43,42,40,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="relative z-10">
            <BrandLogo />
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center">
            <div className="h-[300px] w-full max-w-[520px] sm:h-[390px] lg:h-[500px] lg:max-w-[620px]">
              <AuthHeroScene />
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#B08D57]">
              Profesyonel CV Alanı
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[#2B2A28] sm:text-4xl" style={{ fontFamily: "'Fraunces', serif" }}>
              CV çalışmalarını güvenli ve düzenli bir alanda sürdür.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#6F685D] sm:text-base">
              Şablonlarını, düzenlemelerini ve PDF çıktını tek bir yerde yönet; kaldığın yerden devam et.
            </p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-[460px] flex-col justify-center">
          <LoginForm />
        </section>
      </main>
    </div>
  );
}
