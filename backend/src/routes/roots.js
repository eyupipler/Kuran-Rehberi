const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { limit = 100, offset = 0, sort = 'count' } = req.query;

    const orderBy = sort === 'alpha' ? 'root ASC' : 'occurrence_count DESC';

    const roots = db.prepare(`
      SELECT id, root, root_latin as rootLatin, meaning_tr as meaningTr,
        meaning_en as meaningEn, occurrence_count as occurrenceCount
      FROM roots ORDER BY ${orderBy} LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    const countResult = db.prepare('SELECT COUNT(*) as total FROM roots').get();

    res.json({ total: countResult ? countResult.total : 0, roots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search/:query', (req, res) => {
  try {
    const db = getDatabase();
    const { query } = req.params;

    const roots = db.prepare(`
      SELECT id, root, root_latin as rootLatin, meaning_tr as meaningTr,
        meaning_en as meaningEn, occurrence_count as occurrenceCount
      FROM roots
      WHERE root LIKE ? OR root_latin LIKE ? OR meaning_tr LIKE ? OR meaning_en LIKE ?
      ORDER BY occurrence_count DESC LIMIT 50
    `).all('%' + query + '%', '%' + query + '%', '%' + query + '%', '%' + query + '%');

    res.json({ query, results: roots });
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

    if (!rootInfo) return res.status(404).json({ error: 'Kok bulunamadi' });

    const occurrences = db.prepare(`
      SELECT v.surah_id as surahId, v.verse_number as verseNumber, v.arabic_text as arabicText,
        s.name as surahName, s.arabic_name as surahArabicName,
        w.arabic_word as word, w.word_position as wordPosition, w.lemma, w.part_of_speech as partOfSpeech
      FROM words w
      JOIN verses v ON v.id = w.verse_id
      JOIN surahs s ON s.id = v.surah_id
      WHERE w.root_id = ?
      ORDER BY v.surah_id, v.verse_number, w.word_position
    `).all(rootInfo.id);

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
