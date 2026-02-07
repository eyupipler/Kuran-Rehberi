# Kuran Rehberi

Kapsamli bir Kuran arastirma platformu - kelime koku analizi, coklu ceviriler ve morfolojik arama ozellikleri.

## Ozellikler

- 100+ farkli tercuman/ceviri destegi (9 Turkce, 5 Ingilizce meal)
- Kelime koku (root word) analizi
- Morfolojik arama (kelime kokune gore arama)
- Ayetlerin farkli meallerde karsilastirmasi
- Kelime bazinda gramer bilgisi
- Sure ve ayet bazli gezinme
- Full-text arama (meallerde ve Arapca metinde)

## Ekran Goruntuleri

Proje calistirildiginda su sayfalari goreceksiniz:
- **Ana Sayfa**: 114 surenin listesi (siralama ve filtreleme)
- **Sure Sayfasi**: Secilen surenin ayetleri ve meali
- **Ayet Detay**: Tum ceviriler + kelime kelime analiz
- **Kelime Kokleri**: Kuran'daki tum koklerin listesi
- **Kok Detay**: Bir kokun gectigi tum yerler ve turetilmis formlar
- **Arama**: Meallerde ve Arapca metinde arama

## Veri Kaynaklari

| Kaynak | Icerik | Lisans |
|--------|--------|--------|
| [Tanzil.net](https://tanzil.net) | Kuran metni, 120+ ceviri | CC-BY 3.0 |
| [Quranic Arabic Corpus](https://corpus.quran.com) | Morfoloji, kelime kokleri | GNU GPL |
| [Quran API](https://github.com/fawazahmed0/quran-api) | 440+ ceviri, 90+ dil | Acik |

## Teknoloji

- **Frontend**: Next.js 14 + TailwindCSS + TypeScript
- **Backend**: Node.js + Express.js
- **Database**: SQLite (better-sqlite3)
- **API**: RESTful JSON API

## Proje Yapisi

```
Kuran Rehberi/
├── data/                    # Indirilen veriler
│   ├── translations/        # Ceviri JSON dosyalari
│   ├── morphology/          # Morfoloji verileri
│   └── surahs.json          # Sure bilgileri
├── backend/
│   ├── src/
│   │   ├── db/              # Veritabani islemleri
│   │   │   ├── schema.sql   # DB semasi
│   │   │   ├── init.js      # DB olusturma
│   │   │   └── import.js    # Veri import
│   │   ├── routes/          # API endpoint'leri
│   │   │   ├── surahs.js
│   │   │   ├── verses.js
│   │   │   ├── search.js
│   │   │   └── roots.js
│   │   └── index.js         # Express sunucu
│   └── kuran.db             # SQLite veritabani
├── frontend/
│   └── src/
│       ├── app/             # Next.js sayfalari
│       │   ├── page.tsx                    # Ana sayfa
│       │   ├── surah/[id]/page.tsx         # Sure detay
│       │   ├── verse/[surahId]/[verseNumber]/page.tsx
│       │   ├── search/page.tsx             # Arama
│       │   ├── roots/page.tsx              # Kok listesi
│       │   └── roots/[root]/page.tsx       # Kok detay
│       └── lib/api.ts       # API client
└── scripts/
    └── download-data.js     # Veri indirme scripti
```

## Kurulum (Adim Adim)

### 1. Gereksinimler
- Node.js 18+
- npm veya yarn

### 2. Verileri Indir
```bash
cd scripts
node download-data.js
```
Bu islem:
- 16 farkli ceviriyi indirir (9 Turkce, 5 Ingilizce, 2 Arapca)
- Morfoloji verilerini indirir
- Sure bilgilerini kaydeder

### 3. Backend Kurulumu
```bash
cd backend
npm install

# Veritabanini olustur
npm run init-db

# Verileri import et
npm run import-data

# Sunucuyu baslat
npm run dev
```
Backend http://localhost:3001 adresinde calisacak.

### 4. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```
Frontend http://localhost:3000 adresinde calisacak.

## API Dokumantasyonu

### Sureler
```
GET /api/surahs              # Tum sureler
GET /api/surahs/:id          # Belirli sure
GET /api/surahs/:id/verses   # Surenin ayetleri
  ?translator=tr.diyanet     # Ceviri secimi
```

### Ayetler
```
GET /api/verses/:surahId/:verseNumber
  # Ayet detayi + tum ceviriler + kelime analizi
```

### Arama
```
GET /api/search?q=kelime     # Meallerde ara
  &translator=tr.diyanet     # Tercuman filtresi
  &language=tr               # Dil filtresi

GET /api/search/arabic?q=word  # Arapcada ara
GET /api/search/translators    # Tercuman listesi
```

### Kelime Kokleri
```
GET /api/roots               # Tum kokler
  ?sort=count|alpha          # Siralama
GET /api/roots/:root         # Kok detayi
GET /api/roots/search/:query # Kok arama
```

## Gelecek Ozellikler (Yol Haritasi)

- [ ] Tefsir destegi
- [ ] Ses/Tilavet ozelligi
- [ ] Kullanici hesaplari ve favoriler
- [ ] Ayet karsilastirma araci
- [ ] Konu bazli indeks
- [ ] Mobil uygulama (React Native)
- [ ] Offline destek (PWA)

## Katkida Bulunma

Pull request'ler memnuniyetle karsilanir. Buyuk degisiklikler icin once bir issue aciniz.

## Lisans

MIT License

## Tesekkurler

- [Tanzil.net](https://tanzil.net) - Kuran metni ve ceviriler
- [Quranic Arabic Corpus](https://corpus.quran.com) - Morfoloji verileri
- [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) - Ceviri API
