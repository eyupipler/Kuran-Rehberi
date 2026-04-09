/**
 * Veritabani Baslangic Scripti
 * better-sqlite3 yoksa sql.js kullanır.
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function initDatabase() {
  console.log('Veritabani olusturuluyor...');
  console.log('Konum:', DB_PATH);

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Mevcut veritabani silindi.');
  }

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  // Try better-sqlite3 first
  try {
    const Database = require('better-sqlite3');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(schema);
    db.close();
    console.log('Veritabani hazir! (better-sqlite3)');
    return;
  } catch (e) {
    console.log('better-sqlite3 yok, sql.js kullaniliyor:', e.code || e.message);
  }

  // Fallback: sql.js
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(schema);
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('Veritabani hazir! (sql.js)');
}

initDatabase().catch(err => { console.error('Hata:', err); process.exit(1); });
