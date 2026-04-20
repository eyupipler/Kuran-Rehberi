/**
 * particles-tr.js sözlüğünü DB'ye uygular
 * Sadece root_id IS NULL AND translation_tr IS NULL olan kelimeleri günceller
 * Eşleşme: TRIM(lemma) + '|' + part_of_speech
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const PARTICLES = require('./particles-tr');

const DB_PATH = path.join(__dirname, '../../kuran.db');

// Arapça harekelerini (diacritics) kaldır + trim — eşleşmeyi sağlamlaştırır
// Shadda/fatha sıralaması DB ile sözlük arasında farklı olabiliyor
function stripDiacritics(s) {
  if (!s) return s;
  return String(s).trim().replace(/[\u064B-\u065F\u0670\u0640]/g, '');
}

// Sözlüğü normalize edilmiş anahtarlarla yeniden kur
const NORM_PARTICLES = {};
for (const [k, v] of Object.entries(PARTICLES)) {
  const [lemma, pos] = k.split('|');
  const nk = `${stripDiacritics(lemma)}|${pos}`;
  if (!NORM_PARTICLES[nk]) NORM_PARTICLES[nk] = v;
}

initSqlJs().then(SQL => {
  const db = new SQL.Database(fs.readFileSync(DB_PATH));

  const before = db.exec(`SELECT COUNT(*) FROM words WHERE translation_tr IS NULL AND root_id IS NULL`)[0].values[0][0];
  console.log('Başlangıç — root_id NULL + translation_tr NULL:', before);

  const stmt = db.prepare(`
    UPDATE words
    SET translation_tr = ?
    WHERE id = ?
  `);

  // Fetch all candidates
  const rows = db.exec(`SELECT id, lemma, part_of_speech FROM words WHERE translation_tr IS NULL AND root_id IS NULL`)[0]?.values || [];
  let updated = 0, missed = {};

  for (const [id, lemma, pos] of rows) {
    if (!lemma) { missed[`(null)|${pos}`] = (missed[`(null)|${pos}`] || 0) + 1; continue; }
    const key = `${stripDiacritics(lemma)}|${pos}`;
    const tr = NORM_PARTICLES[key];
    if (tr) {
      stmt.run([tr, id]);
      updated++;
    } else {
      missed[key] = (missed[key] || 0) + 1;
    }
  }
  stmt.free();

  const after = db.exec(`SELECT COUNT(*) FROM words WHERE translation_tr IS NULL AND root_id IS NULL`)[0].values[0][0];
  console.log('Güncellenen:', updated);
  console.log('Kalan NULL (root_id NULL):', after);

  // Show top missed lemmas
  const missedList = Object.entries(missed).sort((a, b) => b[1] - a[1]).slice(0, 30);
  console.log('\nEn çok atlanan lemma|pos:');
  missedList.forEach(([k, c]) => console.log(`  ${c.toString().padStart(5)} × ${k}`));

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('\nDB kaydedildi.');
  db.close();
}).catch(e => { console.error(e); process.exit(1); });
