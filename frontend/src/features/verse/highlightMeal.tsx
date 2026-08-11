import type { ReactNode } from 'react';

const TR_LETTERS = 'a-züğışçöâîûA-ZÜĞIŞÇÖÂÎÛ';

function toLowerTr(value: string): string {
  return value.toLocaleLowerCase('tr-TR').replace(/İ/g, 'i').replace(/I/g, 'ı');
}

/**
 * Kaba Türkçe gövdeleme. Amaç dilbilimsel doğruluk değil; kelime çevirisini
 * meal metninde bulabilmek için yeterli ortak önek yakalamak.
 */
function turkishStem(word: string): string {
  const suffixes = [
    'mayacağını', 'meyeceğini', 'ınmayacağı', 'inmeyeceği',
    'mayacağı', 'meyeceği', 'mayacak', 'meyecek',
    'acağını', 'eceğini', 'acağı', 'eceği', 'acak', 'ecek',
    'ıyor', 'iyor', 'uyor', 'üyor',
    'mış', 'miş', 'muş', 'müş',
    'mak', 'mek', 'arak', 'erek',
    'mez', 'maz',
    'tı', 'ti', 'tu', 'tü', 'dı', 'di', 'du', 'dü',
    'an', 'en', 'ar', 'er', 'ır', 'ir', 'ur', 'ür',
    'ıp', 'ip', 'up', 'üp',
    'lerin', 'ların', 'lerde', 'lardan', 'lerden',
    'lar', 'ler', 'nın', 'nin', 'nun', 'nün',
    'nden', 'ndan', 'den', 'dan', 'ten', 'tan',
    'nde', 'nda', 'de', 'da', 'te', 'ta',
    'in', 'ın', 'un', 'ün', 'yi', 'yı', 'yu', 'yü', 'ye', 'ya',
  ];

  let stem = toLowerTr(word);
  for (let pass = 0; pass < 3; pass += 1) {
    const match = suffixes.find(
      (suffix) => stem.length > suffix.length + 2 && stem.endsWith(suffix)
    );
    if (!match) break;
    stem = stem.slice(0, stem.length - match.length);
  }
  return stem.length > 4 ? stem.slice(0, 4) : stem;
}

function mark(text: string, key?: number): ReactNode {
  return (
    <mark key={key} className="rounded bg-marker px-0.5 font-medium not-italic text-marker-ink">
      {text}
    </mark>
  );
}

function highlightExact(meal: string, term: string): ReactNode | null {
  const termLower = toLowerTr(term);
  if (termLower.length < 3) return null;
  const index = toLowerTr(meal).indexOf(termLower);
  if (index < 0) return null;
  return (
    <>
      {meal.slice(0, index)}
      {mark(meal.slice(index, index + term.length))}
      {meal.slice(index + term.length)}
    </>
  );
}

function highlightStem(meal: string, stem: string): ReactNode | null {
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Kelime başına sabitlenir; "yalanladılar" içindeki "alan" yakalanmasın diye.
  const pattern = new RegExp(`(?<![${TR_LETTERS}])(${escaped}[${TR_LETTERS}]*)`, 'gi');
  const parts = meal.split(pattern);
  if (parts.length <= 1) return null;
  return <>{parts.map((part, index) => (index % 2 === 1 ? mark(part, index) : part))}</>;
}

function verbFormsOf(term: string): string[] {
  const lower = toLowerTr(term);
  if (!lower.endsWith('mak') && !lower.endsWith('mek')) return [];
  const stem = lower.slice(0, -3);
  if (stem.length < 2) return [];
  const back = lower.endsWith('mak');
  return back
    ? [stem + 'ın', stem + 'dı', stem + 'an', stem + 'ır', stem + 'mış', stem + 'ıp']
    : [stem + 'il', stem + 'di', stem + 'en', stem + 'ir', stem + 'miş', stem + 'ip'];
}

/**
 * Meal metninde, seçilen Arapça kelimenin Türkçe karşılığını vurgular.
 * Bulunamazsa metin olduğu gibi döner.
 */
export function MealWithHighlight({
  meal,
  translationTr,
}: {
  meal: string;
  translationTr: string | null | undefined;
}) {
  if (!meal || !translationTr) return <>{meal}</>;

  const terms = translationTr
    .split(/[,،/;\s]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);

  for (const term of terms) {
    try {
      const exact = highlightExact(meal, term);
      if (exact) return exact;

      const stem = turkishStem(term);
      if (stem.length >= 3) {
        const byStem = highlightStem(meal, stem);
        if (byStem) return byStem;
      }

      for (const form of verbFormsOf(term)) {
        const byForm = highlightStem(meal, form);
        if (byForm) return byForm;
      }
    } catch {
      // Geçersiz desen üreten terimler atlanır.
    }
  }

  return <>{meal}</>;
}

/** Arapça metinde belirli bir kelimeyi (konumuna göre) vurgular. */
export function ArabicWithHighlight({
  text,
  targetWord,
  wordPosition,
}: {
  text: string;
  targetWord: string;
  wordPosition: number;
}) {
  const words = text.split(/\s+/);
  return (
    <span dir="rtl">
      {words.map((word, index) => {
        const isTarget = index + 1 === wordPosition || word === targetWord;
        return (
          <span key={index}>
            {index > 0 && ' '}
            {isTarget ? mark(word) : word}
          </span>
        );
      })}
    </span>
  );
}
