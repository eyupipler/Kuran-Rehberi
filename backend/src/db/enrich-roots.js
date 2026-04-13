/**
 * roots.meaning_tr alanını words.translation_tr değerlerinden zenginleştirir.
 * Çalıştır: node backend/src/db/enrich-roots.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'kuran.db');

// Fiil mastar eklerini ve gereksiz ekleri temizle
function cleanTerm(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim().replace(/\s+/g, ' ');
  if (t.length < 2 || /^\d/.test(t)) return null;
  // Sadece noktalama işareti olanları atla
  if (/^[^a-züğışçöâîûA-ZÜĞIŞÇÖÂÎÛ]+$/.test(t)) return null;
  return t;
}

// Türkçe fiil formunu normalize et — mastar formunu tercih et
function normalizeForm(term) {
  const lower = term.toLowerCase()
    .replace(/İ/g, 'i').replace(/I/g, 'ı');
  return lower;
}

// Benzeri zaten listede var mı? (ilk 4 harf karşılaştırması)
function isDuplicate(candidate, existing) {
  const cLower = normalizeForm(candidate);
  const c4 = cLower.slice(0, 4);
  for (const ex of existing) {
    const eLower = normalizeForm(ex);
    if (eLower === cLower) return true;
    // Çok kısa kelimeler için tam eşleşme gerekli
    if (cLower.length <= 3 && eLower === cLower) return true;
  }
  return false;
}

async function run() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  console.log('Kök anlamları zenginleştiriliyor...');

  // Tüm kökler için translation_tr değerlerini topla
  const rows = db.exec(`
    SELECT r.id, r.root, r.meaning_tr, r.meaning_en,
           GROUP_CONCAT(w.translation_tr, '|||') as raw_translations
    FROM roots r
    LEFT JOIN words w ON w.root_id = r.id
      AND w.translation_tr IS NOT NULL
      AND LENGTH(TRIM(w.translation_tr)) > 1
    GROUP BY r.id
  `)[0]?.values || [];

  console.log('İşlenecek kök sayısı:', rows.length);

  let updated = 0;
  let skipped = 0;

  db.run('BEGIN');

  for (const [id, root, meaningTr, meaningEn, rawTranslations] of rows) {
    if (!rawTranslations) { skipped++; continue; }

    // Tüm translation_tr değerlerini topla
    const allTerms = rawTranslations.split('|||')
      .map(cleanTerm)
      .filter(Boolean);

    if (allTerms.length === 0) { skipped++; continue; }

    // Frekans sayısı
    const freq = {};
    for (const t of allTerms) {
      const key = normalizeForm(t);
      freq[key] = (freq[key] || 0) + 1;
    }

    // Benzersiz normalize edilmiş formlar, frekansa göre sırala
    const uniqueForms = [...new Set(allTerms.map(t => {
      const lower = normalizeForm(t);
      return t; // orijinal formu koru ama lowercase ile karşılaştır
    }))];

    // Tekrar sayısına göre sırala
    uniqueForms.sort((a, b) => (freq[normalizeForm(b)] || 0) - (freq[normalizeForm(a)] || 0));

    // Önce mevcut anlamları al
    const existingMeanings = meaningTr
      ? meaningTr.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Yeni anlamları ekle (duplikat olmayanları)
    const newMeanings = [...existingMeanings];
    let added = 0;

    // Önce mastar (-mak/-mek) formlarını ekle
    for (const form of uniqueForms) {
      const lower = normalizeForm(form);
      if ((lower.endsWith('mak') || lower.endsWith('mek')) && !isDuplicate(form, newMeanings)) {
        newMeanings.push(form);
        added++;
        if (added >= 5) break;
      }
    }

    // Sonra diğer kısa/sık formları ekle
    for (const form of uniqueForms) {
      if (newMeanings.length >= 8) break;
      if (!isDuplicate(form, newMeanings)) {
        newMeanings.push(form);
        added++;
      }
    }

    if (newMeanings.length === existingMeanings.length && existingMeanings.length > 0) {
      skipped++;
      continue;
    }

    const finalMeaning = newMeanings.slice(0, 8).join(', ');

    // Güvenli escape
    const safeMeaning = finalMeaning.replace(/'/g, "''");
    db.run(`UPDATE roots SET meaning_tr = '${safeMeaning}' WHERE id = ${id}`);
    updated++;
  }

  db.run('COMMIT');

  // İstatistikler
  const after = db.exec('SELECT COUNT(*) FROM roots WHERE meaning_tr IS NOT NULL')[0].values[0][0];
  const before = rows.filter(r => r[2]).length;
  console.log(`\nGüncellendi: ${updated}, Atlandı: ${skipped}`);
  console.log(`Önceki meaning_tr: ${before}, Şimdiki: ${after}`);

  // Birkaç örnek
  console.log('\nÖrnek güncellemeler:');
  const samples = db.exec(`SELECT root, meaning_tr FROM roots WHERE meaning_tr IS NOT NULL ORDER BY occurrence_count DESC LIMIT 10`)[0]?.values || [];
  samples.forEach(([r, m]) => console.log(`  ${r}: ${m?.slice(0, 60)}`));

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('\nDB kaydedildi:', DB_PATH);
}

run().catch(err => { console.error('Hata:', err); process.exit(1); });
