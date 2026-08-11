/**
 * Veritabani Baslangic Scripti
 * better-sqlite3 yoksa sql.js kullanılır.
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const FTS_SCHEMA_PATH = path.join(__dirname, 'schema-fts.sql');

function applyFts(exec) {
  // FTS5 her SQLite derlemesinde bulunmaz; yoksa arama LIKE ile calismaya devam eder.
  try {
    exec(fs.readFileSync(FTS_SCHEMA_PATH, 'utf-8'));
    console.log('FTS5 tablosu olusturuldu.');
  } catch (err) {
    console.log('FTS5 desteklenmiyor, atlandi:', err.message);
  }
}

async function initDatabase() {
  console.log('Veritabani olusturuluyor...');
  console.log('Konum:', DB_PATH);

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Mevcut veritabani silindi.');
  }

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  try {
    const Database = require('better-sqlite3');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(schema);
    applyFts((sql) => db.exec(sql));
    db.close();
    console.log('Veritabani hazir! (better-sqlite3)');
    return;
  } catch (e) {
    console.log('better-sqlite3 yok, sql.js kullaniliyor:', e.code || e.message);
  }

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(schema);
  applyFts((sql) => db.run(sql));
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  db.close();
  console.log('Veritabani hazir! (sql.js)');
}

initDatabase().catch((err) => {
  console.error('Hata:', err);
  process.exit(1);
});
