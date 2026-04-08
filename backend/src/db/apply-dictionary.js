/**
 * Sözlükten anlamları veritabanına uygula.
 * Çalıştır: node backend/src/db/apply-dictionary.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const ROOT_MEANINGS = require('./root-dictionary');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');

function run() {
  console.log('Veritabanı yükleniyor...');
  const db = new Database(DB_PATH);

  const beforeRow = db.prepare(`SELECT COUNT(*) as n FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`).get();
  console.log('Anlamı eksik (önce):', beforeRow.n);

  const getMeaning = db.prepare(`SELECT meaning_tr FROM roots WHERE root = ?`);
  const updateMeaning = db.prepare(`UPDATE roots SET meaning_tr = ? WHERE root = ?`);

  let updated = 0;
  const process = db.transaction(() => {
    for (const [root, meaning] of Object.entries(ROOT_MEANINGS)) {
      const existing = getMeaning.get(root);
      if (!existing) continue;
      if (existing.meaning_tr && existing.meaning_tr.trim()) continue;
      updateMeaning.run(meaning, root);
      updated++;
    }
  });

  process();

  const afterRow = db.prepare(`SELECT COUNT(*) as n FROM roots WHERE meaning_tr IS NULL OR meaning_tr = ''`).get();
  console.log(`Güncellendi: ${updated}`);
  console.log('Anlamı eksik (sonra):', afterRow.n);
  db.close();
  console.log('Kaydedildi:', DB_PATH);
}

run();
