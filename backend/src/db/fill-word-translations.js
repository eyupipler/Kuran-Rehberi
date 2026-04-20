/**
 * Kökü olan ama translation_tr eksik kelimeleri,
 * kökün meaning_tr'si ile doldurur.
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../kuran.db');

initSqlJs().then(SQL => {
  const buf = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buf);

  // Kaç tane doldurulacak?
  const [[before]] = db.exec(`
    SELECT COUNT(*) FROM words w
    JOIN roots r ON r.id = w.root_id
    WHERE w.translation_tr IS NULL AND r.meaning_tr IS NOT NULL
  `)[0].values;
  console.log('Doldurulacak kelime sayısı:', before);

  // Doldur: root.meaning_tr'nin ilk anlamını al (virgülden öncesi)
  db.run(`
    UPDATE words
    SET translation_tr = (
      SELECT TRIM(SUBSTR(r.meaning_tr, 1,
        CASE WHEN INSTR(r.meaning_tr, ',') > 0
             THEN INSTR(r.meaning_tr, ',') - 1
             ELSE LENGTH(r.meaning_tr) END
      ))
      FROM roots r
      WHERE r.id = words.root_id AND r.meaning_tr IS NOT NULL
    )
    WHERE translation_tr IS NULL
      AND root_id IS NOT NULL
      AND (SELECT meaning_tr FROM roots WHERE id = words.root_id) IS NOT NULL
  `);

  const [[after]] = db.exec(`
    SELECT COUNT(*) FROM words WHERE translation_tr IS NULL
  `)[0].values;

  console.log('İşlem sonrası null translation_tr:', after);
  console.log('Dolduruldu:', before - (after - (
    db.exec('SELECT COUNT(*) FROM words WHERE translation_tr IS NULL AND root_id IS NULL')[0].values[0][0]
  )));

  // Kaydet
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log('DB kaydedildi:', DB_PATH);
  db.close();
}).catch(e => { console.error(e); process.exit(1); });
