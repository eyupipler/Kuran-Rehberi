/**
 * Lemma'sı NULL olan kelimeler için arabic_word bazlı eşleşme
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const PRON = require('./pronouns-tr');

const DB_PATH = path.join(__dirname, '../../kuran.db');

function stripDiacritics(s) {
  if (!s) return s;
  return String(s)
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '') // harekeler + tatwil + Quranic marks
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')  // آ أ إ → ا
    .replace(/\u0649/g, '\u064A');               // ى → ي
}

// Normalize sözlük
const NORM = {};
for (const [k, v] of Object.entries(PRON)) {
  const [w, pos] = k.split('|');
  NORM[`${stripDiacritics(w)}|${pos}`] = v;
}

initSqlJs().then(SQL => {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));

  const before = db.exec(`SELECT COUNT(*) FROM words WHERE translation_tr IS NULL AND root_id IS NULL AND lemma IS NULL`)[0].values[0][0];
  console.log('Başlangıç — lemma NULL:', before);

  const rows = db.exec(`SELECT id, arabic_word, part_of_speech FROM words WHERE translation_tr IS NULL AND root_id IS NULL AND lemma IS NULL`)[0]?.values || [];
  const stmt = db.prepare(`UPDATE words SET translation_tr = ? WHERE id = ?`);
  let updated = 0, missed = {};

  for (const [id, word, pos] of rows) {
    const key = `${stripDiacritics(word)}|${pos}`;
    const tr = NORM[key];
    if (tr) { stmt.run([tr, id]); updated++; }
    else missed[key] = (missed[key] || 0) + 1;
  }
  stmt.free();

  console.log('Güncellenen:', updated);
  const after = db.exec(`SELECT COUNT(*) FROM words WHERE translation_tr IS NULL AND root_id IS NULL AND lemma IS NULL`)[0].values[0][0];
  console.log('Kalan (lemma NULL):', after);
  console.log('\nEn çok atlanan:');
  Object.entries(missed).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([k,c])=>console.log(`  ${c.toString().padStart(5)} × ${k}`));

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('\nDB kaydedildi.');
  db.close();
}).catch(e => { console.error(e); process.exit(1); });
