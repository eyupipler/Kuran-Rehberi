/**
 * Hakkı Yılmaz mealini parse edip tr.yilmaz.json formatına çevirir.
 * Çalıştır: node backend/src/db/parse-yilmaz.js
 */

const fs = require('fs');
const path = require('path');

const INPUT = 'C:/Users/ASUS/AppData/Local/Temp/hakki_yilmaz_utf8.txt';
const OUTPUT = path.join(__dirname, '..', '..', '..', 'data', 'translations', 'tr.yilmaz.json');

function expandVerseNumbers(numStr) {
  if (!numStr) return [];
  const nums = [];
  for (const part of numStr.split(',')) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [a, b] = trimmed.split('-').map(Number);
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b; i++) nums.push(i);
      }
    } else {
      const n = parseInt(trimmed);
      if (!isNaN(n)) nums.push(n);
    }
  }
  return nums;
}

/**
 * Satır içi yerleştirilmiş ayet numaralarını tespit edip metni böler.
 * Örnek: "17O zaman... 18Biz çok yakında..." → [{nums:[17], text:"O zaman..."}, {nums:[18], text:"Biz..."}]
 */
function splitInlineVerses(startNums, text) {
  const maxStart = Math.max(...startNums);
  // Pattern: space + 1-3 digits + capital letter or curly quote
  const inlineRe = /\s(\d{1,3})([\u201CA-ZÂÎÛÖÜÇŞĞİ])/g;
  const splits = [];
  let lastIdx = 0;
  let lastNums = startNums;
  let lastMax = maxStart;
  let m;

  while ((m = inlineRe.exec(text)) !== null) {
    const verseNum = parseInt(m[1]);
    // Must be the next verse (greater than current max, within reasonable range)
    if (verseNum > lastMax && verseNum <= lastMax + 20) {
      const segment = text.substring(lastIdx, m.index).trim();
      if (segment.length > 2) {
        splits.push({ nums: lastNums, text: segment });
      }
      lastNums = [verseNum];
      lastMax = verseNum;
      // Skip past the space: m.index+1 = start of digit, m.index+1+m[1].length = capital letter
      lastIdx = m.index + 1 + m[1].length;
      // Put the capital letter back into the remaining text
      text = text.substring(0, m.index + 1 + m[1].length) + text.substring(m.index + 1 + m[1].length);
      // Reposition: lastIdx points to the capital letter
      lastIdx = m.index + 1 + m[1].length;
      inlineRe.lastIndex = lastIdx;
    }
  }

  const remaining = text.substring(lastIdx).trim();
  if (remaining.length > 2) {
    splits.push({ nums: lastNums, text: remaining });
  }

  return splits.length > 0 ? splits : [{ nums: startNums, text: text.trim() }];
}

/**
 * Parse all (revOrder/surahId, SurahName/...) patterns from a citation line.
 * Returns array of {surahId, verseNums} — verseNums may be empty if we can't parse the range.
 */
function parseCitationSurahs(line) {
  const results = [];
  // Match each "N/surahId[, /]SurahName[/ ,]verseRange" segment, split by "+"
  // We extract all revOrder/surahId pairs first
  const pairRe = /(\d+)\/(\d+)/g;
  let m;
  while ((m = pairRe.exec(line)) !== null) {
    results.push({ surahId: parseInt(m[2]), verseNums: [] });
  }
  return results;
}

/**
 * Try to extract a verse-range string after a surah name in a citation.
 * e.g. "Inşikak/1-25" → "1-25"
 */
function extractVerseRange(segment) {
  // After last "/" or ","
  const slashIdx = segment.lastIndexOf('/');
  if (slashIdx !== -1) {
    return segment.substring(slashIdx + 1).replace(/[;\s)]/g, '');
  }
  // Format like "Kadr, 1-5"
  const commaIdx = segment.indexOf(',');
  if (commaIdx !== -1) {
    return segment.substring(commaIdx + 1).replace(/[;\s)]/g, '');
  }
  return '';
}

