# Kuran Rehberi — Proje Durumu

Son güncelleme: 2026-04-11

---

## Proje Genel Yapısı

```
Kuran Rehberi/
├── backend/                  # Node.js + Express API (Render'da host edilir)
│   ├── kuran.db              # SQLite veritabanı (git'te tutuluyor)
│   └── src/
│       ├── index.js          # Express sunucusu, CORS, route bağlantıları
│       ├── routes/
│       │   ├── surahs.js     # /api/surahs — sure listesi ve ayet listesi
│       │   ├── verses.js     # /api/verses/:surah/:verse — ayet detayı, çeviriler, kelimeler
│       │   ├── roots.js      # /api/roots/:root — kelime kökü detayı, türetilmiş formlar
│       │   └── search.js     # /api/search — metin arama, tercüman listesi
│       └── db/
│           ├── database.js   # better-sqlite3 / sql.js wrapper
│           ├── init.js       # DB oluşturma (FTS5, schema) — better-sqlite3 gerektirir
│           ├── schema.sql    # Tablo tanımları
│           ├── import.js     # Tüm JSON çevirilerini DB'ye aktarır
│           ├── add-yilmaz.js # Hakkı Yılmaz mealini sql.js ile DB'ye ekler
│           ├── parse-yilmaz.js    # Yılmaz .doc dosyasını parse eder → tr.yilmaz.json
│           └── populate-root-meanings.js  # Kelime kökü Türkçe anlamlarını doldurur
│
├── frontend/                 # Next.js 14 App Router (Hostinger'da static host)
│   ├── out/                  # `npm run build` çıktısı — burası host edilir
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Anasayfa: sure listesi, tıklanabilir sütun sıralaması
│   │   │   ├── layout.tsx            # Root layout, dark mode zorunlu (html.dark)
│   │   │   ├── globals.css           # Tailwind + özel CSS (font boyutu, kompakt mod)
│   │   │   ├── surah/[id]/           # Sure sayfası: ayet listesi, yalnızca meal modu
│   │   │   ├── verse/[surahId]/[verseNumber]/  # Ayet sayfası (ana sayfa)
│   │   │   ├── roots/                # Kelime kökü sayfaları
│   │   │   ├── search/               # Metin arama
│   │   │   └── notes/                # Notlarım sayfası
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Üst navigasyon + ayarlar paneli
│   │   │   ├── SurahSidebar.tsx      # Sol sure listesi sidebar'ı
│   │   │   └── FavoritesPanel.tsx    # Favoriler yan paneli
│   │   └── context/
│   │       ├── SettingsContext.tsx   # Kullanıcı ayarları (localStorage)
│   │       ├── FavoritesContext.tsx  # Favori ayetler (localStorage)
│   │       └── NotesContext.tsx      # Notlar (localStorage)
│
└── data/
    └── translations/
        ├── tr.yilmaz.json    # Hakkı Yılmaz meali (5922 ayet, 114 sure)
        ├── tr.diyanet.json   # Diyanet meali
        ├── tr.*.json         # ~40 Türkçe meal
        ├── en.*.json         # ~6 İngilizce çeviri
        └── ar.uthmani.json   # Arapça metin (Osmanlı hattı)
```

---

## Teknik Altyapı

| Katman | Teknoloji | Notlar |
|--------|-----------|--------|
| Backend | Node.js + Express | Render.com'da ücretsiz host |
| Veritabanı | SQLite (better-sqlite3) | FTS5 ile tam metin arama |
| Frontend | Next.js 14 App Router | `output: 'export'` → statik |
| Stil | Tailwind CSS | `darkMode: 'class'` stratejisi |
| Host | Hostinger (frontend) + Render (backend) | |
| API URL | `https://kuran-api.onrender.com/api` | `NEXT_PUBLIC_API_BASE` env |

---

## Veritabanı Tabloları

- **surahs** — 114 sure (id, name, arabicName, revelationOrder, totalVerses)
- **verses** — 6236 ayet (id, surahId, verseNumber, arabicText)
- **translators** — ~50 tercüman (id, code, name, language)
- **translations** — ayet çevirileri (verse_id, translator_id, text)
- **words** — kelime analizi (verseId, position, arabicWord, lemma, partOfSpeech, root, translationTr)
- **roots** — kelime kökleri (id, root, rootLatin, meaningTr, meaningEn, occurrenceCount)
- **verse_relations** — ilgili ayet bağlantıları
- **verses_fts** — FTS5 tam metin arama sanal tablosu

---

## Kullanıcı Ayarları (localStorage)

`SettingsContext` üzerinden yönetilir, `kuran-rehberi-settings` anahtarıyla saklanır:

| Ayar | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `defaultTranslator` | string | `'tr.diyanet'` | Tercih edilen meal |
| `defaultLanguage` | string | `'tr'` | Gösterilecek dil filtresi |
| `onlyMeal` | boolean | `false` | Arapça metni gizler |
| `compactMode` | boolean | `false` | Daha sıkışık düzen |
| `fontSize` | `'sm'\|'md'\|'lg'` | `'md'` | Yazı boyutu |

CSS değişkenleri `data-font-size` attribute ve `.compact` sınıfı üzerinden uygulanır.

---

## Sayfalar ve Özellikler

### Anasayfa (`/`)
- 114 sure tablosu (masaüstü) + liste (mobil)
- Sütun başlıklarına tıklayarak sıralama (isim / numara / iniş sırası / ayet sayısı)
- Dropdown kaldırıldı

