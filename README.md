# Kuran Rehberi

Kapsamlı bir Kuran araştırma platformu — kelime kökü analizi, çoklu çeviriler, morfolojik arama ve karşılaştırma araçları.

## Özellikler

- **40+ Türkçe, 6 İngilizce meal** desteği (Ahmet Hulusi, Elmalılı, Şinasi Güneş, Süleyman Ateş, vb.)
- **Kelime kökü analizi** — her kelimenin kökünü ve Kuran'daki tüm tekrarlarını görün
- **Gerçek zamanlı kök arama** — Türkçe (`resul`, `elçi`), Arapça (`رسل`), fonetik (`rsl`, `r-s-l`) yazımla arama
- **Arapça harf filtresi** — Türkçe okunuş etiketleriyle harf bazlı kök tarama
- **Ayet karşılaştırma aracı** — seçilen kelimenin kökünü tüm Kuran'da vurgulayarak takip edin
- **Kök detay sayfasında kelime vurgulama** — hangi Arapça kelimenin kastedildiğini ve meal içindeki karşılığını işaretler
- **Notlar sistemi** — ayetlere kişisel not ekleyin (tarayıcıda saklanır)
- **Favoriler** — ayetleri favorilere ekleyin
- **Kalıcı ayarlar** — tema, font boyutu, varsayılan meal tercihi localStorage'da saklanır
- **Mobil uyumlu** responsive tasarım

## Ekran Görüntüleri

- **Ana Sayfa**: 114 surenin listesi (sıralama ve arama)
- **Sure Sayfası**: Seçilen surenin ayetleri ve seçili meal
- **Ayet Detay**: Tüm çeviriler + kelime bazında analiz + karşılaştırma aracı
- **Kelime Kökleri**: Arama ve harf filtresiyle tüm köklerin listesi
- **Kök Detay**: Kökün geçtiği tüm ayetler, kelime vurgulaması
- **Notlarım**: Eklenen tüm kişisel notlar

## Veri Kaynakları

