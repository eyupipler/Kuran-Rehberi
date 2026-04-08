const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

// Türkçe okunuş → Arapça karakter dönüşümü (sesli harfler atılır, ünsüzler eşleştirilir)
const TR_TO_ARABIC = {
  'b': 'ب', 't': 'ت', 'c': 'ج', 'ç': 'ج', 'h': 'ح', 'd': 'د', 'r': 'ر',
  'z': 'ز', 's': 'س', 'ş': 'ش', 'f': 'ف', 'k': 'ك', 'l': 'ل', 'm': 'م',
  'n': 'ن', 'v': 'و', 'y': 'ي', 'ğ': 'غ', 'g': 'غ', 'p': 'ف', 'q': 'ق',
  'w': 'و', 'x': 'خ', "'": 'ع', '"': 'ع',
};
const TR_VOWELS = new Set(['a','e','ı','i','o','ö','u','ü']);

function latinToArabicSkeleton(query) {
  // Tireleri, noktaları ve diğer ayırıcıları sil
  const normalized = query.toLowerCase().normalize('NFC').replace(/[-._\s]+/g, '');
  const consonants = [];
  for (const ch of normalized) {
    if (TR_VOWELS.has(ch)) continue;
    if (TR_TO_ARABIC[ch]) consonants.push(TR_TO_ARABIC[ch]);
  }
  return consonants.join('');
}

function isArabicScript(str) {
  return /[\u0600-\u06FF]/.test(str);
}

// root_latin'de harf-harf eşleşme (ör: r-s-l → r,s,l içeren kökler)
function extractLatinConsonants(query) {
  return query.toLowerCase().replace(/[-.\s]/g, '').replace(/[aeiouıöü]/g, '');
}

// Root için anlam türet: word-level translation_tr'den en sık geçen anlamları birleştir
function deriveRootMeaning(db, rootId) {
  const rows = db.prepare(`
    SELECT translation_tr, COUNT(*) as cnt
    FROM words
    WHERE root_id = ? AND translation_tr IS NOT NULL AND translation_tr != ''
    GROUP BY translation_tr
    ORDER BY cnt DESC
    LIMIT 5
  `).all(rootId);

  if (!rows.length) return null;

  // Benzersiz anlamları al, virgülle birleştir
  const meanings = rows.map(r => r.translation_tr.trim()).filter(Boolean);
  // Tekrarları kaldır (büyük/küçük harf duyarsız)
  const seen = new Set();
  const unique = [];
  for (const m of meanings) {
    const key = m.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(m); }
  }
  return unique.slice(0, 4).join(', ');
}

