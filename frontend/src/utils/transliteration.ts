// Arapça harfleri Türkçe okunuşa çeviren fonksiyon
const arabicToTurkish: { [key: string]: string } = {
  // Harfler
  'ا': 'a', 'أ': 'e', 'إ': 'i', 'آ': 'â',
  'ب': 'b',
  'ت': 't',
  'ث': 's',
  'ج': 'c',
  'ح': 'h',
  'خ': 'h',
  'د': 'd',
  'ذ': 'z',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'ş',
  'ص': 's',
  'ض': 'd',
  'ط': 't',
  'ظ': 'z',
  'ع': "'",
  'غ': 'ğ',
  'ف': 'f',
  'ق': 'k',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'v',
  'ي': 'y',
  'ى': 'a',
  'ة': 'h',
  'ء': "'",

  // Elif-lam bağlantısı
  'ٱ': '',

  // Harekeler
  'َ': 'e',   // Fetha
  'ُ': 'u',   // Damme
  'ِ': 'i',   // Kesra
  'ً': 'en',  // Tenvin fetha
  'ٌ': 'un',  // Tenvin damme
  'ٍ': 'in',  // Tenvin kesra
  'ْ': '',    // Sukun
  'ّ': '',    // Şedde (harf tekrarı)
  'ٰ': 'a',   // Elif-i maksure
  'ٓ': '',    // Medde
  'ۡ': '',    // Sukun (alternatif)
  'ۥ': '',    // Küçük vav
  'ۦ': '',    // Küçük ya
};

// Şedde işareti - önceki harfi tekrarla
const SHADDA = 'ّ';

export function transliterate(arabic: string): string {
  if (!arabic) return '';

  let result = '';
  let prevChar = '';

  for (let i = 0; i < arabic.length; i++) {
    const char = arabic[i];

    // Şedde kontrolü - önceki sessiz harfi tekrarla
    if (char === SHADDA && prevChar) {
      result += prevChar;
      continue;
    }

    // Karakter dönüşümü
    const converted = arabicToTurkish[char];
    if (converted !== undefined) {
      result += converted;
      // Sadece sessiz harfleri kaydet (harekeler hariç)
      if (!'ًٌٍَُِْٰٓۡۥۦ'.includes(char) && converted !== '') {
        prevChar = converted;
      }
    } else if (/[\s\u0020-\u007F]/.test(char)) {
      // ASCII karakterleri ve boşlukları koru
      result += char;
      prevChar = '';
    }
    // Bilinmeyen Arapça karakterleri atla
  }

  // Sonuçları temizle
  result = result
    .replace(/'+/g, "'")        // Çoklu apostrof
    .replace(/^'+|'+$/g, '')    // Baştaki/sondaki apostrof
    .replace(/\s+/g, ' ')       // Çoklu boşluk
    .trim();

  return result;
}

// Kök harflerini okunuşa çevir (harfler arasında boşluk var)
export function transliterateRoot(root: string): string {
  if (!root) return '';

  // Kök harflerini ayır ve her birini çevir
  const letters = root.split('').filter(c => !'\u064B-\u065F'.includes(c));
  const converted = letters.map(letter => {
    const tr = arabicToTurkish[letter];
    return tr !== undefined ? tr : letter;
  }).filter(Boolean);

  return converted.join('-');
}
