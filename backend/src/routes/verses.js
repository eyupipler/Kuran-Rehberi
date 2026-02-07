const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

router.get('/:surahId/:verseNumber', (req, res) => {
  try {
    const db = getDatabase();
    const { surahId, verseNumber } = req.params;

    const verse = db.prepare(`
      SELECT v.id, v.surah_id as surahId, v.verse_number as verseNumber,
        v.arabic_text as arabicText, s.name as surahName, s.arabic_name as surahArabicName
      FROM verses v JOIN surahs s ON s.id = v.surah_id
      WHERE v.surah_id = ? AND v.verse_number = ?
    `).get(parseInt(surahId), parseInt(verseNumber));

    if (!verse) return res.status(404).json({ error: 'Ayet bulunamadi' });

    const translations = db.prepare(`
      SELECT t.code as translatorCode, t.name as translatorName, t.language, tr.text
      FROM translations tr
      JOIN translators t ON t.id = tr.translator_id
      WHERE tr.verse_id = ?
      ORDER BY t.language, t.name
    `).all(verse.id);

    const words = db.prepare(`
      SELECT w.word_position as position, w.arabic_word as arabicWord, w.lemma,
        w.part_of_speech as partOfSpeech, r.root, r.occurrence_count as rootOccurrenceCount
      FROM words w LEFT JOIN roots r ON r.id = w.root_id
      WHERE w.verse_id = ? ORDER BY w.word_position
    `).all(verse.id);

    res.json({ verse, translations, words });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
