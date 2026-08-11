const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const {
  optionalInt,
  optionalString,
  parsePagination,
  requireSearchTerm,
} = require('../middleware/validate');

// LIKE joker karakterleri kullanıcı girdisinden gelmemeli.
const LIKE_ESCAPE = "ESCAPE '\\'";
function likePattern(term) {
  return '%' + term.replace(/[\\%_]/g, '\\$&') + '%';
}

function verseFilters(query) {
  const clauses = [];
  const params = [];

  const surah = optionalInt(query.surah, { min: 1, max: 114, fallback: null });
  if (surah) {
    clauses.push('v.surah_id = ?');
    params.push(surah);
  }

  const revelation = optionalString(query.revelation, { max: 10 });
  if (revelation === 'Mekki' || revelation === 'Medeni') {
    clauses.push('s.revelation_type = ?');
    params.push(revelation);
  }

  return { sql: clauses.length ? ' AND ' + clauses.join(' AND ') : '', params };
}

router.get('/', (req, res) => {
  const db = getDatabase();
  const term = requireSearchTerm(req.query.q);
  const { limit, offset } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 100 });
  const translator = optionalString(req.query.translator, { max: 40 });
  const language = optionalString(req.query.language, { max: 10 });
  const filters = verseFilters(req.query);

  const conditions = [];
  const params = [likePattern(term)];

  if (translator) {
    conditions.push('t.code = ?');
    params.push(translator);
  }
  if (language && language !== 'all') {
    conditions.push('t.language = ?');
    params.push(language);
  }

  const where =
    `WHERE tr.text LIKE ? ${LIKE_ESCAPE}` +
    (conditions.length ? ' AND ' + conditions.join(' AND ') : '') +
    filters.sql;
  const allParams = [...params, ...filters.params];

  const results = db
    .prepare(
      `SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
         s.name as surahName, s.arabic_name as surahArabicName, s.revelation_type as revelationType,
         t.code as translatorCode, t.name as translatorName, tr.text as translation
       FROM translations tr
       JOIN translators t ON t.id = tr.translator_id
       JOIN verses v ON v.id = tr.verse_id
       JOIN surahs s ON s.id = v.surah_id
       ${where}
       ORDER BY v.surah_id, v.verse_number LIMIT ? OFFSET ?`
    )
    .all(...allParams, limit, offset);

  const countRow = db
    .prepare(
      `SELECT COUNT(*) as total
       FROM translations tr
       JOIN translators t ON t.id = tr.translator_id
       JOIN verses v ON v.id = tr.verse_id
       JOIN surahs s ON s.id = v.surah_id
       ${where}`
    )
    .get(...allParams);

  res.json({ query: term, total: countRow ? countRow.total : 0, results });
});

router.get('/arabic', (req, res) => {
  const db = getDatabase();
  const term = requireSearchTerm(req.query.q);
  const { limit, offset } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 100 });
  const filters = verseFilters(req.query);

  const where = `WHERE v.arabic_text LIKE ? ${LIKE_ESCAPE}${filters.sql}`;
  const params = [likePattern(term), ...filters.params];

  const results = db
    .prepare(
      `SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
         s.name as surahName, s.arabic_name as surahArabicName, s.revelation_type as revelationType
       FROM verses v JOIN surahs s ON s.id = v.surah_id
       ${where}
       ORDER BY v.surah_id, v.verse_number LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  const countRow = db
    .prepare(
      `SELECT COUNT(*) as total FROM verses v JOIN surahs s ON s.id = v.surah_id ${where}`
    )
    .get(...params);

  res.json({ query: term, total: countRow ? countRow.total : 0, results });
});

router.get('/translators', (req, res) => {
  const db = getDatabase();
  const language = optionalString(req.query.language, { max: 10 });

  const rows = language
    ? db
        .prepare('SELECT code, name, language FROM translators WHERE language = ? ORDER BY name')
        .all(language)
    : db.prepare('SELECT code, name, language FROM translators ORDER BY language, name').all();

  res.json(rows);
});

module.exports = router;
