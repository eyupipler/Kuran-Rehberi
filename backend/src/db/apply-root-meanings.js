/**
 * root-meanings-tr.js sözlüğünü DB'ye uygular
 * Sadece meaning_tr NULL olan kökleri günceller
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const ROOT_MEANINGS_TR = require('./root-meanings-tr');

const DB_PATH = path.join(__dirname, '../../kuran.db');

initSqlJs().then(SQL => {
  const buf = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buf);

  // Mevcut null meaning_tr kökleri al
  const existing = db.exec(`SELECT id, root FROM roots WHERE meaning_tr IS NULL`)[0]?.values || [];
  console.log('Güncellenecek kök sayısı (null olanlar):', existing.length);

  let updated = 0;
  const stmt = db.prepare(`UPDATE roots SET meaning_tr = ? WHERE id = ? AND meaning_tr IS NULL`);

  for (const [id, root] of existing) {
    const meaning = ROOT_MEANINGS_TR[root];
    if (meaning) {
      stmt.run([meaning, id]);
      updated++;
    }
  }
  stmt.free();

  console.log('Güncellenen kök:', updated, '/', existing.length);

  // Şimdi bu köklere bağlı kelimelere de meaning_tr'yi doldur
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

  const [[remaining]] = db.exec(`SELECT COUNT(*) FROM words WHERE translation_tr IS NULL`)[0].values;
  console.log('Kalan null translation_tr (kelimeler):', remaining);

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log('DB kaydedildi:', DB_PATH);
  db.close();
}).catch(e => { console.error(e); process.exit(1); });
