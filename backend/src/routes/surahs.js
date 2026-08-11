const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { HttpError, requireInt, optionalString } = require('../middleware/validate');

const SURAH_COLUMNS = `
  id, name, arabic_name as arabicName, english_name as englishName,
  total_verses as totalVerses, revelation_type as revelationType,
  revelation_order as revelationOrder
`;

function surahId(value) {
  return requireInt(value, { min: 1, max: 114, field: 'sure numarası' });
}

router.get('/', (req, res) => {
  const db = getDatabase();
  res.json(db.prepare(`SELECT ${SURAH_COLUMNS} FROM surahs ORDER BY id`).all());
});

router.get('/:id', (req, res) => {
  const db = getDatabase();
  const surah = db.prepare(`SELECT ${SURAH_COLUMNS} FROM surahs WHERE id = ?`).get(surahId(req.params.id));
  if (!surah) throw new HttpError(404, 'Sure bulunamadı');
  res.json(surah);
});

router.get('/:id/verses', (req, res) => {
  const db = getDatabase();
  const id = surahId(req.params.id);
  const translatorCode = optionalString(req.query.translator, { max: 40 });

  const surah = db.prepare(`SELECT ${SURAH_COLUMNS} FROM surahs WHERE id = ?`).get(id);
  if (!surah) throw new HttpError(404, 'Sure bulunamadı');

  const verses = db
    .prepare(
      `SELECT id, verse_number as verseNumber, arabic_text as arabicText
       FROM verses WHERE surah_id = ? ORDER BY verse_number`
    )
    .all(id);

  if (translatorCode) {
    const translator = db
      .prepare('SELECT id, name FROM translators WHERE code = ?')
      .get(translatorCode);

    if (translator) {
      // Ayet başına ayrı sorgu yerine tek seferde tüm mealleri çek.
      const rows = db
        .prepare(
          `SELECT tr.verse_id as verseId, tr.text
           FROM translations tr
           JOIN verses v ON v.id = tr.verse_id
           WHERE v.surah_id = ? AND tr.translator_id = ?`
        )
        .all(id, translator.id);

      const textByVerseId = new Map(rows.map((row) => [row.verseId, row.text]));
      for (const verse of verses) {
        verse.translation = textByVerseId.get(verse.id) ?? null;
        verse.translatorName = translator.name;
      }
    }
  }

  res.json({ surah, verses });
});

module.exports = router;
