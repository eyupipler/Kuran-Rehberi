const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { q, translator, language, limit = 50, offset = 0 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Arama sorgusu en az 2 karakter olmali' });
    }

    let sql = `
      SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
        s.name as surahName, s.arabic_name as surahArabicName,
        t.code as translatorCode, t.name as translatorName, tr.text as translation
      FROM translations tr
      JOIN translators t ON t.id = tr.translator_id
      JOIN verses v ON v.id = tr.verse_id
      JOIN surahs s ON s.id = v.surah_id
      WHERE tr.text LIKE ?
    `;
    let params = ['%' + q + '%'];

    if (translator) {
      sql += ' AND t.code = ?';
      params.push(translator);
    }
    if (language) {
      sql += ' AND t.language = ?';
      params.push(language);
    }

    sql += ' ORDER BY v.surah_id, v.verse_number LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const results = db.prepare(sql).all(...params);

    let countSql = `
      SELECT COUNT(*) as total FROM translations tr
      JOIN translators t ON t.id = tr.translator_id
      WHERE tr.text LIKE ?
    `;
    let countParams = ['%' + q + '%'];
    if (translator) { countSql += ' AND t.code = ?'; countParams.push(translator); }
    if (language) { countSql += ' AND t.language = ?'; countParams.push(language); }

    const countResult = db.prepare(countSql).get(...countParams);

    res.json({ query: q, total: countResult ? countResult.total : 0, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/arabic', (req, res) => {
  try {
    const db = getDatabase();
    const { q, limit = 50, offset = 0 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Arama sorgusu en az 2 karakter olmali' });
    }

    const results = db.prepare(`
      SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
        s.name as surahName, s.arabic_name as surahArabicName
      FROM verses v JOIN surahs s ON s.id = v.surah_id
      WHERE v.arabic_text LIKE ?
      ORDER BY v.surah_id, v.verse_number LIMIT ? OFFSET ?
    `).all('%' + q + '%', parseInt(limit), parseInt(offset));

    const countResult = db.prepare('SELECT COUNT(*) as total FROM verses WHERE arabic_text LIKE ?').get('%' + q + '%');

    res.json({ query: q, total: countResult ? countResult.total : 0, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/translators', (req, res) => {
  try {
    const db = getDatabase();
    const { language } = req.query;

    let sql = 'SELECT code, name, language FROM translators';
    let params = [];

    if (language) {
      sql += ' WHERE language = ?';
      params.push(language);
    }
    sql += ' ORDER BY language, name';

    const translators = db.prepare(sql).all(...params);
    res.json(translators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
