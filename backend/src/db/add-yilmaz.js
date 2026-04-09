/**
 * Hakkı Yılmaz mealini mevcut veritabanına ekler.
 * sql.js kullanır (better-sqlite3 derlenmemiş Windows'ta da çalışır).
 * Çalıştır: node backend/src/db/add-yilmaz.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const YILMAZ_JSON = path.join(__dirname, '..', '..', '..', 'data', 'translations', 'tr.yilmaz.json');

const TRANSLATOR_CODE = 'tr.yilmaz';
const TRANSLATOR_NAME = 'Hakkı Yılmaz';
const TRANSLATOR_LANG = 'tr';

async function run() {
  console.log('Yılmaz meali veritabanına ekleniyor...');
  console.log('DB:', DB_PATH);

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Load Yılmaz translations
  console.log('JSON yükleniyor:', YILMAZ_JSON);
  const verses = JSON.parse(fs.readFileSync(YILMAZ_JSON, 'utf8'));
  console.log('Toplam ayet:', verses.length);

  // Get or create translator
  let translatorId;
  const existingRows = db.exec(`SELECT id FROM translators WHERE code = '${TRANSLATOR_CODE}'`);
  if (existingRows.length > 0 && existingRows[0].values.length > 0) {
    translatorId = existingRows[0].values[0][0];
    console.log('Mevcut çevirmen bulundu, id:', translatorId);
    db.run(`DELETE FROM translations WHERE translator_id = ${translatorId}`);
    console.log('Eski çeviriler silindi.');
  } else {
    db.run(
      `INSERT INTO translators (code, name, language) VALUES ('${TRANSLATOR_CODE}', '${TRANSLATOR_NAME}', '${TRANSLATOR_LANG}')`
    );
    const rows = db.exec(`SELECT id FROM translators WHERE code = '${TRANSLATOR_CODE}'`);
    translatorId = rows[0].values[0][0];
    console.log('Yeni çevirmen eklendi, id:', translatorId);
  }

  // Build verse_id map for all needed (surahId, verseNumber) pairs
  console.log('Ayet id haritası oluşturuluyor...');
  const verseMapRows = db.exec(`SELECT id, surah_id, verse_number FROM verses`);
  const verseMap = new Map();
  if (verseMapRows.length > 0) {
    for (const [id, surahId, verseNumber] of verseMapRows[0].values) {
      verseMap.set(`${surahId}:${verseNumber}`, id);
    }
  }
  console.log('Toplam verse kayıtları:', verseMap.size);

  // Insert in transaction
  db.run('BEGIN');
  let inserted = 0;
  let skipped = 0;

  for (const v of verses) {
    const verseId = verseMap.get(`${v.surahId}:${v.verseNumber}`);
    if (!verseId) {
      skipped++;
      continue;
    }
    // Escape single quotes in text
    const safeText = v.text.replace(/'/g, "''");
    db.run(
      `INSERT OR IGNORE INTO translations (verse_id, translator_id, text) VALUES (${verseId}, ${translatorId}, '${safeText}')`
    );
    inserted++;
    if (inserted % 1000 === 0) process.stdout.write(`  ${inserted}/${verses.length}\r`);
  }

  db.run('COMMIT');
  console.log(`\nEklendi: ${inserted}, Atlandı: ${skipped}`);

  // Verify
  const countRows = db.exec(`SELECT COUNT(*) FROM translations WHERE translator_id = ${translatorId}`);
  console.log('Doğrulama - toplam kayıt:', countRows[0].values[0][0]);

  // Save
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('Veritabanı kaydedildi:', DB_PATH);
  console.log('Tamamlandı!');
}

run().catch(err => { console.error('Hata:', err); process.exit(1); });