### Sure Sayfası (`/surah/[id]`)
- Ayet listesi, favori ekleme
- Sol sidebar'da sure listesi

### Ayet Sayfası (`/verse/[surahId]/[verseNumber]`)
- Arapça metin: her kelimeye tıklanabilir (kök vurgulama)
- **Kelime popup kartı**: tıklanılan kelimenin Türkçe anlamı, kökü, kelime türü
- Tüm çeviriler (dil filtresine göre)
- **Karşılaştırma modu**: iki ayet yan yana, seçili kelimenin kökü her iki panelde vurgulanır
- Kök geçişleri: ayet listesinde o köke sahip ayetler işaretlenir
- Favorilere ekleme, not alma

### Notlarım (`/notes`)
- Alınan notlar listesi
- Her notun altında **varsayılan tercümanın çevirisi** gösterilir
- Not düzenleme ve silme

### Kelime Kökleri (`/roots`, `/roots/[root]`)
- Kök arama
- Geçiş listesi: Arapça metinde kök kelimesi vurgulanır, Türkçe mealde de vurgulanır
- Tercüman seçici (seçim settings'e kaydedilir)
- Sadece meal modu
- Sure dağılımı grafiği

### Arama (`/search`)
- FTS5 tabanlı tam metin arama

---

## Son Yapılan Değişiklikler

### 2026-04-11 — TODO 2. tur tamamlandı
- **Günün Ayeti**: Anasayfanın üstünde tarih tabanlı deterministik rastgele ayet, sadece Türkçe, varsayılan tercümanla
- **Yılmaz meali null ayetler**: Boş çeviriler için "(Bu ayetin meâli önceki ayette verilmiştir)" mesajı
- **Font büyüklüğü**: `--prose-font-size` CSS değişkeni ile `.prose-text` sınıfı — meal metinleri de font boyutuyla ölçeklenir
- **Kompakt mod**: `verse-item` / `verse-list` sınıfları + RSS akışı stili (kutusuz, bölücü çizgili)
- **Karşılaştırma paneli Türkçe highlight**: `MealWithHighlightVerse` fonksiyonu, seçili kelimenin kökünü Türkçe çevirilerde de vurgular
- **Kelime kökü varsayılan tercüman**: `translatorOverride ?? settings.defaultTranslator` pattern ile localStorage'dan gelen ayar doğru yansıtılır
- **Kök sayfası MealWithHighlight iyileştirmesi**: Önce tam eşleşme, sonra kök eşleşme; daha geniş Türkçe karakter seti
- **Kök sayfası null translationTr**: Her zaman bir şey gösterilir (`occ.translationTr || rootInfo.meaningTr || transliterateRoot`)
- **Logo yeniden tasarımı**: Inline SVG logo (kitap + ق harfi + mavi daire)

### 2026-04-11 — Yılmaz meali temizleme
- **39 ayette gömülü ayet numarası** temizlendi (`\s\d+[Capital]` → numara çıkarıldı)
- `tr.yilmaz.json` ve `kuran.db` güncellendi

### 2026-04-11 — TODO listesi tamamlandı
- **Kompakt mod**: Navbar'dan toggle, `.compact` CSS sınıfı
- **Font büyüklüğü**: Küçük/Normal/Büyük seçici, `data-font-size` attribute
- **Kelime popup** (ayet sayfası): tıklanılan Arapça kelime için detay kartı
- **Karşılaştırma highlight**: seçili kelimenin kökü her iki panelde vurgulanır
- **Notlar çevirisi**: varsayılan tercümanın metni notların altında gösterilir
- **MealWithHighlight iyileştirmesi**: Türkçe gövde çıkarma (suffix stripping) ile daha iyi eşleşme

### 2026-04-11 — Dark mode ve Yılmaz meali
- Dark mode: `@media` → `.dark` sınıfı stratejisine geçildi, site artık sürekli koyu modda
- Anasayfa dropdown sıralaması → tıklanabilir sütun başlıkları
- **Hakkı Yılmaz meali** parse edildi ve DB'ye eklendi (5922 ayet, 114 sure)
- Fatiha suresi manuel olarak eklendi
- Gömülü satır içi ayet numaraları `splitInlineVerses()` ile bölündü

---

## Deployment

### Frontend (Hostinger)
```bash
cd frontend
NEXT_PUBLIC_API_BASE=https://kuran-api.onrender.com/api npm run build
# out/ klasörünü zipleyip Hostinger'a yükle
```

### Backend (Render)
- Git commit sonrası Render otomatik yeniden deploy eder
- `kuran.db` git'te binary olarak tutulur
- **Not**: `better-sqlite3` için Render'da C++ build tools gerekir; Windows'ta sadece `sql.js` ile çalışır

### Windows'ta DB güncelleme
```bash
# Yılmaz mealini güncellemek için:
node backend/src/db/add-yilmaz.js
# (sql.js kullanır, derleme gerektirmez)
```

---

## Bilinen Kısıtlamalar

- **FTS5**: Sadece `better-sqlite3` destekler, Windows'ta derleme gerektirir. Arama özelliği sadece Render'da çalışır.
- **DB değişiklikleri**: `kuran.db` her değişiklikte git'e commit edilmeli ve Render'ın yeniden deploy etmesi beklenmeli.
- **Yılmaz meali eksikler**: Bazı sure grupları aynı çeviriyle işaretlenmiş (orijinal metinde birleşik çeviri); bu kasıtlı.
- **Frontend statik**: Next.js `output: 'export'` ile üretilir, server-side rendering yok.
