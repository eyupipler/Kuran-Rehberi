const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

const TRANSLATORS = {
  // Türkçe tercümanlar
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
  // İngilizce tercümanlar
  'en.yusufali': { name: 'Abdullah Yusuf Ali', language: 'en' },
  'en.arberry': { name: 'Arthur John Arberry', language: 'en' },
  'en.haleem': { name: 'Abdel Haleem', language: 'en' },
  'en.kamal': { name: 'Dr Kamal Omar', language: 'en' },
  'en.pickthall': { name: 'Mohammad Marmaduke Pickthall', language: 'en' },
  'en.sahih': { name: 'Sahih International', language: 'en' },
  // Arapça
  'ar.uthmani': { name: 'Arapça (Uthmani)', language: 'ar' },
};

async function importData() {
  console.log('==================================================');
  console.log('  KURAN REHBERI - Veri Import');
  console.log('==================================================');

  const SQL = await initSqlJs();
  if (!fs.existsSync(DB_PATH)) {
    console.error('DB bulunamadı! Önce: npm run init-db');
    return;
  }

  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Türkçe kelime çevirileri
  let wordTranslations = {};
  let rootMeanings = {};
  const wordTransPath = path.join(DATA_DIR, 'word-translations-tr.json');
  if (fs.existsSync(wordTransPath)) {
    const transData = JSON.parse(fs.readFileSync(wordTransPath, 'utf-8'));
    wordTranslations = transData.translations || {};
    rootMeanings = transData.rootMeanings || {};

    // Extended kök anlamlarını yükle ve birleştir
    const extendedPath = path.join(DATA_DIR, 'extended-roots.json');
    if (fs.existsSync(extendedPath)) {
      const extendedMeanings = JSON.parse(fs.readFileSync(extendedPath, 'utf-8'));
      // Mevcut anlamların üzerine yaz (veya birleştir)
      for (const [root, meanings] of Object.entries(extendedMeanings)) {
        rootMeanings[root] = meanings;
      }
      console.log('Genişletilmiş kök anlamları yüklendi:', Object.keys(extendedMeanings).length, 'adet');
    }

    console.log('Türkçe çeviriler yüklendi:', Object.keys(wordTranslations).length, 'kelime,', Object.keys(rootMeanings).length, 'kök');
  }

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

  // Tercümanlar
  console.log('\n[2/4] Tercümanlar...');
  for (const [code, info] of Object.entries(TRANSLATORS)) {
    db.run('INSERT OR REPLACE INTO translators (code, name, language) VALUES (?,?,?)',
      [code, info.name, info.language]);
  }
  console.log('  OK:', Object.keys(TRANSLATORS).length);

  // Çeviriler
  console.log('\n[3/4] Çeviriler...');
  const translationsDir = path.join(DATA_DIR, 'translations');

  // Önce Arapça (ayetler için)
  const arabicFile = path.join(translationsDir, 'ar.uthmani.json');
  if (fs.existsSync(arabicFile)) {
    const content = fs.readFileSync(arabicFile, 'utf-8');
    const data = JSON.parse(content);
    if (data.quran) {
      for (const v of data.quran) {
        db.run('INSERT OR REPLACE INTO verses (surah_id, verse_number, arabic_text) VALUES (?,?,?)',
          [v.chapter, v.verse, v.text]);
      }
      console.log('  Arapça:', data.quran.length, 'ayet');
    }
  }

  // Diğer çeviriler
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

  // Morfoloji ve Kelimeler
  console.log('\n[4/4] Morfoloji ve Kelimeler...');
  const morphPath = path.join(DATA_DIR, 'morphology', 'quran-morphology.txt');
  if (fs.existsSync(morphPath)) {
    const content = fs.readFileSync(morphPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));

    // Önce kökleri topla ve ekle
    const rootCounts = new Map();
    const rootIds = new Map();

    for (const line of lines) {
      const rootMatch = line.match(/ROOT:([^\s|]+)/);
      if (rootMatch) {
        const root = rootMatch[1];
        rootCounts.set(root, (rootCounts.get(root) || 0) + 1);
      }
    }

    // Kökleri ekle (Türkçe anlamlarıyla birlikte)
    for (const [root, cnt] of rootCounts) {
      const meaningTr = rootMeanings[root] || null;
      db.run('INSERT OR REPLACE INTO roots (id, root, occurrence_count, meaning_tr) VALUES ((SELECT id FROM roots WHERE root = ?), ?, ?, ?)', [root, root, cnt, meaningTr]);
    }
    console.log('  Kökler:', rootCounts.size);

    // Kök ID'lerini al
    const rootsResult = db.exec('SELECT id, root FROM roots');
    if (rootsResult.length && rootsResult[0].values.length) {
      for (const row of rootsResult[0].values) {
        rootIds.set(row[1], row[0]);
      }
    }

    // Verse ID cache
    const verseIds = new Map();
    const versesResult = db.exec('SELECT id, surah_id, verse_number FROM verses');
    if (versesResult.length && versesResult[0].values.length) {
      for (const row of versesResult[0].values) {
        verseIds.set(`${row[1]}:${row[2]}`, row[0]);
      }
    }

    // Kelimeleri ekle
    console.log('  Kelimeler ekleniyor...');
    let wordCount = 0;

    // Kelime bazinda biriktir (segment'leri birlestir)
    const wordMap = new Map(); // key: surah:verse:word -> { arabicWord, root, lemma, pos }

    // Morfoloji dosyasi formati: surah:ayet:kelime:segment  kelime  POS  features
    for (const line of lines) {
      // Format: 1:1:1:1	بِ	P	P|PREF|LEM:ب
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const location = parts[0]; // 1:1:1:1
      const arabicWord = parts[1];
      const pos = parts[2];
      const features = parts[3] || '';

      const locParts = location.split(':');
      if (locParts.length < 4) continue;

      const [surahId, verseNumber, wordPosition, segmentNum] = locParts;
      const wordKey = `${surahId}:${verseNumber}:${wordPosition}`;

      // Feature'lari parse et
      let root = null;
      let lemma = null;

      const rootMatch = features.match(/ROOT:([^|]+)/);
      if (rootMatch) root = rootMatch[1];

      const lemmaMatch = features.match(/LEM:([^|]+)/);
      if (lemmaMatch) lemma = lemmaMatch[1];

      // Ilk segment mi yoksa ekleme mi?
      if (!wordMap.has(wordKey)) {
        wordMap.set(wordKey, {
          surahId: parseInt(surahId),
          verseNumber: parseInt(verseNumber),
          wordPosition: parseInt(wordPosition),
          arabicWord: arabicWord,
          root: root,
          lemma: lemma,
          pos: pos,
          segments: [{ arabic: arabicWord, lemma: lemma, pos: pos, root: root }]
        });
      } else {
        const existing = wordMap.get(wordKey);
        existing.arabicWord += arabicWord; // Segment'leri birlestir
        existing.segments.push({ arabic: arabicWord, lemma: lemma, pos: pos, root: root });

        // Root varsa güncelle
        if (root && !existing.root) existing.root = root;

        // Ana kelimeyi bul: İsim (N), Fiil (V), veya root'u olan segment'i tercih et
        // Edat (P), Bağlaç gibi eklerin lemmasını kullanma
        const isMainPOS = (p) => ['N', 'V', 'ADJ', 'PN', 'ADV'].includes(p);
        const isPrefixPOS = (p) => ['P', 'CONJ', 'DET', 'PRON', 'EMPH', 'PREV', 'VOC', 'REM', 'IMPV', 'COND', 'NEG', 'CERT', 'FUT', 'EQ', 'RES', 'SUP', 'ANS', 'INC', 'AMD', 'CIRC', 'COM', 'EXP', 'EXH', 'EXL', 'INL', 'INT', 'AVR', 'RSLT', 'RETRACT', 'SUB', 'SUR', 'ACC', 'LOC', 'T', 'REL'].includes(p);

        // Mevcut lemma prefix ise ve yeni segment ana kelime ise, güncelle
        if (lemma && isMainPOS(pos)) {
          existing.lemma = lemma;
          existing.pos = pos;
        } else if (lemma && root && isPrefixPOS(existing.pos)) {
          // Önceki prefix, bu segment root'a sahip, güncelle
          existing.lemma = lemma;
          existing.pos = pos;
        }
      }
    }

    console.log('  Toplam benzersiz kelime:', wordMap.size);

    // Kelimeleri veritabanina ekle
    for (const [key, word] of wordMap) {
      const verseKey = `${word.surahId}:${word.verseNumber}`;
      const verseId = verseIds.get(verseKey);

      if (!verseId) continue;

      const rootId = word.root ? rootIds.get(word.root) : null;

      // Türkçe çeviri bul (lemma veya arabic_word ile)
      let translationTr = null;
      if (word.lemma && wordTranslations[word.lemma]) {
        translationTr = wordTranslations[word.lemma];
      } else if (word.arabicWord && wordTranslations[word.arabicWord]) {
        translationTr = wordTranslations[word.arabicWord];
      }

      db.run(`INSERT OR REPLACE INTO words (verse_id, word_position, arabic_word, root_id, lemma, part_of_speech, translation_tr)
              VALUES (?,?,?,?,?,?,?)`,
        [verseId, word.wordPosition, word.arabicWord, rootId, word.lemma, word.pos, translationTr]);

      wordCount++;

      if (wordCount % 10000 === 0) {
        console.log(`    ${wordCount} kelime eklendi...`);
      }
    }

    console.log('  Toplam kelime:', wordCount);
  } else {
    console.log('  Morfoloji dosyası bulunamadı!');
  }

  // Kaydet
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  db.close();
  console.log('\n==================================================');
  console.log('  TAMAMLANDI!');
  console.log('==================================================');
}

importData().catch(console.error);
