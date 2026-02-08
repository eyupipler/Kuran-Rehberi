'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/config';

interface SearchResult {
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
  translatorCode: string;
  translatorName: string;
  translation: string;
}

interface Translator {
  code: string;
  name: string;
  language: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'translation' | 'arabic'>('translation');
  const [selectedTranslator, setSelectedTranslator] = useState('');
  const [translators, setTranslators] = useState<Translator[]>([]);

  // Tercümanları yükle
  useEffect(() => {
    fetch(`${API_BASE}/search/translators`)
      .then((res) => res.json())
      .then((data) => setTranslators(data))
      .catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (query.length < 2) return;

    setLoading(true);

    try {
      let url = '';
      if (searchType === 'arabic') {
        url = `${API_BASE}/search/arabic?q=${encodeURIComponent(query)}`;
      } else {
        url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
        if (selectedTranslator) {
          url += `&translator=${selectedTranslator}`;
        }
      }

      const res = await fetch(url);
      const data = await res.json();

      setResults(data.results);
      setTotal(data.total);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Kuran'da Ara
      </h1>

      {/* Arama Formu */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border mb-8">
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="translation"
              checked={searchType === 'translation'}
              onChange={(e) => setSearchType('translation')}
              className="mr-2"
            />
            Meallerde Ara
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="arabic"
              checked={searchType === 'arabic'}
              onChange={(e) => setSearchType('arabic')}
              className="mr-2"
            />
            Arapça Metinde Ara
          </label>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              searchType === 'arabic' ? 'Arapça kelime girin...' : 'Aranacak kelime...'
            }
            className={`flex-1 px-4 py-3 border rounded-lg ${
              searchType === 'arabic' ? 'font-arabic text-right text-xl' : ''
            }`}
            dir={searchType === 'arabic' ? 'rtl' : 'ltr'}
          />

          {searchType === 'translation' && (
            <select
              value={selectedTranslator}
              onChange={(e) => setSelectedTranslator(e.target.value)}
              className="px-4 py-3 border rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="">Tüm Mealler</option>
              <optgroup label="Türkçe">
                {translators
                  .filter((t) => t.language === 'tr')
                  .map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="İngilizce">
                {translators
                  .filter((t) => t.language === 'en')
                  .map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          )}

          <button
            onClick={handleSearch}
            disabled={loading || query.length < 2}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>
      </div>

      {/* Sonuclar */}
      {total > 0 && (
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          <strong>{total}</strong> sonuç bulundu
        </p>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={`${result.surahId}-${result.verseNumber}-${index}`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <Link
                href={`/verse/${result.surahId}/${result.verseNumber}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {result.surahName} ({result.surahId}:{result.verseNumber})
              </Link>
              <span className="text-lg font-arabic">{result.surahArabicName}</span>
            </div>

            {/* Arapça */}
            <p className="text-xl font-arabic arabic-text text-gray-800 dark:text-gray-200 mb-3">
              {searchType === 'arabic'
                ? highlightText(result.arabicText, query)
                : result.arabicText}
            </p>

            {/* Çeviri */}
            {result.translation && (
              <div className="pl-4 border-l-2 border-primary-200">
                <p className="text-gray-700 dark:text-gray-300">
                  {searchType === 'translation'
                    ? highlightText(result.translation, query)
                    : result.translation}
                </p>
                <p className="text-xs text-gray-400 mt-1">{result.translatorName}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {query && results.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          "{query}" için sonuç bulunamadı
        </div>
      )}
    </div>
  );
}
