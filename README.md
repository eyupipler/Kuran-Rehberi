# Kuran Rehberi

Kapsamlı bir Kuran araştırma platformu — kelime kökü analizi, çoklu meal, morfolojik arama ve karşılaştırma araçları.

> **Ana proje:** [eyupipler/Kuran-Rehberi](https://github.com/eyupipler/Kuran-Rehberi) — projenin sahibi ve asıl geliştiricisi.
> Bu sürüme [xRefunsen](https://github.com/xRefunsen) destek oldu: yenilenmiş arayüz ve tasarım sistemi, meal karşılaştırma,
> gelişmiş kök filtreleri, komut paleti, notlar ve koleksiyonlar, çevrimdışı okuma ve backend güvenlik sıkılaştırmaları.

---

## Özellikler

### Okuma
- **37 Türkçe, 6 İngilizce meal** (Diyanet, Elmalılı, Ahmed Hulusi, Süleyman Ateş, Şinasi Güneş, Hakkı Yılmaz, …)
- **Sure okuyucu** — sabit araç çubuğundan meal, Arapça görünüm, okunuş, yazı boyutu ve kompakt mod
- **Ayet aksiyonları** — favori, not, kopyala, bağlantı kopyala, paylaş, karşılaştır
- **Açık / koyu / sistem teması** — varsayılan açık tema, tercih tarayıcıda saklanır

### Araştırma
- **Kelime kökü analizi** — her kelimenin kökü ve Kuran'daki tüm kullanımları
- **Kök filtreleri** — sure, Mekki/Medeni, kelime türü ve kelime biçimi
- **Sure dağılımı grafiği** — kökün surelere göre yayılımı
- **Meal karşılaştırma** — 2–4 meali ayet sayfasında yan yana sabitleme
- **Ayet karşılaştırma** — iki ayeti yan yana inceleme, ortak kökleri görme
- **İlgili ayet şeması** — anlam bütünlüğü bağlantılarının halkasal görselleştirmesi, karşılıklı bağlantı işaretiyle
- **Kelime vurgulama** — seçilen Arapça kelimenin Türkçe karşılığı meal içinde işaretlenir

### Arama
- **Meal ve Arapça metin araması**, sure ve Mekki/Medeni filtreleriyle
- **URL'de saklanan sorgu** — arama sonucu bağlantısı paylaşılabilir
- **Komut paleti (Ctrl + K)** — `2:255`, `bakara 255`, `bakara`, `rahmet`, `رحمة`, `root:رحم`
- **Kök arama** — Arapça (`رسل`), Latin iskelet (`rsl`, `r-s-l`) veya Türkçe anlam (`elçi`)

### Kişisel çalışma alanı
- **Notlar** — başlık, içerik ve etiketler; etikete göre filtreleme
- **Favoriler ve koleksiyonlar** — favorileri kendi koleksiyonlarınıza ayırma
- **Okuma geçmişi** — "Okumaya devam et" ve son görüntülenen ayetler
- **JSON yedekleme** — tüm kişisel verileri dışa/içe aktarma

### PWA
- **Telefona kurulabilir** — ayarlar panelinden veya tarayıcı menüsünden
- **Çevrimdışı okuma** — daha önce açılan sureler ve ayetler bağlantı olmadan da okunabilir
- **Hızlı açılış** — uygulama kabuğu ve derleme çıktısı önbellekten servis edilir

---

## Veri Kaynakları

Tüm metin ve analizlerin kaynakları, lisansları ve doğruluk sınırları [SOURCES.md](SOURCES.md) dosyasında listelenmiştir.
Uygulama içinden `/kaynaklar` sayfasıyla da erişilebilir.

| Kaynak | İçerik | Lisans |
|--------|--------|--------|
| [Tanzil.net](https://tanzil.net) | Kuran metni, çeviriler | CC-BY 3.0 |
| [Quranic Arabic Corpus](https://corpus.quran.com) | Morfoloji, kelime kökleri | GNU GPL |
| [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) | Ek çeviriler | Unlicense |
| [apacikkuran.com](https://apacikkuran.com) | Şinasi Güneş çevirisi | — |

---

## Teknoloji

| Katman | Teknoloji | Not |
|--------|-----------|-----|
| Frontend | Next.js 14 App Router + TypeScript | `output: 'export'` → 8019 statik sayfa |
| Stil | Tailwind CSS | CSS değişkenli semantic token'lar, `darkMode: 'class'` |
| Backend | Node.js + Express | Render.com |
| Veritabanı | SQLite | better-sqlite3, yoksa sql.js'e düşer |
| Durum yönetimi | React Context + localStorage | Hesap/sunucu senkronizasyonu yok |

---

## Proje Yapısı

```
Kuran Rehberi/
├── data/                          # Çeviriler, morfoloji, ilgili ayetler
├── backend/
│   ├── .env.example
│   └── src/
│       ├── index.js               # Express sunucusu, güvenlik katmanı, hata yöneticisi
│       ├── middleware/
│       │   ├── security.js        # CORS allowlist, güvenlik başlıkları, CSP
│       │   ├── rateLimit.js       # Bellek içi istek sınırlayıcı
│       │   └── validate.js        # HttpError, parametre doğrulama
│       ├── routes/                # surahs, verses, search, roots
│       └── db/                    # şema, import ve zenginleştirme scriptleri
└── frontend/
    ├── public/
    │   ├── sw.js                  # Service worker (elle yazılmış, ek bağımlılık yok)
    │   ├── offline.html           # Çevrimdışı yedek sayfası
    │   └── manifest.json
    └── src/
        ├── app/                   # Rotalar ve metadata
        ├── components/
        │   ├── ui/                # Button, Card, Field, Modal, Tabs, DataState…
        │   └── layout/            # AppShell, Navbar, MobileNav, paneller
        ├── features/
        │   ├── quran/             # Sure listesi, meal seçimi, paylaşılan veri kancaları
        │   ├── reader/            # Sure okuyucu bileşenleri
        │   ├── verse/             # Ayet detayı (başlık, kelime analizi, karşılaştırma…)
        │   ├── roots/             # Kök listesi ve kök detayı
        │   ├── search/            # Arama görünümü ve sorgu ayrıştırma
        │   ├── notes/             # Not düzenleyici
        │   ├── home/              # Günün ayeti, okuma geçmişi
        │   ├── pwa/               # Service worker kaydı, kurulum istemi
        │   └── backup/            # JSON dışa/içe aktarma
        ├── context/               # Theme, Settings, Notes, Favorites, History
        ├── lib/                   # API istemcisi, useAsync, localStorage yardımcıları
        └── data/                  # roots.json, surahMeta.ts
```

---

## Tasarım Sistemi

Beyaz zeminli, mavi vurgulu, keskin köşeli düz (flat) editoryal dil. Yüzeyler gölgeyle değil ince çizgiyle ayrılır.

Renkler `globals.css` içinde CSS değişkeni olarak tanımlanır; `tailwind.config.js` bunları
`rgb(var(--x) / <alpha-value>)` biçiminde tüketir. Böylece `dark:` varyantını her sınıfta tekrarlamaya gerek kalmaz.

| Token | Kullanım |
|-------|----------|
| `canvas` | Sayfa zemini |
| `surface`, `surface-sunken` | Panel yüzeyleri, tablo başlıkları |
| `line`, `line-strong` | Ayırıcı çizgiler ve çerçeveler |
| `ink`, `ink-muted`, `ink-faint` | Metin hiyerarşisi |
| `accent`, `accent-hover`, `accent-soft`, `accent-ink`, `accent-contrast` | Mavi vurgu |
| `marker`, `marker-ink` | Metin içi vurgulama |
| `danger`, `danger-soft` | Silme ve hata durumları |

Tema tercihi `<head>` içindeki küçük bir betikle ilk boyamadan önce uygulanır; böylece sayfa yanlış temayla parlamaz.

---

## Kurulum

### Gereksinimler
- Node.js 18+

### Backend

```bash
cd backend
npm install

# Veritabanını oluştur ve verileri aktar
npm run init-db
npm run import-data

# (İsteğe bağlı) Ek veriler
node src/db/import-gunes.js
node src/db/populate-root-meanings.js
node src/db/apply-dictionary.js

# Ortam değişkenleri
cp .env.example .env   # ALLOWED_ORIGINS değerini kendi domaininizle doldurun

npm start
```

Backend `http://localhost:3001` adresinde çalışır.

> `better-sqlite3` native derleme gerektirir. Derlenemezse uygulama otomatik olarak `sql.js`'e döner;
> bu durumda FTS5 tablosu atlanır, arama LIKE ile çalışmaya devam eder.

### Frontend

```bash
cd frontend
npm install

echo "NEXT_PUBLIC_API_BASE=http://localhost:3001/api" > .env.local
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışır.

### Production build

```bash
cd frontend
npm run build   # /out klasörüne statik dosyalar üretir
```

**Frontend değişkenleri (derleme zamanı)**

| Değişken | Varsayılan | Açıklama |
|----------|-----------|----------|
| `NEXT_PUBLIC_API_BASE` | `https://kuran-rehberi.onrender.com/api` | API adresi |
| `NEXT_PUBLIC_SITE_URL` | `https://kuranrehberi.com` | canonical URL, sitemap, paylaşım bağlantıları |

**Backend değişkenleri**

| Değişken | Açıklama |
|----------|----------|
| `PORT` | Sunucu portu (varsayılan 3001) |
| `ALLOWED_ORIGINS` | Virgülle ayrılmış CORS allowlist. Production'da doldurulmalıdır. |
| `NODE_ENV` | `production` değerinde iç hata detayları istemciye gönderilmez |

---

## API Referansı

### Sureler
```
GET /api/surahs                          # Tüm sureler
GET /api/surahs/:id                      # Belirli sure
GET /api/surahs/:id/verses               # Surenin ayetleri
  ?translator=tr.diyanet
```

### Ayetler
```
GET /api/verses/:surahId/:verseNumber    # Tüm çeviriler, kelime analizi, ilgili ayetler
```

### Arama
```
GET /api/search?q=kelime                 # Meallerde arama
  &translator=tr.diyanet
  &language=tr
  &surah=2
  &revelation=Mekki|Medeni
  &limit=50&offset=0

GET /api/search/arabic?q=kelime          # Arapça metinde arama (aynı filtreler)
GET /api/search/translators?language=tr  # Tercüman listesi
```

### Kelime kökleri
```
GET /api/roots                           # Kök listesi
  ?sort=count|alpha&letter=ر&limit=100&offset=0

GET /api/roots/search?q=resul            # Kök arama (Türkçe / Arapça / fonetik)

GET /api/roots/:root                     # Kök detayı
  ?translator=tr.diyanet
  &surah=2&revelation=Mekki&pos=N&form=كتاب
```

Tüm uç noktalar dakikada 240 istekle sınırlıdır; geçersiz parametreler `400` ile reddedilir.

---

## Kullanıcı Verileri

Kişisel veriler yalnızca tarayıcının `localStorage`'ında tutulur — hesap veya sunucu senkronizasyonu yoktur.

| Anahtar | İçerik |
|---------|--------|
| `kuran-rehberi-settings` | Meal, dil, yazı boyutu, kompakt mod, okunuş, sure görünümü, sabitlenen mealler |
| `kuran-rehberi-theme` | Tema tercihi |
| `kuran-rehberi-notes` | Notlar (başlık, içerik, etiketler, tarihler) |
| `kuran-rehberi-favorites` | Favoriler ve ait oldukları koleksiyonlar |
| `kuran-rehberi-collections` | Koleksiyon adları |
| `kuran-rehberi-history` | Son 12 okuma kaydı |

Tümü ayarlar panelinden tek JSON dosyası olarak dışa/içe aktarılabilir. Eski sürümden gelen kayıtlar okunurken eksik alanlar tamamlanır.

---

## Bilinen Kısıtlamalar

- **FTS5 tablosu kurulur ama kullanılmaz.** Arama `LIKE '%…%'` ile çalışır; büyük veri setinde indekssizdir.
  FTS5'e geçiş sql.js yedeğini ve eşleşme davranışını etkileyeceği için ayrı ele alınmalıdır.
- **`backend/kuran.db` Git LFS ile tutulur.** Arşivden açılan kopyalarda yalnızca işaretçi bulunur;
  veritabanı `npm run init-db && npm run import-data` ile yeniden üretilmelidir.
- **Frontend statiktir.** Server-side rendering yoktur, veri istemci tarafında çekilir.
- **Meal içi kelime vurgulaması** otomatik hizalamaya dayanır ve her kelimede birebir doğru olmayabilir.
- **Transliterasyon** kural tabanlıdır; tecvid kurallarını yansıtmaz, telaffuz rehberi değildir.
- **Service worker yalnızca production derlemesinde** kayıt olur ve güvenli bağlam (HTTPS veya localhost) ister.
  Çevrimdışı okuma yalnızca daha önce açılmış sayfalar için geçerlidir.
  Güncelleme yayımlarken `public/sw.js` içindeki `VERSION` artırılmalıdır.
- **Yazı tipleri Google Fonts'tan** yüklenir ve service worker tarafından önbelleklenmez;
  çevrimdışıyken sistem yazı tipine düşülür.

---

## Yol Haritası

- **Sesli Kuran** — kâri seçimi, ayet oynatma, otomatik devam ve oynatma hızı.
  Kullanım şartları netleştirilmiş güvenilir bir kaynak belirlenmeden ses dosyası eklenmeyecektir.
- **Arama performansı** — FTS5 tabanlı aramaya geçiş değerlendiriliyor.

---

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce issue açınız.

## Lisans

MIT License

## Teşekkürler

- [eyupipler](https://github.com/eyupipler) — projenin sahibi ve asıl geliştiricisi
- [Tanzil.net](https://tanzil.net) — Kuran metni ve çeviriler
- [Quranic Arabic Corpus](https://corpus.quran.com) — morfoloji verileri
- [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) — çeviri toplayıcı
- [apacikkuran.com](https://apacikkuran.com) — Şinasi Güneş çevirisi
