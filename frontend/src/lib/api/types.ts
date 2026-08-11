export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  totalVerses: number;
  revelationType: 'Mekki' | 'Medeni';
  revelationOrder: number;
}

export interface SurahSummary {
  id: number;
  name: string;
  arabicName: string;
  totalVerses: number;
}

export interface Verse {
  id: number;
  verseNumber: number;
  arabicText: string;
  translation?: string | null;
  translatorName?: string;
}

export interface VerseDetail {
  id: number;
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
}

export interface Translation {
  translatorCode: string;
  translatorName: string;
  language: string;
  text: string;
}

export interface Translator {
  code: string;
  name: string;
  language: string;
}

export interface Word {
  position: number;
  arabicWord: string;
  lemma: string;
  partOfSpeech: string;
  translationTr: string | null;
  root: string | null;
  rootOccurrenceCount: number;
  rootMeaningTr: string | null;
}

export interface RelatedVerse {
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  /** Aşağıdaki alanlar API'ye sonradan eklendi; eski sürümde bulunmayabilir. */
  revelationType?: RevelationType;
  /** Hedef ayet de bu ayete işaret ediyorsa true. */
  mutual?: boolean;
  /** Hedef ayetin kendi bağlantı sayısı. */
  relatedCount?: number;
}

export interface VerseResponse {
  verse: VerseDetail;
  translations: Translation[];
  words: Word[];
  relatedVerses: RelatedVerse[];
}

export interface Root {
  id: number;
  root: string;
  rootLatin: string | null;
  meaningTr: string | null;
  meaningEn: string | null;
  occurrenceCount: number;
  meaningDerived?: boolean;
}

export type RevelationType = 'Mekki' | 'Medeni';

export interface RootOccurrence {
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
  /** Eski API sürümlerinde bulunmayabilir. */
  revelationType?: RevelationType;
  word: string;
  wordPosition: number;
  lemma: string;
  partOfSpeech: string;
  translationTr: string | null;
  verseMealTr: string | null;
  translatorName?: string;
}

export interface DerivedForm {
  word: string;
  lemma: string;
  partOfSpeech: string;
  count: number;
}

export interface RootDistribution {
  surahId: number;
  surahName: string;
  /** Eski API sürümlerinde bulunmayabilir. */
  revelationType?: RevelationType;
  count: number;
}

export interface PartOfSpeechCount {
  value: string;
  count: number;
}

export interface RootDetailResponse {
  root: Root;
  totalOccurrences: number;
  occurrences: RootOccurrence[];
  derivedForms: DerivedForm[];
  distribution: RootDistribution[];
  /** Eski API sürümlerinde bulunmayabilir. */
  partsOfSpeech?: PartOfSpeechCount[];
}

export interface RootFilters {
  surah?: number | null;
  revelation?: RevelationType | null;
  pos?: string | null;
  form?: string | null;
}

export interface SearchResult {
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
  /** Eski API sürümlerinde bulunmayabilir. */
  revelationType?: RevelationType;
  translatorCode?: string;
  translatorName?: string;
  translation?: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}
