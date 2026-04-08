/**
 * Sözlükten anlamları veritabanına uygula.
 * Çalıştır: node backend/src/db/apply-dictionary.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const ROOT_MEANINGS = require('./root-dictionary');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');

async function run() {
  console.log('Veritabanı yükleniyor...');
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  const before = db.exec(`SELECT COUNT(*) FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`);
  console.log('Anlamı eksik (önce):', before[0].values[0][0]);

  db.run('BEGIN TRANSACTION');
  let updated = 0;

  for (const [root, meaning] of Object.entries(ROOT_MEANINGS)) {
    const existing = db.exec(`SELECT meaning_tr FROM roots WHERE root = '${root.replace(/'/g, "''")}'`);
    if (!existing[0]) continue; // Bu kök veritabanında yok

    const currentMeaning = existing[0].values[0]?.[0];
    if (currentMeaning && currentMeaning.trim()) continue; // Zaten var

    const escaped = meaning.replace(/'/g, "''");
    db.run(`UPDATE roots SET meaning_tr = '${escaped}' WHERE root = '${root.replace(/'/g, "''")}'`);
    updated++;
  }

  db.run('COMMIT');

  const after = db.exec(`SELECT COUNT(*) FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`);
  console.log(`Güncellendi: ${updated}`);
  console.log('Anlamı eksik (sonra):', after[0].values[0][0]);

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('Kaydedildi:', DB_PATH);
}

run().catch(console.error);