| Kaynak | İçerik | Lisans |
|--------|--------|--------|
| [Tanzil.net](https://tanzil.net) | Kuran metni, 120+ çeviri | CC-BY 3.0 |
| [Quranic Arabic Corpus](https://corpus.quran.com) | Morfoloji, kelime kökleri | GNU GPL |
| [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) | 440+ çeviri, 90+ dil | Açık |
| [apacikkuran.com](https://apacikkuran.com) | Şinasi Güneş çevirisi | — |

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14 (static export) + TailwindCSS + TypeScript |
| Backend | Node.js + Express.js |
| Veritabanı | SQLite via sql.js (in-memory) |
| Deployment | Render (backend) + statik dosyalar (frontend) |
| Durum Yönetimi | React Context API + localStorage |

## Proje Yapısı

```
Kuran Rehberi/
├── data/
│   ├── translations/           # Çeviri JSON dosyaları
│   │   └── tr.gunes.json       # Şinasi Güneş çevirisi
│   └── related-verses.json     # İlgili ayet verileri
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql               # Veritabanı şeması
│   │   │   ├── init.js                  # DB oluşturma
│   │   │   ├── import.js                # Ana veri import
│   │   │   ├── import-gunes.js          # Şinasi Güneş import
│   │   │   ├── scrape-apacik.js         # apacikkuran.com scraper
│   │   │   ├── populate-root-meanings.js # Kelime bazlı kök anlam doldurma
│   │   │   ├── apply-dictionary.js      # Sözlükten anlam uygulama
│   │   │   └── root-dictionary.js       # Türkçe kök sözlüğü (~130 kök)
│   │   ├── routes/
│   │   │   ├── surahs.js
│   │   │   ├── verses.js
│   │   │   ├── search.js
│   │   │   └── roots.js                 # Kök arama + transliterasyon
│   │   └── index.js
│   └── kuran.db
├── frontend/
│   ├── .env.local                        # Yerel geliştirme için API URL
│   ├── .env.production                   # Production API URL
│   └── src/
│       ├── app/
│       │   ├── page.tsx                  # Ana sayfa (sure listesi)
│       │   ├── surah/[id]/page.tsx       # Sure detay
│       │   ├── verse/[surahId]/[verseNumber]/page.tsx  # Ayet detay + karşılaştırma
│       │   ├── search/page.tsx           # Full-text arama
│       │   ├── roots/
│       │   │   ├── page.tsx              # Kök listesi (arama + harf filtresi)
│       │   │   └── [root]/
│       │   │       ├── page.tsx
│       │   │       └── RootDetailClient.tsx  # Kelime vurgulaması
│       │   └── notes/                    # Notlar sayfası
│       ├── components/
│       │   └── Navbar.tsx
│       └── context/
│           ├── SettingsContext.tsx        # Tema, font, meal tercihi
│           └── NotesContext.tsx          # Kişisel notlar
```

## Kurulum

### Gereksinimler
- Node.js 18+

### Backend

```bash
cd backend
npm install

# Veritabanını oluştur ve verileri import et
node src/db/init.js
node src/db/import.js

# (İsteğe bağlı) Şinasi Güneş çevirisini ekle
node src/db/import-gunes.js

# (İsteğe bağlı) Kök anlamlarını doldur
node src/db/populate-root-meanings.js
node src/db/apply-dictionary.js

# Sunucuyu başlat
node src/index.js
```

Backend `http://localhost:3001` adresinde çalışır.

### Frontend

```bash
cd frontend

# Yerel API URL'ini ayarla
echo "NEXT_PUBLIC_API_BASE=http://localhost:3001/api" > .env.local

npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışır.

### Production Build

```bash
cd frontend
npm run build   # /out klasörüne statik dosyalar üretir
```

## API Referansı

### Sureler
```
GET /api/surahs                     # Tüm sureler
GET /api/surahs/:id                 # Belirli sure
GET /api/surahs/:id/verses          # Surenin ayetleri
  ?translator=tr.diyanet            # Meal seçimi
```

### Ayetler
```
GET /api/verses/:surahId/:verseNumber   # Ayet detayı (tüm çeviriler + kelime analizi)
```

### Arama
```
GET /api/search?q=kelime            # Meallerde full-text arama
  &translator=tr.diyanet
  &language=tr

GET /api/search/arabic?q=kelime     # Arapça metinde arama
GET /api/search/translators         # Tüm tercüman listesi
```

### Kelime Kökleri
```
GET /api/roots                      # Tüm kökler
  ?sort=count|alpha                 # Sıralama (varsayılan: count)
  ?letter=ر                         # Harf filtresi
  ?page=1&limit=50

GET /api/roots/search?q=resul       # Kök arama (Türkçe/Arapça/fonetik)
GET /api/roots/:root                # Kök detayı (tüm ayetler)
```

### Arama Örnekleri

Kök arama `?q=` parametresi şu formatları destekler:

| Giriş | Açıklama |
|-------|----------|
| `resul` | Türkçe fonetik → رسل |
| `rsl` | Sessiz harf iskeleti → رسل |
| `r-s-l` | Tire ayrılmış iskelet |
| `elçi` | Türkçe anlam arama |
| `رسل` | Doğrudan Arapça |

## Notlar ve Kısıtlamalar

- Kullanıcı ayarları, favoriler ve notlar **tarayıcının localStorage**'ında saklanır — site güncellemelerinden etkilenmez, tarayıcı verisi silinirse sıfırlanır.
- Frontend statik olarak derlenir; API URL'i derleme sırasında `NEXT_PUBLIC_API_BASE` env değişkeninden okunur.

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce issue açınız.

## Lisans

MIT License

## Teşekkürler

- [Tanzil.net](https://tanzil.net) — Kuran metni ve çeviriler
- [Quranic Arabic Corpus](https://corpus.quran.com) — Morfoloji verileri
- [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) — Çeviri API
- [apacikkuran.com](https://apacikkuran.com) — Şinasi Güneş çevirisi
