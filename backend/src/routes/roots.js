const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const {
  HttpError,
  optionalInt,
  optionalString,
  parsePagination,
  requireSearchTerm,
} = require('../middleware/validate');

const LIKE_ESCAPE = "ESCAPE '\\'";
function likePattern(term) {
  return '%' + term.replace(/[\\%_]/g, '\\$&') + '%';
}

// Türkçe okunuş → Arapça ünsüz iskeleti (sesli harfler atılır)
const TR_TO_ARABIC = {
  b: 'ب', t: 'ت', c: 'ج', ç: 'ج', h: 'ح', d: 'د', r: 'ر',
  z: 'ز', s: 'س', ş: 'ش', f: 'ف', k: 'ك', l: 'ل', m: 'م',
  n: 'ن', v: 'و', y: 'ي', ğ: 'غ', g: 'غ', p: 'ف', q: 'ق',
  w: 'و', x: 'خ', "'": 'ع', '"': 'ع',
};
const TR_VOWELS = new Set(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü']);

function latinToArabicSkeleton(query) {
  const normalized = query.toLowerCase().normalize('NFC').replace(/[-._\s]+/g, '');
  const consonants = [];
  for (const char of normalized) {
    if (TR_VOWELS.has(char)) continue;
    if (TR_TO_ARABIC[char]) consonants.push(TR_TO_ARABIC[char]);
  }
  return consonants.join('');
}

function isArabicScript(value) {
  return /[؀-ۿ]/.test(value);
}

const ROOT_COLUMNS = `
  id, root, root_latin as rootLatin, meaning_tr as meaningTr,
  meaning_en as meaningEn, occurrence_count as occurrenceCount
`;

/**
 * meaning_tr boş olan kökler için kelime bazlı çevirilerden anlam türetir.
 * Tüm eksik kökler tek sorguda toplanır.
 */
function enrichRoots(db, roots) {
  const missing = roots.filter((r) => !r.meaningTr);
  if (!missing.length) return roots;

  const ids = missing.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');

  const rows = db
    .prepare(
      `SELECT root_id, translation_tr, COUNT(*) as cnt
       FROM words
       WHERE root_id IN (${placeholders})
         AND translation_tr IS NOT NULL AND translation_tr != ''
       GROUP BY root_id, translation_tr
       ORDER BY root_id, cnt DESC`
    )
    .all(...ids);

  const byRoot = new Map();
  for (const row of rows) {
    if (!byRoot.has(row.root_id)) byRoot.set(row.root_id, []);
    byRoot.get(row.root_id).push(row.translation_tr.trim());
  }

  for (const root of roots) {
    if (root.meaningTr) continue;
    const seen = new Set();
    const unique = [];
    for (const meaning of byRoot.get(root.id) || []) {
      const key = meaning.toLowerCase();
      if (!meaning || seen.has(key)) continue;
      seen.add(key);
      unique.push(meaning);
      if (unique.length >= 4) break;
    }
    root.meaningTr = unique.length ? unique.join(', ') : null;
    root.meaningDerived = true;
  }

  return roots;
}

router.get('/', (req, res) => {
  const db = getDatabase();
  const { limit, offset } = parsePagination(req.query, { defaultLimit: 100, maxLimit: 200 });
  const sort = req.query.sort === 'alpha' ? 'root ASC' : 'occurrence_count DESC';
  const letter = optionalString(req.query.letter, { max: 4 });

  const where = letter ? `WHERE root LIKE ? ${LIKE_ESCAPE}` : '';
  const params = letter ? [letter.replace(/[\\%_]/g, '\\$&') + '%'] : [];

  const roots = db
    .prepare(`SELECT ${ROOT_COLUMNS} FROM roots ${where} ORDER BY ${sort} LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM roots ${where}`).get(...params);

  res.json({ total: countRow ? countRow.total : 0, roots: enrichRoots(db, roots) });
});

router.get('/search', (req, res) => {
  const db = getDatabase();
  const term = requireSearchTerm(req.query.q, { min: 1, max: 60 });

  const seen = new Set();
  const results = [];
  const add = (root) => {
    if (root && !seen.has(root.id)) {
      seen.add(root.id);
      results.push(root);
    }
  };

  const pattern = likePattern(term);
  db.prepare(
    `SELECT ${ROOT_COLUMNS} FROM roots
     WHERE root LIKE ? ${LIKE_ESCAPE} OR root_latin LIKE ? ${LIKE_ESCAPE}
        OR meaning_tr LIKE ? ${LIKE_ESCAPE} OR meaning_en LIKE ? ${LIKE_ESCAPE}
     ORDER BY occurrence_count DESC LIMIT 100`
  )
    .all(pattern, pattern, pattern, pattern)
    .forEach(add);

  if (!isArabicScript(term)) {
    const skeleton = latinToArabicSkeleton(term);
    if (skeleton.length >= 2) {
      db.prepare(
        `SELECT ${ROOT_COLUMNS} FROM roots WHERE root LIKE ? ${LIKE_ESCAPE}
         ORDER BY occurrence_count DESC LIMIT 50`
      )
        .all(likePattern(skeleton))
        .forEach(add);
    }
  }

  // Kök sözlüğünde karşılığı olmayan ama kelime çevirisinde geçen anlamlar
  const wordMatchIds = db
    .prepare(
      `SELECT DISTINCT root_id FROM words
       WHERE translation_tr LIKE ? ${LIKE_ESCAPE} AND root_id IS NOT NULL LIMIT 80`
    )
    .all(pattern)
    .map((row) => row.root_id)
    .filter((id) => !seen.has(id));

  if (wordMatchIds.length) {
    const placeholders = wordMatchIds.map(() => '?').join(',');
    db.prepare(`SELECT ${ROOT_COLUMNS} FROM roots WHERE id IN (${placeholders})`)
      .all(...wordMatchIds)
      .forEach(add);
  }

  enrichRoots(db, results);
  results.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

  res.json({ query: term, results: results.slice(0, 100) });
});

router.get('/:root', (req, res) => {
  const db = getDatabase();
  const rootParam = optionalString(req.params.root, { max: 40 });
  if (!rootParam) throw new HttpError(400, 'Geçersiz kök');

  const rootInfo = db
    .prepare(`SELECT ${ROOT_COLUMNS} FROM roots WHERE root = ? OR root_latin = ?`)
    .get(rootParam, rootParam);

  if (!rootInfo) throw new HttpError(404, 'Kök bulunamadı');
  enrichRoots(db, [rootInfo]);

  const translatorCode = optionalString(req.query.translator, { max: 40 }) || 'tr.diyanet';
  const translator = db
    .prepare('SELECT id, name FROM translators WHERE code = ?')
    .get(translatorCode);

  const filters = [];
  const filterParams = [];

  const surah = optionalInt(req.query.surah, { min: 1, max: 114, fallback: null });
  if (surah) {
    filters.push('v.surah_id = ?');
    filterParams.push(surah);
  }

  const revelation = optionalString(req.query.revelation, { max: 10 });
  if (revelation === 'Mekki' || revelation === 'Medeni') {
    filters.push('s.revelation_type = ?');
    filterParams.push(revelation);
  }

  const partOfSpeech = optionalString(req.query.pos, { max: 12 });
  if (partOfSpeech) {
    filters.push('w.part_of_speech = ?');
    filterParams.push(partOfSpeech);
  }

  const form = optionalString(req.query.form, { max: 40 });
  if (form) {
    filters.push('w.arabic_word = ?');
    filterParams.push(form);
  }

  const filterSql = filters.length ? ' AND ' + filters.join(' AND ') : '';

  // Mealler ayrı sorgularla değil tek LEFT JOIN ile alınır.
  const occurrences = db
    .prepare(
      `SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
         s.name as surahName, s.arabic_name as surahArabicName, s.revelation_type as revelationType,
         w.arabic_word as word, w.word_position as wordPosition, w.lemma,
         w.part_of_speech as partOfSpeech, w.translation_tr as translationTr,
         ${translator ? 'tr.text as verseMealTr' : 'NULL as verseMealTr'}
       FROM words w
       JOIN verses v ON v.id = w.verse_id
       JOIN surahs s ON s.id = v.surah_id
       ${translator ? 'LEFT JOIN translations tr ON tr.verse_id = v.id AND tr.translator_id = ?' : ''}
       WHERE w.root_id = ?${filterSql}
       ORDER BY v.surah_id, v.verse_number, w.word_position`
    )
    .all(...(translator ? [translator.id] : []), rootInfo.id, ...filterParams);

  if (translator) {
    for (const occurrence of occurrences) occurrence.translatorName = translator.name;
  }

  const derivedForms = db
    .prepare(
      `SELECT arabic_word as word, lemma, part_of_speech as partOfSpeech, COUNT(*) as count
       FROM words WHERE root_id = ?
       GROUP BY arabic_word ORDER BY count DESC LIMIT 50`
    )
    .all(rootInfo.id);

  const distribution = db
    .prepare(
      `SELECT s.id as surahId, s.name as surahName, s.revelation_type as revelationType, COUNT(*) as count
       FROM words w
       JOIN verses v ON v.id = w.verse_id
       JOIN surahs s ON s.id = v.surah_id
       WHERE w.root_id = ?
       GROUP BY s.id ORDER BY count DESC`
    )
    .all(rootInfo.id);

  const partsOfSpeech = db
    .prepare(
      `SELECT part_of_speech as value, COUNT(*) as count
       FROM words WHERE root_id = ? AND part_of_speech IS NOT NULL AND part_of_speech != ''
       GROUP BY part_of_speech ORDER BY count DESC`
    )
    .all(rootInfo.id);

  res.json({
    root: rootInfo,
    totalOccurrences: occurrences.length,
    occurrences,
    derivedForms,
    distribution,
    partsOfSpeech,
  });
});

module.exports = router;
