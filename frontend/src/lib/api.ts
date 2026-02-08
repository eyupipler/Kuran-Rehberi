/**
 * API Client
 * Backend ile iletişim için yardımcı fonksiyonlar
 */

// Render.com'daki backend URL'si
const API_BASE = 'https://kuran-rehberi-api.onrender.com/api';

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
 * Tüm sureleri getir
 */
export async function getSurahs(): Promise<Surah[]> {
  const res = await fetch(`${API_BASE}/surahs`);
  if (!res.ok) throw new Error('Sureler yüklenemedi');
  return res.json();
}

/**
 * Belirli bir sureyi getir
 */
export async function getSurah(id: number): Promise<Surah> {
  const res = await fetch(`${API_BASE}/surahs/${id}`);
  if (!res.ok) throw new Error('Sure bulunamadı');
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
  if (!res.ok) throw new Error('Ayetler yüklenemedi');
  return res.json();
}

/**
 * Belirli bir ayeti tüm çevirileriyle getir
 */
export async function getVerse(
  surahId: number,
  verseNumber: number
): Promise<{ verse: Verse; translations: Translation[]; words: Word[] }> {
  const res = await fetch(`${API_BASE}/verses/${surahId}/${verseNumber}`);
  if (!res.ok) throw new Error('Ayet bulunamadı');
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
  if (!res.ok) throw new Error('Kelimeler yüklenemedi');
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
  if (!res.ok) throw new Error('Arama yapılamadı');
  return res.json();
}

/**
 * Arapça metinde arama yap
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
  if (!res.ok) throw new Error('Arama yapılamadı');
  return res.json();
}

/**
 * Tercümanları getir
 */
export async function getTranslators(language?: string): Promise<Translator[]> {
  const url = language
    ? `${API_BASE}/search/translators?language=${language}`
    : `${API_BASE}/search/translators`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Tercümanlar yüklenemedi');
  return res.json();
}

/**
 * Kelime köklerini getir
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
  if (!res.ok) throw new Error('Kökler yüklenemedi');
  return res.json();
}

/**
 * Belirli bir kökün detaylarını getir
 */
export async function getRoot(root: string): Promise<{
  root: Root;
  totalOccurrences: number;
  occurrences: any[];
  derivedForms: any[];
  distribution: any[];
}> {
  const res = await fetch(`${API_BASE}/roots/${encodeURIComponent(root)}`);
  if (!res.ok) throw new Error('Kök bulunamadı');
  return res.json();
}

/**
 * Kök ara
 */
export async function searchRoots(query: string): Promise<{ query: string; results: Root[] }> {
  const res = await fetch(`${API_BASE}/roots/search/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Kök aranamadı');
  return res.json();
}
