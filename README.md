# CVCraft

Profesyonel CV oluşturma, şablon seçme, düzenleme ve PDF indirme akışını tek bir modern web uygulamasında birleştiren Next.js tabanlı CV platformu.

CVCraft; ATS uyumlu şablonlar, gerçek zamanlı önizleme, kayıtlı CV yönetimi, profesyonel 3D marka dili ve PDF export desteğiyle Vercel üzerinde canlıya alınmaya hazır bir MVP olarak hazırlanmıştır.

## Özellikler

- 10 profesyonel CV şablonu: Modern, Klasik, Yaratıcı, Minimal, ATS Pro, Executive, Corporate, Consultant, Editorial, Tech Focus
- Gerçek zamanlı CV önizleme ve şablonlar arası veri kaybı olmadan geçiş
- CV ön izlemesi üzerinden doğrudan metin düzenleme, seçili metne biçim uygulama ve bölüm sürükle-bırak
- Bölümleri ana alan ile yan sütun arasında sürükleyerek taşıma ve yan sütunu şablona göre sol/sağ konumlandırma
- Gelişmiş metin araç çubuğu: çalışan font arama, font, boyut, kalın, italik, altı çizili, üstü çizili, renk, hizalama, liste, girinti, satır ve harf aralığı
- Times New Roman dahil 20 profesyonel font seçeneği ve PDF uyumlu font fallback sistemi
- Kişisel bilgiler, deneyim, eğitim, yetenekler, diller, projeler, sertifikalar, referanslar ve ilgi alanları yönetimi
- Doğum tarihi, uyruk, medeni durum, askerlik durumu ve ehliyet gibi isteğe bağlı kişisel detay alanları
- Sürükle-bırak bölüm sıralama, özel bölüm ekleme, bölüm başlığı değiştirme, gizle/göster, çoğaltma ve silme işlemleri
- Virgül, noktalı virgül veya yeni satırla toplu içerik ekleme; yetenek/dil seviyesi ve isteğe bağlı madde işareti desteği
- Gelişmiş fotoğraf düzenleyici: kırpma, zoom, konum, döndürme, flip, filtre, şekil ve kenarlık ayarları
- 50 adımlı undo/redo geçmişi, manuel kaydetme akışı ve kaydedilmemiş değişiklik uyarısı
- Tema rengi, tipografi, yazı boyutu ve fotoğraf biçimi ayarları
- Dashboard üzerinden CV oluşturma, düzenleme ve profesyonel onay modalı ile silme
- Admin panelinde CV ve şablon kullanım görünümü
- PDF indirme öncesi profesyonel ön izleme ve onay akışı
- İçerik arttıkça otomatik uzayan A4 ön izleme, sayfa sınırı göstergeleri ve çok sayfalı pixel-perfect PDF export
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

`DATABASE_URL` verilmezse uygulama lokal geliştirme sırasında `.data/cvs.json` dosyasını kullanır. Vercel gibi serverless ortamlarda manuel `Kaydet` işlemi kullanıcıya ait cihaz deposuna güvenli biçimde geri döner ve kayıtlar `CV'lerim` ekranında kullanılmaya devam eder. Hesaplar ve cihazlar arasında kalıcı bulut kaydı için PostgreSQL bağlantısı önerilir.

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

PDF export için Vercel tarafında ek Chrome kurulumu gerekmez; uygulama yerel Chrome bulamazsa `@sparticuz/chromium` fallback kullanır. Yazdırma verisi sunucu belleğinde tutulmadığı için PDF akışı farklı Vercel function örneklerinde de çalışır.

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
- Serverless ortamda `.data` kalıcı değildir. Veritabanı yokken manuel cihaz kaydı devreye girer; hesaplar ve cihazlar arasında bulut senkronizasyonu için `DATABASE_URL` gereklidir.
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
