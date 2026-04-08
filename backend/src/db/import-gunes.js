/**
 * Şinasi Güneş çevirisini doğrudan veritabanına import eder.
 * Çalıştır: node backend/src/db/import-gunes.js
 */

const Database = require('better-sqlite3');
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
  fs.writeFileSync(GUNES_PATH, JSON.stringify(translations, null, 2), 'utf8');
  console.log(`Kaydedildi: ${translations.length} ayet`);
  return translations;
}

function importToDB(translations) {
  console.log('\nVeritabanına ekleniyor...');
  const db = new Database(DB_PATH);

  db.prepare(`INSERT OR REPLACE INTO translators (code, name, language) VALUES ('tr.gunes', 'Şinasi Güneş', 'tr')`).run();
  const trRow = db.prepare(`SELECT id FROM translators WHERE code = 'tr.gunes'`).get();
  const trId = trRow.id;
  console.log('Tercüman ID:', trId);

  db.prepare(`DELETE FROM translations WHERE translator_id = ?`).run(trId);
  console.log('Eski çeviriler temizlendi.');

  let count = 0, notFound = 0;
  const insertTrans = db.prepare('INSERT INTO translations (verse_id, translator_id, text) VALUES (?,?,?)');
  const getVerse = db.prepare('SELECT id FROM verses WHERE surah_id = ? AND verse_number = ?');

  const insertBatch = db.transaction((rows) => {
    for (const t of rows) {
      const vRow = getVerse.get(t.surahId, t.verseNumber);
      if (!vRow) { notFound++; continue; }
      insertTrans.run(vRow.id, trId, t.text);
      count++;
    }
  });

  insertBatch(translations);
  db.close();
  console.log(`Eklendi: ${count} çeviri`);
  if (notFound > 0) console.log(`Bulunamayan ayet: ${notFound}`);
  console.log('Veritabanı kaydedildi.');
}

async function main() {
  let translations;

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

  importToDB(translations);
  console.log('\nTamamlandı!');
}

main().catch(console.error);
