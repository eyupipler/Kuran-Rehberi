/**
 * Tüm köklere word-level translation_tr'den anlam türet ve kaydet.
 * Çalıştır: node backend/src/db/populate-root-meanings.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');

async function run() {
  console.log('Veritabanı yükleniyor...');
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Kaç kökte anlam eksik?
  const before = db.exec(`SELECT COUNT(*) as n FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`);
  console.log('Anlamı eksik kök sayısı (önce):', before[0].values[0][0]);

  // Tüm kökleri al
  const roots = db.exec(`SELECT id FROM roots`);
  const rootIds = roots[0].values.map(r => r[0]);
  console.log('Toplam kök:', rootIds.length);

  let updated = 0;
  let skipped = 0;

  db.run('BEGIN TRANSACTION');

  for (const rootId of rootIds) {
    // Mevcut anlamı kontrol et
    const existing = db.exec(`SELECT meaning_tr FROM roots WHERE id = ${rootId}`);
    const currentMeaning = existing[0]?.values[0]?.[0];
    if (currentMeaning && currentMeaning.trim()) {
      skipped++;
      continue; // Zaten anlamı var
    }

    // Word-level translation_tr'den en sık geçen anlamları al
    const wordMeanings = db.exec(`
      SELECT translation_tr, COUNT(*) as cnt
      FROM words
      WHERE root_id = ${rootId}
        AND translation_tr IS NOT NULL
        AND translation_tr != ''
        AND length(translation_tr) > 1
      GROUP BY translation_tr
      ORDER BY cnt DESC
      LIMIT 6
    `);

    if (!wordMeanings[0] || wordMeanings[0].values.length === 0) continue;

    // Benzersiz anlamları birleştir
    const seen = new Set();
    const meanings = [];
    for (const [meaning] of wordMeanings[0].values) {
      if (!meaning) continue;
      const cleaned = meaning.trim();
      const key = cleaned.toLowerCase();
      if (!seen.has(key) && cleaned.length > 0) {
        seen.add(key);
        meanings.push(cleaned);
      }
      if (meanings.length >= 4) break;
    }

    if (meanings.length === 0) continue;

    const combined = meanings.join(', ');
    // SQL injection'a karşı escape
    const escaped = combined.replace(/'/g, "''");
    db.run(`UPDATE roots SET meaning_tr = '${escaped}' WHERE id = ${rootId}`);
    updated++;
  }

  db.run('COMMIT');

  const after = db.exec(`SELECT COUNT(*) as n FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`);
  console.log(`Güncellenen kök: ${updated}`);
  console.log(`Atlandı (zaten var): ${skipped}`);
  console.log('Anlamı eksik kalan kök sayısı (sonra):', after[0].values[0][0]);

  // Kaydet
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('Veritabanı kaydedildi:', DB_PATH);
}

run().catch(console.error);
