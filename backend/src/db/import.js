const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

const TRANSLATORS = {
  'tr.diyanet': { name: 'Diyanet Isleri', language: 'tr' },
  'tr.yazir': { name: 'Elmalili Hamdi Yazir', language: 'tr' },
  'tr.ates': { name: 'Suleyman Ates', language: 'tr' },
  'tr.bulac': { name: 'Ali Bulac', language: 'tr' },
  'tr.ozturk': { name: 'Yasar Nuri Ozturk', language: 'tr' },
  'tr.vakfi': { name: 'Diyanet Vakfi', language: 'tr' },
  'tr.golpinarli': { name: 'Abdulbaki Golpinarli', language: 'tr' },
  'en.yusufali': { name: 'Abdullah Yusuf Ali', language: 'en' },
  'en.arberry': { name: 'Arthur John Arberry', language: 'en' },
  'en.haleem': { name: 'Abdel Haleem', language: 'en' },
  'en.kamal': { name: 'Dr Kamal Omar', language: 'en' },
  'ar.uthmani': { name: 'Arapca (Uthmani)', language: 'ar' },
};

async function importData() {
  console.log('==================================================');
  console.log('  KURAN REHBERI - Veri Import');
  console.log('==================================================');

  const SQL = await initSqlJs();
  if (!fs.existsSync(DB_PATH)) {
    console.error('DB bulunamadi! Once: npm run init-db');
    return;
  }

  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Sureler
  console.log('\n[1/4] Sureler...');
  const surahsPath = path.join(DATA_DIR, 'surahs.json');
  if (fs.existsSync(surahsPath)) {
    const surahs = JSON.parse(fs.readFileSync(surahsPath, 'utf-8'));
    for (const s of surahs) {
      db.run('INSERT OR REPLACE INTO surahs (id, name, arabic_name, english_name, total_verses, revelation_type, revelation_order) VALUES (?,?,?,?,?,?,?)',
        [s.number, s.name, s.arabicName, s.englishName, s.verses, s.revelation, s.revelationOrder]);
    }
    console.log('  OK:', surahs.length, 'sure');
  }

  // Tercumanlar
  console.log('\n[2/4] Tercumanlar...');
  for (const [code, info] of Object.entries(TRANSLATORS)) {
    db.run('INSERT OR REPLACE INTO translators (code, name, language) VALUES (?,?,?)',
      [code, info.name, info.language]);
  }
  console.log('  OK:', Object.keys(TRANSLATORS).length);

  // Ceviriler
  console.log('\n[3/4] Ceviriler...');
  const translationsDir = path.join(DATA_DIR, 'translations');
  
  // Once Arapca (ayetler icin)
  const arabicFile = path.join(translationsDir, 'ar.uthmani.json');
  if (fs.existsSync(arabicFile)) {
    const content = fs.readFileSync(arabicFile, 'utf-8');
    const data = JSON.parse(content);
    if (data.quran) {
      for (const v of data.quran) {
        db.run('INSERT OR REPLACE INTO verses (surah_id, verse_number, arabic_text) VALUES (?,?,?)',
          [v.chapter, v.verse, v.text]);
      }
      console.log('  Arapca:', data.quran.length, 'ayet');
    }
  }

  // Diger ceviriler
  const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const code = file.replace('.json', '');
    if (!TRANSLATORS[code]) continue;
    
    try {
      const content = fs.readFileSync(path.join(translationsDir, file), 'utf-8');
      if (content.length < 100) continue;
      
      const data = JSON.parse(content);
      if (!data.quran) continue;

      const trResult = db.exec('SELECT id FROM translators WHERE code = ?', [code]);
      if (!trResult.length || !trResult[0].values.length) continue;
      const trId = trResult[0].values[0][0];

      let count = 0;
      for (const v of data.quran) {
        const vResult = db.exec('SELECT id FROM verses WHERE surah_id = ? AND verse_number = ?',
          [v.chapter, v.verse]);
        if (vResult.length && vResult[0].values.length) {
          const vId = vResult[0].values[0][0];
          db.run('INSERT OR REPLACE INTO translations (verse_id, translator_id, text) VALUES (?,?,?)',
            [vId, trId, v.text]);
          count++;
        }
      }
      console.log(' ', code + ':', count);
    } catch (e) {
      console.log(' ', code + ': HATA -', e.message);
    }
  }

  // Morfoloji
  console.log('\n[4/4] Morfoloji...');
  const morphPath = path.join(DATA_DIR, 'morphology', 'quran-morphology.txt');
  if (fs.existsSync(morphPath)) {
    const content = fs.readFileSync(morphPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const roots = new Map();
    for (const line of lines) {
      const m = line.match(/ROOT:([^\s|]+)/);
      if (m) roots.set(m[1], (roots.get(m[1]) || 0) + 1);
    }
    for (const [root, cnt] of roots) {
      db.run('INSERT OR IGNORE INTO roots (root, occurrence_count) VALUES (?,?)', [root, cnt]);
    }
    console.log('  OK:', roots.size, 'kok');
  }

  // Kaydet
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  db.close();
  console.log('\n==================================================');
  console.log('  TAMAMLANDI!');
  console.log('==================================================');
}

importData().catch(console.error);
