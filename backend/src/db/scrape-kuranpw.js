/**
 * kuran.pw Scraper - Tüm tercümanların çevirilerini indir
 * Kullanım: node backend/src/db/scrape-kuranpw.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data', 'translations');

// kuran.pw'deki sure slug'ları
const SURAH_SLUGS = [
  '1-fatiha-suresi', '2-bakara-suresi', '3-ali+imran-suresi', '4-nisa-suresi',
  '5-maide-suresi', '6-enam-suresi', '7-araf-suresi', '8-enfal-suresi',
  '9-tevbe-suresi', '10-yunus-suresi', '11-hud-suresi', '12-yusuf-suresi',
  '13-rad-suresi', '14-ibrahim-suresi', '15-hicr-suresi', '16-nahl-suresi',
  '17-isra-suresi', '18-kehf-suresi', '19-meryem-suresi', '20-taha-suresi',
  '21-enbiya-suresi', '22-hac-suresi', '23-muminun-suresi', '24-nur-suresi',
  '25-furkan-suresi', '26-suara-suresi', '27-neml-suresi', '28-kasas-suresi',
  '29-ankebut-suresi', '30-rum-suresi', '31-lokman-suresi', '32-secde-suresi',
  '33-ahzab-suresi', '34-sebe-suresi', '35-fatir-suresi', '36-yasin-suresi',
  '37-saffat-suresi', '38-sad-suresi', '39-zumer-suresi', '40-mumin-suresi',
  '41-fussilet-suresi', '42-sura-suresi', '43-zuhruf-suresi', '44-duhan-suresi',
  '45-casiye-suresi', '46-ahkaf-suresi', '47-muhammed-suresi', '48-fetih-suresi',
  '49-hucurat-suresi', '50-kaf-suresi', '51-zariyat-suresi', '52-tur-suresi',
  '53-necm-suresi', '54-kamer-suresi', '55-rahman-suresi', '56-vakia-suresi',
  '57-hadid-suresi', '58-mucadele-suresi', '59-hasr-suresi', '60-mumtehine-suresi',
  '61-saf-suresi', '62-cuma-suresi', '63-munafikun-suresi', '64-tegabun-suresi',
  '65-talak-suresi', '66-tahrim-suresi', '67-mulk-suresi', '68-kalem-suresi',
  '69-hakka-suresi', '70-mearic-suresi', '71-nuh-suresi', '72-cin-suresi',
  '73-muzzemmil-suresi', '74-muddesir-suresi', '75-kiyamet-suresi', '76-insan-suresi',
  '77-murselat-suresi', '78-nebe-suresi', '79-naziat-suresi', '80-abese-suresi',
  '81-tekvir-suresi', '82-infitar-suresi', '83-mutaffifin-suresi', '84-insikak-suresi',
  '85-buruc-suresi', '86-tarik-suresi', '87-ala-suresi', '88-gasiye-suresi',
  '89-fecr-suresi', '90-beled-suresi', '91-sems-suresi', '92-leyl-suresi',
  '93-duha-suresi', '94-insirah-suresi', '95-tin-suresi', '96-alak-suresi',
  '97-kadir-suresi', '98-beyyine-suresi', '99-zilzal-suresi', '100-adiyat-suresi',
  '101-karia-suresi', '102-tekasur-suresi', '103-asr-suresi', '104-humeze-suresi',
  '105-fil-suresi', '106-kureys-suresi', '107-maun-suresi', '108-kevser-suresi',
  '109-kafirun-suresi', '110-nasr-suresi', '111-tebbet-suresi', '112-ihlas-suresi',
  '113-felak-suresi', '114-nas-suresi'
];

// kuran.pw tercüman slug -> bizim kod mapping
// Sadece mevcut olmayan tercümanları scrape edeceğiz
const TRANSLATORS_TO_SCRAPE = {
  'abdullah-parliyan':     'tr.parliyan',
  'adem-ugur':             'tr.ugur',
  'ahmed-hulusi':          'tr.hulusi',
  'ahmet-varol':           'tr.varol',
  'ali-fikri-yavuz':       'tr.yavuz',
  'bayraktar-bayrakli':    'tr.bayrakli',
  'bekir-sadak':           'tr.sadak',
  'celal-yildirim':        'tr.yildirim_celal',
  'cemal-kueluenkoglu':    'tr.kulunkoglu',
  'edip-yueksel':          'tr.edip',
  'fizil-al-il-kuran':     'tr.fizilal',
  'gueltekin-onan':        'tr.onan',
  'harun-yildirim':        'tr.yildirim_harun',
  'hasan-basri-cantay':    'tr.cantay',
  'hayrat-nesriyat':       'tr.hayrat',
  'ibn-i-kesir':           'tr.kesir',
  'ilyas-yorulmaz':        'tr.yorulmaz',
  'iskender-ali-mihr':     'tr.mihr',
  'kadri-celik':           'tr.celik',
  'muhammed-esed':         'tr.esed',
  'mustafa-islamoglu':     'tr.islamoglu',
  'oemer-nasuhi-bilmen':   'tr.bilmen',
  'oemer-oenguet':         'tr.ongut',
  'saban-piris':           'tr.piris',
  'sadik-tuerkmen':        'tr.turkmen',
  'seyyid-kutub':          'tr.kutub',
  'suat-yildirim':         'tr.yildirim_suat',
  'tefhim-ul-kuran':       'tr.tefhim',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/`/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function parseVerses(html) {
  const verses = [];
  // <tr class="translation" data-verse="N"> ... <a class="text-default">N. text</a>
  // data-verse global sıra veriyor, <a> içindeki numara sure-içi ayet numarası
  const regex = /data-verse="\d+"[\s\S]*?class="text-default">(\d+)\.\s*([\s\S]*?)<\/a>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const verseNum = parseInt(match[1]);
    let text = match[2].trim();
    // HTML tag'lerini temizle
    text = text.replace(/<[^>]+>/g, '');
    text = decodeHtmlEntities(text);
    if (text) {
      verses.push({ verseNumber: verseNum, text });
    }
  }
  return verses;
}

async function scrapeSurah(surahSlug, translatorSlug) {
  const url = `https://kuran.pw/${surahSlug}/${translatorSlug}`;
  const surahNum = parseInt(surahSlug.split('-')[0]);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  HATA: ${url} -> ${response.status}`);
      return [];
    }
    const html = await response.text();
    const verses = parseVerses(html);
    return verses.map(v => ({
      chapter: surahNum,
      verse: v.verseNumber,
      text: v.text
    }));
  } catch (err) {
    console.error(`  HATA: ${url} -> ${err.message}`);
    return [];
  }
}

async function scrapeTranslator(translatorSlug, ourCode) {
  const outputPath = path.join(DATA_DIR, `${ourCode}.json`);

  // Zaten doğru formatta varsa atla (son ayetin verse numarası < 300 olmalı)
  if (fs.existsSync(outputPath)) {
    const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    if (existing.quran && existing.quran.length > 6000) {
      const lastVerse = existing.quran[existing.quran.length - 1];
      if (lastVerse && lastVerse.verse <= 7) {
        // Doğru formatta - Nas suresi son ayet 6 olmalı
        console.log(`  ${ourCode} zaten mevcut (${existing.quran.length} ayet), atlaniyor.`);
        return;
      }
    }
  }

  console.log(`\n  ${ourCode} (${translatorSlug}) indiriliyor...`);
  const allVerses = [];

  for (let i = 0; i < SURAH_SLUGS.length; i++) {
    const surahSlug = SURAH_SLUGS[i];
    const surahNum = i + 1;
    const verses = await scrapeSurah(surahSlug, translatorSlug);
    allVerses.push(...verses);

    if (surahNum % 10 === 0) {
      console.log(`    Sure ${surahNum}/114 - toplam ${allVerses.length} ayet`);
    }

    // Rate limiting
    await sleep(150);
  }

  if (allVerses.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify({ quran: allVerses }, null, 2), 'utf-8');
    console.log(`  ${ourCode}: ${allVerses.length} ayet kaydedildi.`);
  } else {
    console.log(`  ${ourCode}: HIC AYET BULUNAMADI!`);
  }
}

async function main() {
  console.log('==================================================');
  console.log('  KURAN.PW SCRAPER');
  console.log('==================================================');
  console.log(`Tercüman sayısı: ${Object.keys(TRANSLATORS_TO_SCRAPE).length}`);
  console.log(`Sure sayısı: ${SURAH_SLUGS.length}`);
  console.log(`Çıktı dizini: ${DATA_DIR}\n`);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const entries = Object.entries(TRANSLATORS_TO_SCRAPE);
  for (let i = 0; i < entries.length; i++) {
    const [slug, code] = entries[i];
    console.log(`\n[${i + 1}/${entries.length}] ${code}`);
    await scrapeTranslator(slug, code);
  }

  console.log('\n==================================================');
  console.log('  TAMAMLANDI!');
  console.log('==================================================');
}

main().catch(console.error);
