-- Full-text search tablosu.
-- FTS5 derlemede yoksa (ör. sql.js WASM) bu dosya atlanır; arama LIKE ile calisir.
CREATE VIRTUAL TABLE IF NOT EXISTS translations_fts USING fts5(
    text,
    content='translations',
    content_rowid='id'
);

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
