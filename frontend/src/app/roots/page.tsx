'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '@/config';

interface Root {
  id: number;
  root: string;
  rootLatin: string;
  meaningTr: string | null;
  meaningEn: string | null;
  occurrenceCount: number;
  meaningDerived?: boolean;
}

// Arapça harfler + Türkçe okunuş karşılıkları
const ARABIC_LETTERS: { ar: string; tr: string }[] = [
  { ar: 'ا', tr: 'e/a' }, { ar: 'ب', tr: 'b' }, { ar: 'ت', tr: 't' },
  { ar: 'ث', tr: 'se' }, { ar: 'ج', tr: 'c' }, { ar: 'ح', tr: 'ha' },
  { ar: 'خ', tr: 'hı' }, { ar: 'د', tr: 'd' }, { ar: 'ذ', tr: 'zel' },
  { ar: 'ر', tr: 'r' }, { ar: 'ز', tr: 'z' }, { ar: 'س', tr: 's' },
  { ar: 'ش', tr: 'ş' }, { ar: 'ص', tr: 'sad' }, { ar: 'ض', tr: 'dad' },
  { ar: 'ط', tr: 'tı' }, { ar: 'ظ', tr: 'zı' }, { ar: 'ع', tr: 'ayn' },
  { ar: 'غ', tr: 'ğ' }, { ar: 'ف', tr: 'f' }, { ar: 'ق', tr: 'kaf' },
  { ar: 'ك', tr: 'k' }, { ar: 'ل', tr: 'l' }, { ar: 'م', tr: 'm' },
  { ar: 'ن', tr: 'n' }, { ar: 'ه', tr: 'h' }, { ar: 'و', tr: 'v' },
  { ar: 'ي', tr: 'y' },
];

export default function RootsPage() {
  const [roots, setRoots] = useState<Root[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'count' | 'alpha'>('count');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearching = searchQuery.length > 0;
  const limit = 60;

  const fetchRoots = useCallback((q: string, letter: string | null, sort: string, pg: number) => {
    setLoading(true);

    if (q.length > 0) {
      fetch(`${API_BASE}/roots/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          setRoots(data.results || []);
          setTotal(data.results?.length || 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }

    let url = `${API_BASE}/roots?limit=${limit}&offset=${pg * limit}&sort=${sort}`;
    if (letter) url += `&letter=${encodeURIComponent(letter)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRoots(data.roots || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Arama debounce
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(0);
      fetchRoots(searchQuery, activeLetter, sortBy, 0);
    }, 300);
  }, [searchQuery]);

  // Harf / sıralama / sayfa değişimi
  useEffect(() => {
    if (searchQuery) return;
    fetchRoots('', activeLetter, sortBy, page);
  }, [activeLetter, sortBy, page]);

  const handleLetterClick = (ar: string) => {
    setSearchQuery('');
    setPage(0);
    setActiveLetter(prev => prev === ar ? null : ar);
  };

  const clearAll = () => {
    setSearchQuery('');
    setActiveLetter(null);
    setPage(0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-soft-800 dark:text-white mb-1">
          Kelime Kökleri
        </h1>
        <p className="text-soft-500 dark:text-gray-400 text-sm">
          Kuran'daki {total > 0 ? total.toLocaleString('tr-TR') : '1.658'} benzersiz kök — Arapça, Latin yazım veya Türkçe anlamla arayın
        </p>
      </div>

      {/* Arama kutusu */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-soft-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kök ara... (ör: كتب, ktb, yazmak)"
          className="w-full pl-10 pr-10 py-3 border border-soft-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-soft-800 dark:text-white placeholder:text-soft-400 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:outline-none transition-all"
          dir="auto"
        />
        {(searchQuery || activeLetter) && (
          <button
            onClick={clearAll}
            className="absolute inset-y-0 right-3 flex items-center text-soft-400 hover:text-soft-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Harf filtresi */}
      {!isSearching && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {ARABIC_LETTERS.map(({ ar, tr }) => (
            <button
              key={ar}
              onClick={() => handleLetterClick(ar)}
              className={`flex flex-col items-center justify-center rounded-lg transition-all px-1.5 py-1 min-w-[2.5rem] ${
                activeLetter === ar
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border border-soft-200 dark:border-gray-700 text-soft-700 dark:text-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              <span className="font-arabic text-base leading-tight">{ar}</span>
              <span className={`text-[9px] leading-tight font-sans ${activeLetter === ar ? 'text-white/80' : 'text-soft-400 dark:text-gray-500'}`}>{tr}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sıralama ve istatistik */}
      {!isSearching && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-soft-500 dark:text-gray-400">
            {activeLetter ? (
              <><span className="font-arabic text-base">{activeLetter}</span> harfiyle başlayan — <strong>{total}</strong> kök</>
            ) : (
              <>Toplam <strong>{total}</strong> kök</>
            )}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => { setSortBy('count'); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'count'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 border border-soft-200 dark:border-gray-700 text-soft-600 dark:text-gray-300 hover:border-primary-300'
              }`}
            >
              En Çok Geçen
            </button>
            <button
              onClick={() => { setSortBy('alpha'); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'alpha'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 border border-soft-200 dark:border-gray-700 text-soft-600 dark:text-gray-300 hover:border-primary-300'
              }`}
            >
              Alfabetik
            </button>
          </div>
        </div>
      )}

      {isSearching && (
        <p className="text-sm text-soft-500 dark:text-gray-400 mb-4">
          &ldquo;<strong>{searchQuery}</strong>&rdquo; için <strong>{total}</strong> sonuç
        </p>
      )}

      {/* Kök listesi */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : roots.length === 0 ? (
        <div className="text-center py-16 text-soft-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{isSearching ? `"${searchQuery}" için sonuç bulunamadı` : 'Kök bulunamadı'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {roots.map((root) => (
            <a
              key={root.id}
              href={`/roots/${encodeURIComponent(root.root)}/`}
              className="group flex flex-col p-3 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-soft-md transition-all duration-200"
            >
              {/* Arapça kök + sayaç */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-arabic text-2xl text-soft-800 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {root.root}
                </span>
                <span className="flex-shrink-0 text-[11px] px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium mt-1">
                  {root.occurrenceCount}x
                </span>
              </div>

              {/* Latin yazım */}
              {root.rootLatin && (
                <p className="text-xs text-soft-400 dark:text-gray-500 font-mono mb-1">
                  {root.rootLatin}
                </p>
              )}

              {/* Türkçe anlam */}
              {root.meaningTr ? (
                <p className="text-xs text-soft-600 dark:text-gray-300 leading-snug line-clamp-2">
                  {root.meaningTr}
                </p>
              ) : root.meaningEn ? (
                <p className="text-xs text-soft-400 dark:text-gray-500 italic leading-snug line-clamp-2">
                  {root.meaningEn}
                </p>
              ) : null}
            </a>
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {!isSearching && !loading && total > limit && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-soft-200 dark:border-gray-700 rounded-lg text-sm hover:bg-soft-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-all"
          >
            ← Önceki
          </button>
          <span className="text-sm text-soft-500 dark:text-gray-400">
            {page + 1} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * limit >= total}
            className="px-4 py-2 border border-soft-200 dark:border-gray-700 rounded-lg text-sm hover:bg-soft-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-all"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
