/**
 * Veritabani Baslangic Scripti (better-sqlite3)
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initDatabase() {
  console.log('Veritabani olusturuluyor...');
  console.log('Konum:', DB_PATH);

  // Eski veritabanini sil (varsa)
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Mevcut veritabani silindi.');
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Semayi oku ve uygula
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('Sema basariyla uygulandi.');

  db.close();
  console.log('Veritabani hazir!');
}

initDatabase();
