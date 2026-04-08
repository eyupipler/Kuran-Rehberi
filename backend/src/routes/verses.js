const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const fs = require('fs');
const path = require('path');

// İlgili ayetler (statik JSON, bir kez yükle)
let relatedVersesData = null;
function getRelatedVerses() {
  if (!relatedVersesData) {
    const p = path.join(__dirname, '..', '..', '..', 'data', 'related-verses.json');
    try { relatedVersesData = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { relatedVersesData = {}; }
  }
  return relatedVersesData;
}

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

    if (!verse) return res.status(404).json({ error: 'Ayet bulunamadı' });

    const translations = db.prepare(`
      SELECT t.code as translatorCode, t.name as translatorName, t.language, tr.text
      FROM translations tr
      JOIN translators t ON t.id = tr.translator_id
      WHERE tr.verse_id = ?
      ORDER BY t.language, t.name
    `).all(verse.id);

    const words = db.prepare(`
      SELECT w.word_position as position, w.arabic_word as arabicWord, w.lemma,
        w.part_of_speech as partOfSpeech, w.translation_tr as translationTr,
        r.root, r.occurrence_count as rootOccurrenceCount, r.meaning_tr as rootMeaningTr
      FROM words w LEFT JOIN roots r ON r.id = w.root_id
      WHERE w.verse_id = ? ORDER BY w.word_position
    `).all(verse.id);

    // İlgili ayetler (anlam bütünlüğü)
    const key = `${surahId}:${verseNumber}`;
    const relatedKeys = getRelatedVerses()[key] || [];
    const relatedVerses = relatedKeys.map((k) => {
      const [sId, vNum] = k.split(':').map(Number);
      const rv = db.prepare(`
        SELECT v.surah_id as surahId, v.verse_number as verseNumber,
          v.arabic_text as arabicText, s.name as surahName
        FROM verses v JOIN surahs s ON s.id = v.surah_id
        WHERE v.surah_id = ? AND v.verse_number = ?
      `).get(sId, vNum);
      return rv || null;
    }).filter(Boolean);

    res.json({ verse, translations, words, relatedVerses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
