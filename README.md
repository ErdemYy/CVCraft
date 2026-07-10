# CVCraft

Profesyonel CV oluşturma, şablon seçme, düzenleme ve PDF indirme akışını tek bir modern web uygulamasında birleştiren Next.js tabanlı CV platformu.

CVCraft; ATS uyumlu şablonlar, gerçek zamanlı önizleme, kayıtlı CV yönetimi, profesyonel 3D marka dili ve PDF export desteğiyle Vercel üzerinde canlıya alınmaya hazır bir MVP olarak hazırlanmıştır.

## Özellikler

- 10 profesyonel CV şablonu: Modern, Klasik, Yaratıcı, Minimal, ATS Pro, Executive, Corporate, Consultant, Editorial, Tech Focus
- Gerçek zamanlı CV önizleme ve şablonlar arası veri kaybı olmadan geçiş
- Kişisel bilgiler, deneyim, eğitim, yetenekler, diller, projeler, sertifikalar ve referans yönetimi
- Bölüm sıralama, tema rengi, tipografi, yazı boyutu ve fotoğraf biçimi ayarları
- Dashboard üzerinden CV oluşturma, düzenleme ve profesyonel onay modalı ile silme
- Admin panelinde CV ve şablon kullanım görünümü
- Pixel-perfect PDF export
- Next.js App Router, React 19, TypeScript, Tailwind CSS 4 ve Zustand tabanlı modern frontend mimarisi
- PostgreSQL + Drizzle ORM desteği, lokal geliştirmede dosya tabanlı fallback
- Vercel uyumlu Chromium fallback ile PDF oluşturma

## Teknoloji Stack

| Katman | Teknoloji |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| State | Zustand |
| 3D | Three.js |
| Form | React Hook Form, Zod |
| Database | PostgreSQL, Drizzle ORM |
| PDF | Puppeteer Core, @sparticuz/chromium |
| Tooling | TypeScript, ESLint |

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Uygulama varsayılan olarak şu adreste çalışır:

```bash
http://localhost:3000
```

## Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve canlı ortam için değerleri değiştirin.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
PUPPETEER_EXECUTABLE_PATH=""

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me"
ADMIN_DISPLAY_NAME="Admin"
USER_USERNAME="asrin"
USER_ALIAS="asrın"
USER_PASSWORD="change-me"
USER_DISPLAY_NAME="Kullanıcı"
```

`DATABASE_URL` verilmezse uygulama lokal geliştirme sırasında `.data/cvs.json` dosyasını kullanır. Vercel gibi serverless ortamlarda kalıcı veri için PostgreSQL bağlantısı önerilir.

## Veritabanı

PostgreSQL bağlantınızı `.env` veya Vercel Environment Variables içine ekledikten sonra tabloyu oluşturmak için:

```bash
npm run db:push
```

Drizzle şeması:

```bash
src/db/schema.ts
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Production build alır |
| `npm run start` | Production sunucusunu başlatır |
| `npm run lint` | ESLint kontrolü çalıştırır |
| `npm run typecheck` | TypeScript kontrolü çalıştırır |
| `npm run db:push` | Drizzle şemasını PostgreSQL veritabanına uygular |

## Vercel Deployment

1. Bu repoyu GitHub’a push edin.
2. Vercel panelinden `ErdemYy/CVCraft` reposunu import edin.
3. Framework preset olarak `Next.js` seçin.
4. Environment Variables bölümüne en az şu değerleri ekleyin:
   - `DATABASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `USER_USERNAME`
   - `USER_PASSWORD`
5. Veritabanı tablosunu oluşturmak için lokal terminalden aynı `DATABASE_URL` ile `npm run db:push` çalıştırın.
6. Deploy edin.

PDF export için Vercel tarafında ek Chrome kurulumu gerekmez; uygulama yerel Chrome bulamazsa `@sparticuz/chromium` fallback kullanır.

## Proje Yapısı

```text
src/
  app/                    App Router sayfaları ve API route'ları
  components/
    admin/                Admin panel bileşenleri
    auth/                 Giriş/kayıt ekranı ve 3D auth sahnesi
    brand/                Ortak CVCraft logo bileşeni
    common/               Ortak modal ve UI parçaları
    dashboard/            Kullanıcı dashboard ekranı
    editor/               CV editör panelleri
    landing/              Landing page ve 3D hero modeli
    templates/            CV şablon render bileşenleri
  db/                     Drizzle PostgreSQL bağlantısı ve şema
  lib/                    Auth, CV repository, template ve yardımcı fonksiyonlar
  store/                  Zustand CV store
```

## Üretim Notları

- Mevcut auth akışı MVP/prototip seviyesi için hazırlanmıştır. Canlı ortamda güçlü parolalar ve mümkünse gerçek auth sağlayıcısı kullanılmalıdır.
- Serverless ortamda `.data` kalıcı değildir; canlı kullanımda `DATABASE_URL` zorunlu kabul edilmelidir.
- PDF export node runtime üzerinde çalışır ve Puppeteer tabanlıdır.
- Şablonlar ortak `CVData` modeliyle çalışır; yeni şablon eklerken `src/lib/templates.ts` ve `src/components/templates/CVRenderer.tsx` birlikte güncellenmelidir.

## Kalite Kontrolleri

Bu sürümde aşağıdaki kontroller başarıyla çalıştırılmıştır:

```bash
npm run typecheck
npm run lint
npm run build
```

## Lisans

Bu proje için henüz açık kaynak lisansı tanımlanmamıştır.
