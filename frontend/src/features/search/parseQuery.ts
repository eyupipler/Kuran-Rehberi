import type { Surah } from '@/lib/api';

export type QuerySuggestion =
  | { kind: 'verse'; surahId: number; verseNumber: number; title: string; hint: string }
  | { kind: 'surah'; surahId: number; title: string; hint: string }
  | { kind: 'root'; root: string; title: string; hint: string }
  | { kind: 'search'; query: string; mode: 'translation' | 'arabic'; title: string; hint: string };

const ARABIC_RANGE = /[؀-ۿ]/;

export function isArabic(value: string): boolean {
  return ARABIC_RANGE.test(value);
}

/** Türkçe sure adlarını aksan ve büyük/küçük harften bağımsız karşılaştırır. */
export function normalizeTurkish(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[âāá]/g, 'a')
    .replace(/[îīí]/g, 'i')
    .replace(/[ûūú]/g, 'u')
    .replace(/[ôō]/g, 'o')
    .replace(/[êē]/g, 'e')
    .replace(/['`’\-\s]/g, '');
}

function matchSurahs(term: string, surahs: Surah[]): Surah[] {
  const normalized = normalizeTurkish(term);
  if (!normalized) return [];
  return surahs.filter((surah) => normalizeTurkish(surah.name).startsWith(normalized));
}

function clampVerse(surah: Surah, verseNumber: number): number | null {
  return verseNumber >= 1 && verseNumber <= surah.totalVerses ? verseNumber : null;
}

/**
 * Tek bir arama kutusundan gelen sorguyu olası hedeflere çevirir.
 * Desteklenen biçimler: "2:255", "bakara 255", "bakara", "root:رحم", "رحمة", "rahmet"
 */
export function parseQuery(rawInput: string, surahs: Surah[]): QuerySuggestion[] {
  const input = rawInput.trim();
  if (!input) return [];

  const suggestions: QuerySuggestion[] = [];
  const surahById = (id: number) => surahs.find((surah) => surah.id === id);

  // root:xxx — doğrudan kök araması
  const rootPrefix = input.match(/^(?:root|kök|kok):\s*(.+)$/i);
  if (rootPrefix) {
    const root = rootPrefix[1].trim();
    return [{ kind: 'root', root, title: root, hint: 'Kök detayını aç' }];
  }

  // 2:255 veya 2.255
  const numeric = input.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
  if (numeric) {
    const surah = surahById(Number(numeric[1]));
    const verseNumber = surah ? clampVerse(surah, Number(numeric[2])) : null;
    if (surah && verseNumber) {
      suggestions.push({
        kind: 'verse',
        surahId: surah.id,
        verseNumber,
        title: `${surah.name} ${surah.id}:${verseNumber}`,
        hint: 'Ayete git',
      });
      return suggestions;
    }
  }

  // Yalnızca sure numarası
  const onlyNumber = input.match(/^(\d{1,3})$/);
  if (onlyNumber) {
    const surah = surahById(Number(onlyNumber[1]));
    if (surah) {
      suggestions.push({
        kind: 'surah',
        surahId: surah.id,
        title: `${surah.id}. ${surah.name} Suresi`,
        hint: `${surah.totalVerses} ayet`,
      });
    }
  }

  // "bakara 255" — sure adı + ayet numarası
  const named = input.match(/^(.+?)\s+(\d{1,3})$/);
  if (named) {
    const [surah] = matchSurahs(named[1], surahs);
    const verseNumber = surah ? clampVerse(surah, Number(named[2])) : null;
    if (surah && verseNumber) {
      suggestions.push({
        kind: 'verse',
        surahId: surah.id,
        verseNumber,
        title: `${surah.name} ${surah.id}:${verseNumber}`,
        hint: 'Ayete git',
      });
    }
  }

  for (const surah of matchSurahs(input, surahs).slice(0, 5)) {
    suggestions.push({
      kind: 'surah',
      surahId: surah.id,
      title: `${surah.id}. ${surah.name} Suresi`,
      hint: `${surah.totalVerses} ayet · ${surah.revelationType}`,
    });
  }

  if (input.length >= 2) {
    if (isArabic(input)) {
      suggestions.push({
        kind: 'root',
        root: input,
        title: input,
        hint: 'Kök olarak ara',
      });
      suggestions.push({
        kind: 'search',
        query: input,
        mode: 'arabic',
        title: input,
        hint: 'Arapça metinde ara',
      });
    } else {
      suggestions.push({
        kind: 'search',
        query: input,
        mode: 'translation',
        title: input,
        hint: 'Meallerde ara',
      });
      suggestions.push({
        kind: 'root',
        root: input,
        title: input,
        hint: 'Kelime kökü olarak ara',
      });
    }
  }

  return suggestions;
}

export function suggestionHref(suggestion: QuerySuggestion): string {
  switch (suggestion.kind) {
    case 'verse':
      return `/verse/${suggestion.surahId}/${suggestion.verseNumber}`;
    case 'surah':
      return `/surah/${suggestion.surahId}`;
    case 'root':
      return `/roots?q=${encodeURIComponent(suggestion.root)}`;
    case 'search':
      return `/search?q=${encodeURIComponent(suggestion.query)}&type=${suggestion.mode}`;
  }
}