function enrichRoots(db, roots) {
  return roots.map(r => {
    if (!r.meaningTr) {
      r.meaningTr = deriveRootMeaning(db, r.id) || null;
      r.meaningDerived = true;
    }
    return r;
  });
}

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { limit = 100, offset = 0, sort = 'count', letter } = req.query;

    const orderBy = sort === 'alpha' ? 'r.root ASC' : 'r.occurrence_count DESC';

    let whereClause = '';
    const params = [];

    if (letter) {
      whereClause = 'WHERE r.root LIKE ?';
      params.push(letter + '%');
    }

    const roots = db.prepare(`
      SELECT r.id, r.root, r.root_latin as rootLatin, r.meaning_tr as meaningTr,
        r.meaning_en as meaningEn, r.occurrence_count as occurrenceCount
      FROM roots r
      ${whereClause}
      ORDER BY ${orderBy} LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM roots r ${whereClause}`).get(...params);

    const enriched = enrichRoots(db, roots);

    res.json({ total: countResult ? countResult.total : 0, roots: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', (req, res) => {
  try {
    const db = getDatabase();
    const query = req.query.q || '';
    if (!query) return res.json({ query: '', results: [] });

    const seen = new Set();
    const results = [];

    function addRoot(r) {
      if (!seen.has(r.id)) { seen.add(r.id); results.push(r); }
    }

    // 1. Direkt Arapça / Latin / anlam araması
    const direct = db.prepare(`
      SELECT id, root, root_latin as rootLatin, meaning_tr as meaningTr,
        meaning_en as meaningEn, occurrence_count as occurrenceCount
      FROM roots
      WHERE root LIKE ? OR root_latin LIKE ? OR meaning_tr LIKE ? OR meaning_en LIKE ?
      ORDER BY occurrence_count DESC LIMIT 100
    `).all('%' + query + '%', '%' + query + '%', '%' + query + '%', '%' + query + '%');
    direct.forEach(addRoot);

    // 2. Latin harfse: Türkçe okunuş → Arapça iskelet araması
    if (!isArabicScript(query)) {
      const arabic = latinToArabicSkeleton(query);
      if (arabic.length >= 2) {
        const skeletal = db.prepare(`
          SELECT id, root, root_latin as rootLatin, meaning_tr as meaningTr,
            meaning_en as meaningEn, occurrence_count as occurrenceCount
          FROM roots WHERE root LIKE ?
          ORDER BY occurrence_count DESC LIMIT 50
        `).all('%' + arabic + '%');
        skeletal.forEach(addRoot);
      }
    }

    // 3. Word-level Türkçe çeviri araması
    const wordMatches = db.prepare(`
      SELECT DISTINCT w.root_id
      FROM words w
      WHERE w.translation_tr LIKE ?
      LIMIT 80
    `).all('%' + query + '%');

    for (const wm of wordMatches) {
      if (!seen.has(wm.root_id)) {
        const r = db.prepare(`
          SELECT id, root, root_latin as rootLatin, meaning_tr as meaningTr,
            meaning_en as meaningEn, occurrence_count as occurrenceCount
          FROM roots WHERE id = ?
        `).get(wm.root_id);
        if (r) addRoot(r);
      }
    }

    enrichRoots(db, results);
    results.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

    res.json({ query, results: results.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:root', (req, res) => {
  try {
    const db = getDatabase();
    const { root } = req.params;

    const rootInfo = db.prepare(`
      SELECT id, root, root_latin as rootLatin, meaning_tr as meaningTr,
        meaning_en as meaningEn, occurrence_count as occurrenceCount
      FROM roots WHERE root = ? OR root_latin = ?
    `).get(root, root);

    if (!rootInfo) return res.status(404).json({ error: 'Kök bulunamadı' });

    // Anlam türet (eksikse)
    if (!rootInfo.meaningTr) {
      rootInfo.meaningTr = deriveRootMeaning(db, rootInfo.id);
    }

    const occurrences = db.prepare(`
      SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
        s.name as surahName, s.arabic_name as surahArabicName,
        w.arabic_word as word, w.word_position as wordPosition, w.lemma,
        w.part_of_speech as partOfSpeech, w.translation_tr as translationTr
      FROM words w
      JOIN verses v ON v.id = w.verse_id
      JOIN surahs s ON s.id = v.surah_id
      WHERE w.root_id = ?
      ORDER BY v.surah_id, v.verse_number, w.word_position
    `).all(rootInfo.id);

    const requestedTranslator = req.query.translator || 'tr.diyanet';
    const translatorRow = db.prepare('SELECT id, name FROM translators WHERE code = ?').get(requestedTranslator);
    const translatorId = translatorRow ? translatorRow.id : null;

    if (translatorId) {
      for (const occ of occurrences) {
        const verseRow = db.prepare('SELECT id FROM verses WHERE surah_id = ? AND verse_number = ?').get(occ.surahId, occ.verseNumber);
        if (verseRow) {
          const trans = db.prepare('SELECT text FROM translations WHERE verse_id = ? AND translator_id = ?').get(verseRow.id, translatorId);
          occ.verseMealTr = trans ? trans.text : null;
          occ.translatorName = translatorRow.name;
        }
      }
    }

    const derivedForms = db.prepare(`
      SELECT arabic_word as word, lemma, part_of_speech as partOfSpeech, COUNT(*) as count
      FROM words WHERE root_id = ?
      GROUP BY arabic_word ORDER BY count DESC LIMIT 50
    `).all(rootInfo.id);

    const distribution = db.prepare(`
      SELECT s.id as surahId, s.name as surahName, COUNT(*) as count
      FROM words w
      JOIN verses v ON v.id = w.verse_id
      JOIN surahs s ON s.id = v.surah_id
      WHERE w.root_id = ?
      GROUP BY s.id ORDER BY count DESC
    `).all(rootInfo.id);

    res.json({ root: rootInfo, totalOccurrences: occurrences.length, occurrences, derivedForms, distribution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
