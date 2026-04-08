/**
 * Şinasi Güneş çevirisini doğrudan veritabanına import eder.
 * Çalıştır: node backend/src/db/import-gunes.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const GUNES_PATH = path.join(__dirname, '..', '..', '..', 'data', 'translations', 'tr.gunes.json');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchFresh() {
  console.log('apacikkuran.com API\'den taze veri çekiliyor...');
  const BASE = 'https://apacikkuran.com';
  const surahs = await fetch(`${BASE}/api/surahs`, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json());
  surahs.sort((a, b) => a.id - b.id);

  const translations = [];
  for (const s of surahs) {
    process.stdout.write(`  Sure ${s.id}...`);
    const verses = await fetch(`${BASE}/api/surahs/${s.id}/verses`, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json());
    for (const v of verses) {
      if (v.text_turkish) {
        translations.push({ surahId: s.id, verseNumber: v.verse_number, text: v.text_turkish.trim() });
      }
    }
    process.stdout.write(` ${verses.length} ayet\n`);
    await sleep(150);
  }
  // Kaydet
  fs.writeFileSync(GUNES_PATH, JSON.stringify(translations, null, 2), 'utf8');
  console.log(`Kaydedildi: ${translations.length} ayet`);
  return translations;
}

async function importToDB(translations) {
  console.log('\nVeritabanına ekleniyor...');
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Tercümanı ekle/güncelle
  db.run(`INSERT OR REPLACE INTO translators (code, name, language) VALUES ('tr.gunes', 'Şinasi Güneş', 'tr')`);

  const trResult = db.exec(`SELECT id FROM translators WHERE code = 'tr.gunes'`);
  const trId = trResult[0].values[0][0];
  console.log('Tercüman ID:', trId);

  // Mevcut tr.gunes çevirilerini temizle
  db.run(`DELETE FROM translations WHERE translator_id = ${trId}`);
  console.log('Eski çeviriler temizlendi.');

  db.run('BEGIN TRANSACTION');
  let count = 0, notFound = 0;

  for (const t of translations) {
    const vResult = db.exec(`SELECT id FROM verses WHERE surah_id = ${t.surahId} AND verse_number = ${t.verseNumber}`);
    if (!vResult.length || !vResult[0].values.length) { notFound++; continue; }
    const vId = vResult[0].values[0][0];
    const escaped = t.text.replace(/'/g, "''");
    db.run(`INSERT INTO translations (verse_id, translator_id, text) VALUES (${vId}, ${trId}, '${escaped}')`);
    count++;
  }

  db.run('COMMIT');
  console.log(`Eklendi: ${count} çeviri`);
  if (notFound > 0) console.log(`Bulunamayan ayet: ${notFound}`);

  // Kaydet
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('Veritabanı kaydedildi.');
}

async function main() {
  let translations;

  // Mevcut dosya varsa kullan, yoksa yeniden çek
  if (fs.existsSync(GUNES_PATH)) {
    const existing = JSON.parse(fs.readFileSync(GUNES_PATH, 'utf8'));
    if (existing.length > 6000) {
      console.log(`Mevcut dosyadan ${existing.length} çeviri yükleniyor...`);
      translations = existing;
    } else {
      console.log('Dosya eksik, yeniden çekiliyor...');
      translations = await fetchFresh();
    }
  } else {
    translations = await fetchFresh();
  }

  await importToDB(translations);
  console.log('\nTamamlandı!');
}

main().catch(console.error);
