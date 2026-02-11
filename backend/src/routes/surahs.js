const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const surahs = db.prepare(`
      SELECT id, name, arabic_name as arabicName, english_name as englishName,
        total_verses as totalVerses, revelation_type as revelationType,
        revelation_order as revelationOrder
      FROM surahs ORDER BY id
    `).all();
    res.json(surahs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const surah = db.prepare(`
      SELECT id, name, arabic_name as arabicName, english_name as englishName,
        total_verses as totalVerses, revelation_type as revelationType,
        revelation_order as revelationOrder
      FROM surahs WHERE id = ?
    `).get(parseInt(req.params.id));
    
    if (!surah) return res.status(404).json({ error: 'Sure bulunamadı' });
    res.json(surah);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/verses', (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { translator } = req.query;

    const surah = db.prepare('SELECT * FROM surahs WHERE id = ?').get(parseInt(id));
    if (!surah) return res.status(404).json({ error: 'Sure bulunamadı' });

    const verses = db.prepare(`
      SELECT id, verse_number as verseNumber, arabic_text as arabicText
      FROM verses WHERE surah_id = ? ORDER BY verse_number
    `).all(parseInt(id));

    if (translator) {
      const translatorInfo = db.prepare('SELECT id, name FROM translators WHERE code = ?').get(translator);
      if (translatorInfo) {
        for (const verse of verses) {
          const translation = db.prepare(
            'SELECT text FROM translations WHERE verse_id = ? AND translator_id = ?'
          ).get(verse.id, translatorInfo.id);
          verse.translation = translation ? translation.text : null;
          verse.translatorName = translatorInfo.name;
        }
      }
    }

    res.json({
      surah: { id: surah.id, name: surah.name, arabicName: surah.arabic_name, totalVerses: surah.total_verses },
      verses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
