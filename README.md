# Kuran Rehberi

Kapsamlı bir Kuran araştırma platformu - kelime kökü analizi, çoklu çeviriler ve morfolojik arama özellikleri.

## Özellikler

- 40+ farklı tercüman/çeviri desteği (34 Türkçe, 6 İngilizce meal)
- Kelime kökü (root word) analizi
- Morfolojik arama (kelime köküne göre arama)
- Ayetlerin farklı meallerde karşılaştırması
- Kelime bazında gramer bilgisi
- Sure ve ayet bazlı gezinme
- Full-text arama (meallerde ve Arapça metinde)

## Ekran Görüntüleri

Proje çalıştırıldığında şu sayfaları göreceksiniz:
- **Ana Sayfa**: 114 surenin listesi (sıralama ve filtreleme)
- **Sure Sayfası**: Seçilen surenin ayetleri ve meali
- **Ayet Detay**: Tüm çeviriler + kelime kelime analiz
- **Kelime Kökleri**: Kuran'daki tüm köklerin listesi
- **Kök Detay**: Bir kökün geçtiği tüm yerler ve türetilmiş formlar
- **Arama**: Meallerde ve Arapça metinde arama

## Veri Kaynakları

| Kaynak | İçerik | Lisans |
|--------|--------|--------|
| [Tanzil.net](https://tanzil.net) | Kuran metni, 120+ çeviri | CC-BY 3.0 |
| [Quranic Arabic Corpus](https://corpus.quran.com) | Morfoloji, kelime kökleri | GNU GPL |
| [Quran API](https://github.com/fawazahmed0/quran-api) | 440+ çeviri, 90+ dil | Açık |

## Teknoloji

- **Frontend**: Next.js 14 + TailwindCSS + TypeScript
- **Backend**: Node.js + Express.js
- **Database**: SQLite (better-sqlite3)
- **API**: RESTful JSON API

## Proje Yapısı

```
Kuran Rehberi/
├── data/                    # İndirilen veriler
│   ├── translations/        # Çeviri JSON dosyaları
│   ├── morphology/          # Morfoloji verileri
│   └── surahs.json          # Sure bilgileri
├── backend/
│   ├── src/
│   │   ├── db/              # Veritabanı işlemleri
│   │   │   ├── schema.sql   # DB şeması
│   │   │   ├── init.js      # DB oluşturma
│   │   │   └── import.js    # Veri import
│   │   ├── routes/          # API endpoint'leri
│   │   │   ├── surahs.js
│   │   │   ├── verses.js
│   │   │   ├── search.js
│   │   │   └── roots.js
│   │   └── index.js         # Express sunucu
│   └── kuran.db             # SQLite veritabanı
├── frontend/
│   └── src/
│       ├── app/             # Next.js sayfaları
│       │   ├── page.tsx                    # Ana sayfa
│       │   ├── surah/[id]/page.tsx         # Sure detay
│       │   ├── verse/[surahId]/[verseNumber]/page.tsx
│       │   ├── search/page.tsx             # Arama
│       │   ├── roots/page.tsx              # Kök listesi
│       │   └── roots/[root]/page.tsx       # Kök detay
│       └── lib/api.ts       # API client
└── scripts/
    └── download-data.js     # Veri indirme scripti
```

## Kurulum (Adım Adım)

### 1. Gereksinimler
- Node.js 18+
- npm veya yarn

### 2. Verileri İndir
```bash
cd scripts
node download-data.js
```
Bu işlem:
- 42 farklı çeviriyi indirir (34 Türkçe, 6 İngilizce, 2 Arapça)
- Morfoloji verilerini indirir
- Sure bilgilerini kaydeder

### 3. Backend Kurulumu
```bash
cd backend
npm install

# Veritabanını oluştur
npm run init-db

# Verileri import et
npm run import-data

# Sunucuyu başlat
npm run dev
```
Backend http://localhost:3001 adresinde çalışacak.

### 4. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```
Frontend http://localhost:3000 adresinde çalışacak.

## API Dokümantasyonu

### Sureler
```
GET /api/surahs              # Tüm sureler
GET /api/surahs/:id          # Belirli sure
GET /api/surahs/:id/verses   # Surenin ayetleri
  ?translator=tr.diyanet     # Çeviri seçimi
```

### Ayetler
```
GET /api/verses/:surahId/:verseNumber
  # Ayet detayı + tüm çeviriler + kelime analizi
```

### Arama
```
GET /api/search?q=kelime     # Meallerde ara
  &translator=tr.diyanet     # Tercüman filtresi
  &language=tr               # Dil filtresi

GET /api/search/arabic?q=word  # Arapçada ara
GET /api/search/translators    # Tercüman listesi
```

### Kelime Kökleri
```
GET /api/roots               # Tüm kökler
  ?sort=count|alpha          # Sıralama
GET /api/roots/:root         # Kök detayı
GET /api/roots/search/:query # Kök arama
```

## Gelecek Özellikler (Yol Haritası)

- [ ] Kullanıcı hesapları ve favoriler
- [ ] Ayet karşılaştırma aracı
- [ ] Konu bazlı indeks
- [ ] Mobil uygulama (React Native)
- [ ] Offline destek (PWA)
- [ ] Kur'an analizi yapabilen dil modeli (LLM)

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açınız.

## Lisans

MIT License

## Teşekkürler

- [Tanzil.net](https://tanzil.net) - Kuran metni ve çeviriler
- [Quranic Arabic Corpus](https://corpus.quran.com) - Morfoloji verileri
- [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) - Çeviri API
