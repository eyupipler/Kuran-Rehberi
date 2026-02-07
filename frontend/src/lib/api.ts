/**
 * API Client
 * Backend ile iletisim icin yardimci fonksiyonlar
 */

const API_BASE = '/api';

export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  totalVerses: number;
  revelationType: 'Mekki' | 'Medeni';
  revelationOrder: number;
}

export interface Verse {
  id: number;
  surahId: number;
  verseNumber: number;
  arabicText: string;
  translation?: string;
  translatorName?: string;
}

export interface Translation {
  translatorCode: string;
  translatorName: string;
  language: string;
  text: string;
}

export interface Word {
  position: number;
  arabicWord: string;
  lemma: string;
  partOfSpeech: string;
  root: string;
  rootOccurrenceCount: number;
}

export interface Root {
  id: number;
  root: string;
  rootLatin: string;
  meaningTr: string;
  meaningEn: string;
  occurrenceCount: number;
}

export interface Translator {
  code: string;
  name: string;
  language: string;
  translationCount: number;
}

/**
 * Tum sureleri getir
 */
export async function getSurahs(): Promise<Surah[]> {
  const res = await fetch(`${API_BASE}/surahs`);
  if (!res.ok) throw new Error('Sureler yuklenemedi');
  return res.json();
}

/**
 * Belirli bir sureyi getir
 */
export async function getSurah(id: number): Promise<Surah> {
  const res = await fetch(`${API_BASE}/surahs/${id}`);
  if (!res.ok) throw new Error('Sure bulunamadi');
  return res.json();
}

/**
 * Bir surenin ayetlerini getir
 */
export async function getSurahVerses(
  surahId: number,
  translator?: string
): Promise<{ surah: Surah; verses: Verse[] }> {
  const url = translator
    ? `${API_BASE}/surahs/${surahId}/verses?translator=${translator}`
    : `${API_BASE}/surahs/${surahId}/verses`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Ayetler yuklenemedi');
  return res.json();
}

/**
 * Belirli bir ayeti tum cevirileriyle getir
 */
export async function getVerse(
  surahId: number,
  verseNumber: number
): Promise<{ verse: Verse; translations: Translation[]; words: Word[] }> {
  const res = await fetch(`${API_BASE}/verses/${surahId}/${verseNumber}`);
  if (!res.ok) throw new Error('Ayet bulunamadi');
  return res.json();
}

/**
 * Bir ayetin kelime analizini getir
 */
export async function getVerseWords(
  surahId: number,
  verseNumber: number
): Promise<{ arabicText: string; words: Word[] }> {
  const res = await fetch(`${API_BASE}/verses/${surahId}/${verseNumber}/words`);
  if (!res.ok) throw new Error('Kelimeler yuklenemedi');
  return res.json();
}

/**
 * Meallerde arama yap
 */
export async function searchTranslations(
  query: string,
  options?: { translator?: string; language?: string; limit?: number; offset?: number }
): Promise<{ query: string; total: number; results: any[] }> {
  const params = new URLSearchParams({ q: query });
  if (options?.translator) params.append('translator', options.translator);
  if (options?.language) params.append('language', options.language);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) throw new Error('Arama yapilamadi');
  return res.json();
}

/**
 * Arapca metinde arama yap
 */
export async function searchArabic(
  query: string,
  limit?: number,
  offset?: number
): Promise<{ query: string; total: number; results: any[] }> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const res = await fetch(`${API_BASE}/search/arabic?${params}`);
  if (!res.ok) throw new Error('Arama yapilamadi');
  return res.json();
}

/**
 * Tercumanlari getir
 */
export async function getTranslators(language?: string): Promise<Translator[]> {
  const url = language
    ? `${API_BASE}/search/translators?language=${language}`
    : `${API_BASE}/search/translators`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Tercumanlar yuklenemedi');
  return res.json();
}

/**
 * Kelime koklerini getir
 */
export async function getRoots(
  limit?: number,
  offset?: number,
  sort?: 'count' | 'alpha'
): Promise<{ total: number; roots: Root[] }> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  if (sort) params.append('sort', sort);

  const res = await fetch(`${API_BASE}/roots?${params}`);
  if (!res.ok) throw new Error('Kokler yuklenemedi');
  return res.json();
}

/**
 * Belirli bir kokun detaylarini getir
 */
export async function getRoot(root: string): Promise<{
  root: Root;
  totalOccurrences: number;
  occurrences: any[];
  derivedForms: any[];
  distribution: any[];
}> {
  const res = await fetch(`${API_BASE}/roots/${encodeURIComponent(root)}`);
  if (!res.ok) throw new Error('Kok bulunamadi');
  return res.json();
}

/**
 * Kok ara
 */
export async function searchRoots(query: string): Promise<{ query: string; results: Root[] }> {
  const res = await fetch(`${API_BASE}/roots/search/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Kok aranamadi');
  return res.json();
}
