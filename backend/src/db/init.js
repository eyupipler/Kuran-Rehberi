/**
 * Veritabani Baslangic Scripti (sql.js)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function initDatabase() {
  console.log('Veritabani olusturuluyor...');
  console.log('Konum:', DB_PATH);

  // Eski veritabanini sil (varsa)
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Mevcut veritabani silindi.');
  }

  // sql.js yukle
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Semayi oku ve uygula
  let schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  
  // FTS5 ve trigger'lari kaldir (sql.js desteklemiyor)
  schema = schema.replace(/CREATE VIRTUAL TABLE.*?;/gs, '');
  schema = schema.replace(/CREATE TRIGGER.*?END;/gs, '');
  
  db.run(schema);
  console.log('Sema basariyla uygulandi.');

  // Kaydet
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);

  db.close();
  console.log('Veritabani hazir!');
}

initDatabase().catch(console.error);
