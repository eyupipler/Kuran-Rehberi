/**
 * roots-extra-tr.js sözlüğünü DB'ye uygular (diacritic-normalized match)
 * Sonra bu köklere bağlı NULL translation_tr'li kelimeleri doldurur
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const EXTRA = require('./roots-extra-tr');

const DB_PATH = path.join(__dirname, '../../kuran.db');

function stripD(s) {
  if (!s) return s;
  return String(s)
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    .replace(/\u0649/g, '\u064A');
}

const NORM = {};
for (const [k, v] of Object.entries(EXTRA)) NORM[stripD(k)] = v;

initSqlJs().then(SQL => {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));

  const before = db.exec(`SELECT COUNT(*) FROM roots WHERE meaning_tr IS NULL`)[0].values[0][0];
  console.log('Başlangıç — null meaning_tr root sayısı:', before);

  const rows = db.exec(`SELECT id, root FROM roots WHERE meaning_tr IS NULL`)[0]?.values || [];
  const stmt = db.prepare(`UPDATE roots SET meaning_tr = ? WHERE id = ?`);
  let updated = 0, missed = [];

  for (const [id, root] of rows) {
    const key = stripD(root);
    const tr = NORM[key];
    if (tr) { stmt.run([tr, id]); updated++; }
    else missed.push(root);
  }
  stmt.free();

  console.log('Kök güncellendi:', updated);
  console.log('Eşleşmeyen kök:', missed.length);
  if (missed.length && missed.length < 30) {
    console.log('Eşleşmeyenler:', missed);
  }

  // Sonra bu yeni meaning_tr'lere bağlı kelimelere de çeviri doldur
  db.run(`
    UPDATE words
    SET translation_tr = (
      SELECT TRIM(SUBSTR(r.meaning_tr, 1,
        CASE WHEN INSTR(r.meaning_tr, ',') > 0
             THEN INSTR(r.meaning_tr, ',') - 1
             ELSE LENGTH(r.meaning_tr) END
      ))
      FROM roots r WHERE r.id = words.root_id AND r.meaning_tr IS NOT NULL
    )
    WHERE translation_tr IS NULL
      AND root_id IS NOT NULL
      AND (SELECT meaning_tr FROM roots WHERE id = words.root_id) IS NOT NULL
  `);

  const totalNull = db.exec(`SELECT COUNT(*) FROM words WHERE translation_tr IS NULL`)[0].values[0][0];
  const total = db.exec(`SELECT COUNT(*) FROM words`)[0].values[0][0];
  console.log(`\nToplam kelime: ${total}`);
  console.log(`Null translation_tr: ${totalNull}`);
  console.log(`Coverage: ${((1 - totalNull/total) * 100).toFixed(2)}%`);

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('\nDB kaydedildi.');
  db.close();
}).catch(e => { console.error(e); process.exit(1); });
