const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

const TRANSLATORS = {
  'tr.diyanet': { name: 'Diyanet İşleri', language: 'tr' },
  'tr.yazir': { name: 'Elmalılı Hamdi Yazır', language: 'tr' },
  'tr.ates': { name: 'Süleyman Ateş', language: 'tr' },
  'tr.bulac': { name: 'Ali Bulaç', language: 'tr' },
  'tr.ozturk': { name: 'Yaşar Nuri Öztürk', language: 'tr' },
  'tr.vakfi': { name: 'Diyanet Vakfı', language: 'tr' },
  'tr.golpinarli': { name: 'Abdülbaki Gölpınarlı', language: 'tr' },
  'tr.parliyan': { name: 'Abdullah Parlıyan', language: 'tr' },
  'tr.ugur': { name: 'Adem Uğur', language: 'tr' },
  'tr.hulusi': { name: 'Ahmed Hulusi', language: 'tr' },
  'tr.varol': { name: 'Ahmet Varol', language: 'tr' },
  'tr.yavuz': { name: 'Ali Fikri Yavuz', language: 'tr' },
  'tr.bayrakli': { name: 'Bayraktar Bayraklı', language: 'tr' },
  'tr.sadak': { name: 'Bekir Sadak', language: 'tr' },
  'tr.yildirim_celal': { name: 'Celal Yıldırım', language: 'tr' },
  'tr.kulunkoglu': { name: 'Cemal Külünkoğlu', language: 'tr' },
  'tr.edip': { name: 'Edip Yüksel', language: 'tr' },
  'tr.fizilal': { name: 'Fizilal-il Kuran', language: 'tr' },
  'tr.onan': { name: 'Gültekin Onan', language: 'tr' },
  'tr.yildirim_harun': { name: 'Harun Yıldırım', language: 'tr' },
  'tr.cantay': { name: 'Hasan Basri Çantay', language: 'tr' },
  'tr.hayrat': { name: 'Hayrat Neşriyat', language: 'tr' },
  'tr.kesir': { name: 'İbn-i Kesir', language: 'tr' },
  'tr.yorulmaz': { name: 'İlyas Yorulmaz', language: 'tr' },
  'tr.mihr': { name: 'İskender Ali Mihr', language: 'tr' },
  'tr.celik': { name: 'Kadri Çelik', language: 'tr' },
  'tr.esed': { name: 'Muhammed Esed', language: 'tr' },
  'tr.islamoglu': { name: 'Mustafa İslamoğlu', language: 'tr' },
  'tr.bilmen': { name: 'Ömer Nasuhi Bilmen', language: 'tr' },
  'tr.ongut': { name: 'Ömer Öngüt', language: 'tr' },
  'tr.piris': { name: 'Şaban Piriş', language: 'tr' },
  'tr.turkmen': { name: 'Sadık Türkmen', language: 'tr' },
  'tr.kutub': { name: 'Seyyid Kutub', language: 'tr' },
  'tr.yildirim_suat': { name: 'Suat Yıldırım', language: 'tr' },
  'tr.tefhim': { name: 'Tefhim-ul Kuran', language: 'tr' },
  'tr.gunes': { name: 'Şinasi Güneş', language: 'tr' },
  'tr.yilmaz': { name: 'Hakkı Yılmaz', language: 'tr' },
  'en.yusufali': { name: 'Abdullah Yusuf Ali', language: 'en' },
  'en.arberry': { name: 'Arthur John Arberry', language: 'en' },
  'en.haleem': { name: 'Abdel Haleem', language: 'en' },
  'en.kamal': { name: 'Dr Kamal Omar', language: 'en' },
  'en.pickthall': { name: 'Mohammad Marmaduke Pickthall', language: 'en' },
  'en.sahih': { name: 'Sahih International', language: 'en' },
  'ar.uthmani': { name: 'Arapça (Uthmani)', language: 'ar' },
};

