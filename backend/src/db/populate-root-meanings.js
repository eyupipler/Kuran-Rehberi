/**
 * Tüm köklere word-level translation_tr'den anlam türet ve kaydet.
 * Çalıştır: node backend/src/db/populate-root-meanings.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');

function run() {
  console.log('Veritabanı yükleniyor...');
  const db = new Database(DB_PATH);

  const beforeRow = db.prepare(`SELECT COUNT(*) as n FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`).get();
  console.log('Anlamı eksik kök sayısı (önce):', beforeRow.n);

  const rootIds = db.prepare(`SELECT id FROM roots`).all().map(r => r.id);
  console.log('Toplam kök:', rootIds.length);

  let updated = 0;
  let skipped = 0;

  const getMeaning = db.prepare(`SELECT meaning_tr FROM roots WHERE id = ?`);
  const getWordMeanings = db.prepare(`
    SELECT translation_tr, COUNT(*) as cnt
    FROM words
    WHERE root_id = ?
      AND translation_tr IS NOT NULL
      AND translation_tr != ''
      AND length(translation_tr) > 1
    GROUP BY translation_tr
    ORDER BY cnt DESC
    LIMIT 6
  `);
  const updateMeaning = db.prepare(`UPDATE roots SET meaning_tr = ? WHERE id = ?`);

  const process = db.transaction(() => {
    for (const rootId of rootIds) {
      const existing = getMeaning.get(rootId);
      if (existing && existing.meaning_tr && existing.meaning_tr.trim()) {
        skipped++;
        continue;
      }

      const wordMeanings = getWordMeanings.all(rootId);
      if (!wordMeanings.length) continue;

      const seen = new Set();
      const meanings = [];
      for (const row of wordMeanings) {
        if (!row.translation_tr) continue;
        const cleaned = row.translation_tr.trim();
        const key = cleaned.toLowerCase();
        if (!seen.has(key) && cleaned.length > 0) {
          seen.add(key);
          meanings.push(cleaned);
        }
        if (meanings.length >= 4) break;
      }

      if (!meanings.length) continue;
      updateMeaning.run(meanings.join(', '), rootId);
      updated++;
    }
  });

  process();

  const afterRow = db.prepare(`SELECT COUNT(*) as n FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`).get();
  console.log(`Güncellenen kök: ${updated}`);
  console.log(`Atlandı (zaten var): ${skipped}`);
  console.log('Anlamı eksik kalan kök sayısı (sonra):', afterRow.n);

  db.close();
  console.log('Tamamlandı:', DB_PATH);
}

run();
