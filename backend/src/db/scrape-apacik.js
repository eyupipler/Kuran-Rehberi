/**
 * apacikkuran.com API'sinden Şinasi Güneş çevirisi ve ilgili ayetleri çeker.
 * Çıktılar:
 *   data/translations/tr.gunes.json  → Şinasi Güneş meali
 *   data/related-verses.json         → Anlam bütünlüğü ilişkileri (karşılaştırma aracı için)
 *
 * Kullanım: node backend/src/db/scrape-apacik.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://apacikkuran.com';
const OUT_DIR = path.join(__dirname, '..', '..', '..', 'data');
const TRANSLATIONS_DIR = path.join(OUT_DIR, 'translations');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  console.log('apacikkuran.com API\'den veri çekiliyor...\n');

  // 1. Tüm sureleri al
  const surahs = await fetchJSON(`${BASE_URL}/api/surahs`);
  // Kitap sırasına göre sırala (order_in_quran değil, surah_id = Kuran sırası)
  surahs.sort((a, b) => a.id - b.id);
  console.log(`${surahs.length} sure bulundu.`);

  const translations = []; // tr.gunes formatı: [{ surahId, verseNumber, text }]
  const relatedVerses = {}; // { "surahId:verseNumber": ["surahId:verseNumber", ...] }

  for (const surah of surahs) {
    process.stdout.write(`  Sure ${surah.id} (${surah.name})...`);

    const verses = await fetchJSON(`${BASE_URL}/api/surahs/${surah.id}/verses`);

    for (const v of verses) {
      // Çeviri
      if (v.text_turkish) {
        translations.push({
          surahId: surah.id,
          verseNumber: v.verse_number,
          text: v.text_turkish.trim(),
        });
      }

      // İlgili ayetler
      if (v.related_verses && v.related_verses.length > 0) {
        const key = `${surah.id}:${v.verse_number}`;
        relatedVerses[key] = v.related_verses.map((r) => `${r.surah}:${r.verse}`);
      }
    }

    process.stdout.write(` ${verses.length} ayet\n`);
    await sleep(200); // Rate limiting
  }

  // 2. Kaydet
  fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });

  const gunesPath = path.join(TRANSLATIONS_DIR, 'tr.gunes.json');
  fs.writeFileSync(gunesPath, JSON.stringify(translations, null, 2), 'utf8');
  console.log(`\n✓ ${translations.length} ayet çevirisi kaydedildi: ${gunesPath}`);

  const relatedPath = path.join(OUT_DIR, 'related-verses.json');
  fs.writeFileSync(relatedPath, JSON.stringify(relatedVerses, null, 2), 'utf8');
  const relatedCount = Object.keys(relatedVerses).length;
  console.log(`✓ ${relatedCount} ayet ilişkisi kaydedildi: ${relatedPath}`);

  console.log('\nTamamlandı! Şimdi import scriptini çalıştırın:');
  console.log('  npm run import-data');
}

main().catch((err) => {
  console.error('Hata:', err.message);
  process.exit(1);
});
