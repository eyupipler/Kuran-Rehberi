/**
 * Veritabani Baglantisi
 * Önce better-sqlite3 (hafif, dosya tabanlı) dener,
 * yüklenemezse sql.js'e geri döner.
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');

let db = null;
let useBetterSqlite = false;

async function initDatabase() {
  if (db) return db;

  console.log('Veritabanı yolu:', DB_PATH);

  // better-sqlite3 dene (Render/Linux'ta çalışır)
  try {
    const Database = require('better-sqlite3');
    const rawDb = new Database(DB_PATH);
    rawDb.pragma('journal_mode = WAL');
    rawDb.pragma('foreign_keys = ON');
    db = rawDb; // better-sqlite3: prepare().get/all/run direkt çalışır
    useBetterSqlite = true;
    console.log('Veritabanı yüklendi. (better-sqlite3)');
    return db;
  } catch (e) {
    console.log('better-sqlite3 yok, sql.js kullanılıyor:', e.code || e.message);
  }

  // sql.js fallback (her platformda çalışır ama tüm DB'yi RAM'e yükler)
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    const rawDb = new SQL.Database(buffer);
    // sql.js için better-sqlite3 uyumlu wrapper
    db = makeSqlJsWrapper(rawDb);
  } else {
    db = makeSqlJsWrapper(new SQL.Database());
  }

  console.log('Veritabanı yüklendi. (sql.js)');
  return db;
}

/**
 * sql.js instance'ını better-sqlite3 API'siyle sarar:
 * db.prepare(sql).all(...params)
 * db.prepare(sql).get(...params)
 * db.prepare(sql).run(...params)
 * db.exec(sql)
 */
function makeSqlJsWrapper(rawDb) {
  return {
    _raw: rawDb,
    prepare(sql) {
      return {
        all(...params) {
          const stmt = rawDb.prepare(sql);
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          stmt.bind(flat);
          const results = [];
          while (stmt.step()) results.push(stmt.getAsObject());
          stmt.free();
          return results;
        },
        get(...params) {
          const stmt = rawDb.prepare(sql);
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          stmt.bind(flat);
          const row = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return row;
        },
        run(...params) {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          rawDb.run(sql, flat);
        },
      };
    },
    exec(sql) { rawDb.run(sql); },
    pragma() {}, // sql.js'te gerek yok, no-op
    transaction(fn) {
      return (arg) => {
        rawDb.run('BEGIN');
        try { fn(arg); rawDb.run('COMMIT'); }
        catch (e) { rawDb.run('ROLLBACK'); throw e; }
      };
    },
    close() { rawDb.close(); },
  };
}

function getDatabase() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

function saveDatabase() {
  if (!useBetterSqlite && db && db._raw) {
    const data = db._raw.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
  // better-sqlite3 otomatik kaydeder, bir şey yapmaya gerek yok
}

module.exports = { initDatabase, getDatabase, saveDatabase, DB_PATH };