function parseYilmaz() {
  const raw = fs.readFileSync(INPUT, 'utf8');
  const text = raw.replace(/\u0002/g, ' ').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').map(l => l.trim());

  const translations = [];
  const seen = new Set(); // "surahId:verseNumber" → only first occurrence

  // Normalize surah names for matching: lowercase + strip Turkish/Arabic diacritics
  function normName(s) {
    return s.toLowerCase()
      .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
      .replace(/ê/g, 'e').replace(/ô/g, 'o')
      .replace(/\u00e2/g, 'a').replace(/\u00ee/g, 'i').replace(/\u00fb/g, 'u');
  }

  // --- Step 1: Build surahName → surahId map from all citation lines ---
  const nameToId = new Map();
  {
    // Match single-word names: "N/surahId, Name/" or "N/surahId, Name,"
    const seg1Re = /(\d+)\/(\d+)[,\/]\s*([A-ZÂÎÛÖÜÇŞĞİa-züğışçöâîû'\-]+)/g;
    for (const line of lines) {
      if (!line.startsWith('(')) continue;
      let m;
      while ((m = seg1Re.exec(line)) !== null) {
        const surahId = parseInt(m[2]);
        const key = normName(m[3]);
        if (!nameToId.has(key)) nameToId.set(key, surahId);
      }
    }
    // Also handle multi-word names like "Âl-i İmrân": extract text between "," and "/"
    const multiwordRe = /\((\d+)\/(\d+),\s*([^/()]+)\//g;
    for (const line of lines) {
      if (!line.startsWith('(')) continue;
      let m;
      while ((m = multiwordRe.exec(line)) !== null) {
        const surahId = parseInt(m[2]);
        const key = normName(m[3].trim());
        if (!nameToId.has(key)) nameToId.set(key, surahId);
      }
    }
  }

  // --- Step 2: Main parse ---

  // State
  let inNecm = false;
  let skipNecm = false;
  // Each entry: {surahId: null|number, nums: number[], text: string}
  // surahId=null means "use the surahId from the citation"
  // surahId=explicit means a surah-prefix line assigned this id
  let necmBuffer = [];
  // Track "current explicit surahId" inside a necm (set by surah-prefix lines)
  let currentExplicitSurahId = null;

  // Improved citation regex: match any line starting with (N/M, or (N/M/
  const citationRe = /^\((\d+)\/(\d+)[,\/]/;
  // Verse line: digit(s), then optionally more digits separated by - or ,, then text starting with letter or curly quote
  const verseRe = /^(\d+(?:[,\-]\d+)*)([\u201C\u201DA-ZÂÎÛÖÜÇŞĞİa-züğışçöâîû"'(].*)/;
  const necmRe = /^Necm:\s*(\d+)(\/\d+)?/;
  const surahHeaderRe = /SÛRESİ$/i;

  // Surah-prefix line: "SurahName N,M..." or "SurahName N-M..." at start of line
  // First word(s) are a surah name, followed by verse numbers
  const surahPrefixRe = /^([A-ZÂÎÛÖÜÇŞĞİ][a-züğışçöâîûA-Za-z'\-]*(?:\s+[A-ZÂÎÛÖÜÇŞĞİ][a-züğışçöâîûA-Za-z'\-]*)?)\s+(\d+(?:[,\-]\d+)*)([\u201C\u201D"'(A-ZÂÎÛÖÜÇŞĞİa-züğışçöâîû].*)/;

  function saveEntry(surahId, nums, text) {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length < 3) return;
    for (const vNum of nums) {
      const key = `${surahId}:${vNum}`;
      if (!seen.has(key)) {
        seen.add(key);
        translations.push({ surahId, verseNumber: vNum, text: cleanText });
      }
    }
  }

  function flushNecmBuffer(primarySurahId) {
    for (const entry of necmBuffer) {
      const sid = entry.surahId !== null ? entry.surahId : primarySurahId;
      if (sid && entry.nums.length > 0) {
        saveEntry(sid, entry.nums, entry.text);
      }
    }
    necmBuffer = [];
    currentExplicitSurahId = null;
  }

  function tryResolveSurahName(name) {
    const key = normName(name);
    if (nameToId.has(key)) return nameToId.get(key);
    // Try prefix match after normalization
    for (const [k, v] of nameToId) {
      if (k.startsWith(key) || key.startsWith(k)) return v;
    }
    return null;
  }

  for (const line of lines) {
    if (!line) continue;

    // Citation line: flush buffer and start fresh
    const citMatch = line.match(citationRe);
    if (citMatch) {
      const primarySurahId = parseInt(citMatch[2]);
      if (!skipNecm) {
        // Save snapshot of buffer before flushing (flushNecmBuffer clears it)
        const bufferSnapshot = necmBuffer.slice();
        flushNecmBuffer(primarySurahId);

        // Handle secondary surahs in combined citations (e.g. "+83/84, İnşikâk/1-25")
        // Save buffer entries under secondary surahIds too.
        const pairRe = /\+(\d+)\/(\d+)/g;
        let pm;
        while ((pm = pairRe.exec(line)) !== null) {
          const secSurahId = parseInt(pm[2]);
          // If surah-prefix lines already tagged entries with this surahId, they were
          // already saved correctly — skip to avoid saving wrong verses under this id.
          const alreadyTagged = bufferSnapshot.some(e => e.surahId === secSurahId);
          if (!alreadyTagged) {
            for (const entry of bufferSnapshot) {
              if (entry.surahId === null) {
                saveEntry(secSurahId, entry.nums, entry.text);
              }
            }
          }
        }
      }
      necmBuffer = [];
      inNecm = false;
      skipNecm = false;
      currentExplicitSurahId = null;
      continue;
    }

    // Surah header (e.g. "ÂL-İ İMRÂN SÛRESİ" or "MÜDDESIR ve FÂTİHA SÛRESİ")
    if (surahHeaderRe.test(line)) {
      necmBuffer = [];
      inNecm = false;
      currentExplicitSurahId = null;
      continue;
    }

    // Necm header
    const necmMatch = line.match(necmRe);
    if (necmMatch) {
      necmBuffer = [];
      skipNecm = !!necmMatch[2]; // Skip "Necm: 3/1" style variants
      inNecm = !skipNecm;
      currentExplicitSurahId = null;
      continue;
    }

    if (line.startsWith('Not:') || line.startsWith('NOT:')) continue;
    if (line.endsWith('DÖNEMİ')) continue;

    if (!inNecm) continue;

    // Check for surah-prefix line: "SurahName N-M Text..."
    const prefixMatch = line.match(surahPrefixRe);
    if (prefixMatch) {
      const prefixName = prefixMatch[1];
      const prefixNums = expandVerseNumbers(prefixMatch[2]);
      const prefixText = prefixMatch[3];
      const prefixSurahId = tryResolveSurahName(prefixName);
      if (prefixSurahId) {
        currentExplicitSurahId = prefixSurahId;
        necmBuffer.push({ surahId: prefixSurahId, nums: prefixNums, text: prefixText });
        continue;
      }
      // Fall through to normal verse matching if name not recognized
    }

    // Normal verse line
    const verseMatch = line.match(verseRe);
    if (verseMatch) {
      const nums = expandVerseNumbers(verseMatch[1]);
      const vText = verseMatch[2];
      const sid = currentExplicitSurahId;
      // Split inline verse numbers (e.g. "17O zaman... 18Biz...")
      const parts = splitInlineVerses(nums, vText);
      for (const part of parts) {
        necmBuffer.push({ surahId: sid, nums: part.nums, text: part.text });
      }
    } else if (necmBuffer.length > 0) {
      // Continuation line: append to last entry, then check for inline splits
      necmBuffer[necmBuffer.length - 1].text += ' ' + line;
      const last = necmBuffer[necmBuffer.length - 1];
      const parts = splitInlineVerses(last.nums, last.text);
      if (parts.length > 1) {
        necmBuffer.pop();
        for (const part of parts) {
          necmBuffer.push({ surahId: last.surahId, nums: part.nums, text: part.text });
        }
      }
    }
  }

  // Sort
  translations.sort((a, b) => a.surahId - b.surahId || a.verseNumber - b.verseNumber);

  // Stats
  const surahCounts = {};
  for (const t of translations) {
    surahCounts[t.surahId] = (surahCounts[t.surahId] || 0) + 1;
  }
  const surahNums = Object.keys(surahCounts).map(Number).sort((a, b) => a - b);
  console.log('Toplam çeviri:', translations.length);
  console.log('Sure sayısı:', surahNums.length);

  const missing = [];
  for (let i = 1; i <= 114; i++) {
    if (!surahCounts[i]) missing.push(i);
  }
  if (missing.length) {
    console.log('Eksik sureler (ID):', missing.join(', '));
  } else {
    console.log('Tüm 114 sure mevcut!');
  }

  // Sample checks
  const surah1 = translations.filter(t => t.surahId === 1);
  console.log(`\nSure 1 (Fatiha): ${surah1.length} ayet`);
  surah1.forEach(v => console.log(`  ${v.verseNumber}: ${v.text.slice(0, 60)}...`));

  const surah2sample = translations.filter(t => t.surahId === 2).slice(0, 3);
  console.log(`\nSure 2 ilk 3 ayet:`, surah2sample.map(v => `${v.verseNumber}: ${v.text.slice(0,50)}`));

  const surah93 = translations.filter(t => t.surahId === 93);
  console.log(`\nSure 93 (Duha): ${surah93.length} ayet`);
  const surah94 = translations.filter(t => t.surahId === 94);
  console.log(`Sure 94 (Inşirah): ${surah94.length} ayet`);
  const surah113 = translations.filter(t => t.surahId === 113);
  console.log(`Sure 113 (Felak): ${surah113.length} ayet`);
  const surah114 = translations.filter(t => t.surahId === 114);
  console.log(`Sure 114 (Nas): ${surah114.length} ayet`);

  fs.writeFileSync(OUTPUT, JSON.stringify(translations, null, 2), 'utf8');
  console.log('\nKaydedildi:', OUTPUT);
}

parseYilmaz();