function importData() {
  console.log('==================================================');
  console.log('  KURAN REHBERI - Veri Import');
  console.log('==================================================');

  if (!fs.existsSync(DB_PATH)) {
    console.error('DB bulunamadı! Önce: npm run init-db');
    return;
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Türkçe kelime çevirileri
  let wordTranslations = {};
  let rootMeanings = {};
  const wordTransPath = path.join(DATA_DIR, 'word-translations-tr.json');
  if (fs.existsSync(wordTransPath)) {
    const transData = JSON.parse(fs.readFileSync(wordTransPath, 'utf-8'));
    wordTranslations = transData.translations || {};
    rootMeanings = transData.rootMeanings || {};

    const extendedPath = path.join(DATA_DIR, 'extended-roots.json');
    if (fs.existsSync(extendedPath)) {
      const extendedMeanings = JSON.parse(fs.readFileSync(extendedPath, 'utf-8'));
      for (const [root, meanings] of Object.entries(extendedMeanings)) {
        rootMeanings[root] = meanings;
      }
      console.log('Genişletilmiş kök anlamları yüklendi:', Object.keys(extendedMeanings).length, 'adet');
    }

    console.log('Türkçe çeviriler yüklendi:', Object.keys(wordTranslations).length, 'kelime,', Object.keys(rootMeanings).length, 'kök');
  }

  // ---- [1/4] Sureler ----
  console.log('\n[1/4] Sureler...');
  const surahsPath = path.join(DATA_DIR, 'surahs.json');
  if (fs.existsSync(surahsPath)) {
    const surahs = JSON.parse(fs.readFileSync(surahsPath, 'utf-8'));
    const insertSurah = db.prepare(
      'INSERT OR REPLACE INTO surahs (id, name, arabic_name, english_name, total_verses, revelation_type, revelation_order) VALUES (?,?,?,?,?,?,?)'
    );
    const insertMany = db.transaction((rows) => {
      for (const s of rows) {
        insertSurah.run(s.number, s.name, s.arabicName, s.englishName, s.verses, s.revelation, s.revelationOrder);
      }
    });
    insertMany(surahs);
    console.log('  OK:', surahs.length, 'sure');
  }

  // ---- [2/4] Tercümanlar ----
  console.log('\n[2/4] Tercümanlar...');
  const insertTranslator = db.prepare('INSERT OR REPLACE INTO translators (code, name, language) VALUES (?,?,?)');
  const insertTranslators = db.transaction((entries) => {
    for (const [code, info] of entries) {
      insertTranslator.run(code, info.name, info.language);
    }
  });
  insertTranslators(Object.entries(TRANSLATORS));
  console.log('  OK:', Object.keys(TRANSLATORS).length);

  // ---- [3/4] Çeviriler ----
  console.log('\n[3/4] Çeviriler...');
  const translationsDir = path.join(DATA_DIR, 'translations');

  // Önce Arapça (ayetler için)
  const arabicFile = path.join(translationsDir, 'ar.uthmani.json');
  if (fs.existsSync(arabicFile)) {
    const data = JSON.parse(fs.readFileSync(arabicFile, 'utf-8'));
    if (data.quran) {
      const insertVerse = db.prepare('INSERT OR REPLACE INTO verses (surah_id, verse_number, arabic_text) VALUES (?,?,?)');
      const insertVerses = db.transaction((verses) => {
        for (const v of verses) insertVerse.run(v.chapter, v.verse, v.text);
      });
      insertVerses(data.quran);
      console.log('  Arapça:', data.quran.length, 'ayet');
    }
  }

  // Verse ID önbelleği
  const verseIdCache = new Map();
  for (const row of db.prepare('SELECT id, surah_id, verse_number FROM verses').all()) {
    verseIdCache.set(`${row.surah_id}:${row.verse_number}`, row.id);
  }

  // Diğer çeviriler
  const insertTrans = db.prepare('INSERT OR REPLACE INTO translations (verse_id, translator_id, text) VALUES (?,?,?)');

  const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const code = file.replace('.json', '');
    if (!TRANSLATORS[code]) continue;

    try {
      const content = fs.readFileSync(path.join(translationsDir, file), 'utf-8');
      if (content.length < 100) continue;

      const data = JSON.parse(content);
      const trRow = db.prepare('SELECT id FROM translators WHERE code = ?').get(code);
      if (!trRow) continue;
      const trId = trRow.id;

      // Format 1: {quran: [{chapter, verse, text}]}
      // Format 2: [{surahId, verseNumber, text}]  (Şinasi Güneş)
      let verses = null;
      if (data.quran && Array.isArray(data.quran)) {
        verses = data.quran.map(v => ({ chapter: v.chapter, verse: v.verse, text: v.text }));
      } else if (Array.isArray(data) && data[0] && data[0].surahId !== undefined) {
        verses = data.map(v => ({ chapter: v.surahId, verse: v.verseNumber, text: v.text }));
      }

      if (!verses) continue;

      let count = 0;
      const insertBatch = db.transaction((rows) => {
        for (const v of rows) {
          const vId = verseIdCache.get(`${v.chapter}:${v.verse}`);
          if (vId) { insertTrans.run(vId, trId, v.text); count++; }
        }
      });
      insertBatch(verses);
      console.log(' ', code + ':', count);
    } catch (e) {
      console.log(' ', code + ': HATA -', e.message);
    }
  }

  // ---- [4/4] Morfoloji ve Kelimeler ----
  console.log('\n[4/4] Morfoloji ve Kelimeler...');
  const morphPath = path.join(DATA_DIR, 'morphology', 'quran-morphology.txt');
  if (fs.existsSync(morphPath)) {
    const lines = fs.readFileSync(morphPath, 'utf-8').split('\n').filter(l => l.trim() && !l.startsWith('#'));

    // Kökleri topla
    const rootCounts = new Map();
    for (const line of lines) {
      const m = line.match(/ROOT:([^\s|]+)/);
      if (m) rootCounts.set(m[1], (rootCounts.get(m[1]) || 0) + 1);
    }

    // Kökleri ekle
    const insertRoot = db.prepare('INSERT OR REPLACE INTO roots (root, occurrence_count, meaning_tr) VALUES (?,?,?)');
    const insertRoots = db.transaction((entries) => {
      for (const [root, cnt] of entries) {
        insertRoot.run(root, cnt, rootMeanings[root] || null);
      }
    });
    insertRoots(rootCounts);
    console.log('  Kökler:', rootCounts.size);

    // Kök ID önbelleği
    const rootIds = new Map();
    for (const row of db.prepare('SELECT id, root FROM roots').all()) {
      rootIds.set(row.root, row.id);
    }

    // Kelimeleri topla (segment'leri birleştir)
    const wordMap = new Map();
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const locParts = parts[0].split(':');
      if (locParts.length < 4) continue;

      const [surahId, verseNumber, wordPosition] = locParts;
      const wordKey = `${surahId}:${verseNumber}:${wordPosition}`;
      const arabicWord = parts[1];
      const pos = parts[2];
      const features = parts[3] || '';

      let root = null, lemma = null;
      const rootMatch = features.match(/ROOT:([^|]+)/);
      if (rootMatch) root = rootMatch[1];
      const lemmaMatch = features.match(/LEM:([^|]+)/);
      if (lemmaMatch) lemma = lemmaMatch[1];

      if (!wordMap.has(wordKey)) {
        wordMap.set(wordKey, {
          surahId: parseInt(surahId),
          verseNumber: parseInt(verseNumber),
          wordPosition: parseInt(wordPosition),
          arabicWord,
          root,
          lemma,
          pos,
        });
      } else {
        const existing = wordMap.get(wordKey);
        existing.arabicWord += arabicWord;
        if (root && !existing.root) existing.root = root;
        const isMain = (p) => ['N', 'V', 'ADJ', 'PN', 'ADV'].includes(p);
        if (lemma && isMain(pos)) { existing.lemma = lemma; existing.pos = pos; }
      }
    }

    console.log('  Toplam benzersiz kelime:', wordMap.size);

    // Kelimeleri ekle
    const insertWord = db.prepare(
      'INSERT OR REPLACE INTO words (verse_id, word_position, arabic_word, root_id, lemma, part_of_speech, translation_tr) VALUES (?,?,?,?,?,?,?)'
    );
    let wordCount = 0;
    const insertWords = db.transaction((words) => {
      for (const word of words) {
        const vId = verseIdCache.get(`${word.surahId}:${word.verseNumber}`);
        if (!vId) continue;
        const rootId = word.root ? rootIds.get(word.root) : null;
        let translationTr = null;
        if (word.lemma && wordTranslations[word.lemma]) translationTr = wordTranslations[word.lemma];
        else if (word.arabicWord && wordTranslations[word.arabicWord]) translationTr = wordTranslations[word.arabicWord];
        insertWord.run(vId, word.wordPosition, word.arabicWord, rootId, word.lemma, word.pos, translationTr);
        wordCount++;
        if (wordCount % 10000 === 0) console.log(`    ${wordCount} kelime eklendi...`);
      }
    });
    insertWords([...wordMap.values()]);
    console.log('  Toplam kelime:', wordCount);
  } else {
    console.log('  Morfoloji dosyası bulunamadı!');
  }

  db.close();
  console.log('\n==================================================');
  console.log('  TAMAMLANDI!');
  console.log('==================================================');
}

importData();
