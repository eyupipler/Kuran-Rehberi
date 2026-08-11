const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../db/database');
const { HttpError, requireInt } = require('../middleware/validate');

let relatedVersesData = null;
function getRelatedVerses() {
  if (!relatedVersesData) {
    const file = path.join(__dirname, '..', '..', '..', 'data', 'related-verses.json');
    try {
      relatedVersesData = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      relatedVersesData = {};
    }
  }
  return relatedVersesData;
}

router.get('/:surahId/:verseNumber', (req, res) => {
  const db = getDatabase();
  const surahId = requireInt(req.params.surahId, { min: 1, max: 114, field: 'sure numarası' });
  const verseNumber = requireInt(req.params.verseNumber, { min: 1, max: 286, field: 'ayet numarası' });

  const verse = db
    .prepare(
      `SELECT v.id, v.surah_id as surahId, v.verse_number as verseNumber,
         v.arabic_text as arabicText, s.name as surahName, s.arabic_name as surahArabicName
       FROM verses v JOIN surahs s ON s.id = v.surah_id
       WHERE v.surah_id = ? AND v.verse_number = ?`
    )
    .get(surahId, verseNumber);

  if (!verse) throw new HttpError(404, 'Ayet bulunamadı');

  const translations = db
    .prepare(
      `SELECT t.code as translatorCode, t.name as translatorName, t.language, tr.text
       FROM translations tr
       JOIN translators t ON t.id = tr.translator_id
       WHERE tr.verse_id = ?
       ORDER BY t.language, t.name`
    )
    .all(verse.id);

  const words = db
    .prepare(
      `SELECT w.word_position as position, w.arabic_word as arabicWord, w.lemma,
         w.part_of_speech as partOfSpeech, w.translation_tr as translationTr,
         r.root, r.occurrence_count as rootOccurrenceCount, r.meaning_tr as rootMeaningTr
       FROM words w LEFT JOIN roots r ON r.id = w.root_id
       WHERE w.verse_id = ? ORDER BY w.word_position`
    )
    .all(verse.id);

  const relatedMap = getRelatedVerses();
  const currentKey = `${surahId}:${verseNumber}`;
  const relatedKeys = relatedMap[currentKey] || [];

  const relatedVerses = relatedKeys
    .map((key) => {
      const [relatedSurah, relatedVerse] = String(key).split(':').map(Number);
      if (!Number.isInteger(relatedSurah) || !Number.isInteger(relatedVerse)) return null;

      const row = db
        .prepare(
          `SELECT v.surah_id as surahId, v.verse_number as verseNumber,
             v.arabic_text as arabicText, s.name as surahName,
             s.revelation_type as revelationType
           FROM verses v JOIN surahs s ON s.id = v.surah_id
           WHERE v.surah_id = ? AND v.verse_number = ?`
        )
        .get(relatedSurah, relatedVerse);
      if (!row) return null;

      // Karşılıklı bağlantı: hedef ayet de bu ayete işaret ediyor mu?
      row.mutual = (relatedMap[String(key)] || []).includes(currentKey);
      row.relatedCount = (relatedMap[String(key)] || []).length;
      return row;
    })
    .filter(Boolean);

  res.json({ verse, translations, words, relatedVerses });
});

module.exports = router;
