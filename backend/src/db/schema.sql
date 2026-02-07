-- Kuran Rehberi Veritabani Semasi
-- SQLite3 icin optimize edilmistir

-- Sureler tablosu
CREATE TABLE IF NOT EXISTS surahs (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    arabic_name TEXT NOT NULL,
    english_name TEXT,
    total_verses INTEGER NOT NULL,
    revelation_type TEXT CHECK(revelation_type IN ('Mekki', 'Medeni')),
    revelation_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ayetler tablosu (Arapca orijinal metin)
CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    arabic_text TEXT NOT NULL,
    arabic_text_simple TEXT,  -- Harekesiz versiyon
    juz INTEGER,
    hizb INTEGER,
    page INTEGER,
    FOREIGN KEY (surah_id) REFERENCES surahs(id),
    UNIQUE(surah_id, verse_number)
);

-- Tercumanlar/Cevirmenler tablosu
CREATE TABLE IF NOT EXISTS translators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,  -- ornek: 'tr.diyanet'
    name TEXT NOT NULL,
    language TEXT NOT NULL,     -- 'tr', 'en', 'ar', etc.
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ceviriler tablosu
CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id INTEGER NOT NULL,
    translator_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (verse_id) REFERENCES verses(id),
    FOREIGN KEY (translator_id) REFERENCES translators(id),
    UNIQUE(verse_id, translator_id)
);

-- Kelime kokleri tablosu
CREATE TABLE IF NOT EXISTS roots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root TEXT UNIQUE NOT NULL,       -- Arapca kok (ornek: ك ت ب)
    root_latin TEXT,                  -- Latin karakterlerle (ornek: k-t-b)
    meaning_tr TEXT,                  -- Turkce anlami
    meaning_en TEXT,                  -- Ingilizce anlami
    occurrence_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kelimeler tablosu (Morfoloji)
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id INTEGER NOT NULL,
    word_position INTEGER NOT NULL,   -- Ayet icindeki sira
    arabic_word TEXT NOT NULL,
    root_id INTEGER,
    lemma TEXT,                       -- Sozluk formu
    part_of_speech TEXT,              -- Isim, Fiil, Harf, etc.
    morphology TEXT,                  -- Detayli morfoloji bilgisi
    translation_tr TEXT,
    translation_en TEXT,
    FOREIGN KEY (verse_id) REFERENCES verses(id),
    FOREIGN KEY (root_id) REFERENCES roots(id)
);

-- Indeksler (Performans icin)
CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_id);
CREATE INDEX IF NOT EXISTS idx_translations_verse ON translations(verse_id);
CREATE INDEX IF NOT EXISTS idx_translations_translator ON translations(translator_id);
CREATE INDEX IF NOT EXISTS idx_words_verse ON words(verse_id);
CREATE INDEX IF NOT EXISTS idx_words_root ON words(root_id);
CREATE INDEX IF NOT EXISTS idx_roots_root ON roots(root);

-- Full-text search icin FTS5 tablosu
CREATE VIRTUAL TABLE IF NOT EXISTS translations_fts USING fts5(
    text,
    content='translations',
    content_rowid='id'
);

-- FTS tablosunu guncellemek icin triggerlar
CREATE TRIGGER IF NOT EXISTS translations_ai AFTER INSERT ON translations BEGIN
    INSERT INTO translations_fts(rowid, text) VALUES (new.id, new.text);
END;

CREATE TRIGGER IF NOT EXISTS translations_ad AFTER DELETE ON translations BEGIN
    INSERT INTO translations_fts(translations_fts, rowid, text) VALUES('delete', old.id, old.text);
END;

CREATE TRIGGER IF NOT EXISTS translations_au AFTER UPDATE ON translations BEGIN
    INSERT INTO translations_fts(translations_fts, rowid, text) VALUES('delete', old.id, old.text);
    INSERT INTO translations_fts(rowid, text) VALUES (new.id, new.text);
END;
