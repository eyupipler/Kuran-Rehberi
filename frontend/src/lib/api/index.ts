import { apiGet } from './client';
import type {
  DerivedForm,
  Root,
  RootDetailResponse,
  RootFilters,
  SearchResponse,
  Surah,
  Translator,
  Verse,
  VerseResponse,
} from './types';

export * from './types';
export { ApiError, errorMessage } from './client';
export type { DerivedForm };

type Opts = { signal?: AbortSignal };

export const getSurahs = (opts: Opts = {}) => apiGet<Surah[]>('/surahs', opts);

export const getSurah = (id: number, opts: Opts = {}) => apiGet<Surah>(`/surahs/${id}`, opts);

export const getSurahVerses = (
  surahId: number,
  translator?: string,
  opts: Opts = {}
) =>
  apiGet<{ surah: Surah; verses: Verse[] }>(`/surahs/${surahId}/verses`, {
    query: { translator },
    ...opts,
  });

export const getVerse = (surahId: number, verseNumber: number, opts: Opts = {}) =>
  apiGet<VerseResponse>(`/verses/${surahId}/${verseNumber}`, opts);

export const getTranslators = (language?: string, opts: Opts = {}) =>
  apiGet<Translator[]>('/search/translators', { query: { language }, ...opts });

export interface SearchFilters {
  translator?: string | null;
  language?: string | null;
  surah?: number | null;
  revelation?: 'Mekki' | 'Medeni' | null;
  limit?: number;
  offset?: number;
}

export const searchTranslations = (query: string, params: SearchFilters = {}, opts: Opts = {}) =>
  apiGet<SearchResponse>('/search', { query: { q: query, ...params }, ...opts });

export const searchArabic = (query: string, params: SearchFilters = {}, opts: Opts = {}) =>
  apiGet<SearchResponse>('/search/arabic', { query: { q: query, ...params }, ...opts });

export const getRoots = (
  params: { limit?: number; offset?: number; sort?: 'count' | 'alpha'; letter?: string | null } = {},
  opts: Opts = {}
) => apiGet<{ total: number; roots: Root[] }>('/roots', { query: params, ...opts });

export const searchRoots = (query: string, opts: Opts = {}) =>
  apiGet<{ query: string; results: Root[] }>('/roots/search', { query: { q: query }, ...opts });

export const getRoot = (
  root: string,
  params: { translator?: string } & RootFilters = {},
  opts: Opts = {}
) =>
  apiGet<RootDetailResponse>(`/roots/${encodeURIComponent(root)}`, {
    query: { ...params },
    ...opts,
  });
