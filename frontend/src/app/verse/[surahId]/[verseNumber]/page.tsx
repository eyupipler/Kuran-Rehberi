'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface VerseData {
  id: number;
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
}

interface Translation {
  translatorCode: string;
  translatorName: string;
  language: string;
  text: string;
}

interface Word {
  position: number;
  arabicWord: string;
  lemma: string;
  partOfSpeech: string;
  root: string;
  rootOccurrenceCount: number;
}

export default function VersePage() {
  const params = useParams();
  const surahId = params.surahId as string;
  const verseNumber = params.verseNumber as string;

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  useEffect(() => {
    if (!surahId || !verseNumber) return;

    setLoading(true);
    fetch(`/api/verses/${surahId}/${verseNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setVerse(data.verse);
        setTranslations(data.translations);
        setWords(data.words);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ayet yuklenemedi:', err);
        setLoading(false);
      });
  }, [surahId, verseNumber]);

  const filteredTranslations = translations.filter(
    (t) => languageFilter === 'all' || t.language === languageFilter
  );

  const languages = [...new Set(translations.map((t) => t.language))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!verse) {
    return <div className="text-center py-12">Ayet bulunamadi</div>;
  }

  return (
    <div>
      {/* Baslik */}
      <div className="mb-8">
        <Link
          href={`/surah/${surahId}`}
          className="text-primary-600 hover:underline text-sm mb-4 inline-block"
        >
          &larr; {verse.surahName} Suresine Don
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {verse.surahName} Suresi, {verseNumber}. Ayet
            </h1>
            <p className="text-gray-500">
              {verse.surahId}:{verseNumber}
            </p>
          </div>
          <h2 className="text-3xl font-arabic text-gray-800 dark:text-gray-200">
            {verse.surahArabicName}
          </h2>
        </div>
      </div>

      {/* Arapca Metin */}
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg border mb-8">
        <p className="text-3xl font-arabic leading-loose text-gray-900 dark:text-white arabic-text">
          {verse.arabicText}
        </p>
      </div>

      {/* Kelime Analizi */}
      {words.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Kelime Kelime Analiz
          </h3>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {words.map((word) => (
              <button
                key={word.position}
                onClick={() => setSelectedWord(word)}
                className={`px-3 py-2 rounded-lg text-lg font-arabic transition-colors ${
                  selectedWord?.position === word.position
                    ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {word.arabicWord}
              </button>
            ))}
          </div>

          {/* Secili Kelime Detayi */}
          {selectedWord && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kelime</p>
                  <p className="text-xl font-arabic">{selectedWord.arabicWord}</p>
                </div>
                {selectedWord.root && (
                  <div>
                    <p className="text-sm text-gray-500">Kok</p>
                    <Link
                      href={`/roots/${encodeURIComponent(selectedWord.root)}`}
                      className="text-xl font-arabic text-primary-600 hover:underline"
                    >
                      {selectedWord.root}
                    </Link>
                    {selectedWord.rootOccurrenceCount > 0 && (
                      <p className="text-xs text-gray-400">
                        Kuran'da {selectedWord.rootOccurrenceCount} kez gecmektedir
                      </p>
                    )}
                  </div>
                )}
                {selectedWord.lemma && (
                  <div>
                    <p className="text-sm text-gray-500">Lemma</p>
                    <p className="text-xl font-arabic">{selectedWord.lemma}</p>
                  </div>
                )}
                {selectedWord.partOfSpeech && (
                  <div>
                    <p className="text-sm text-gray-500">Kelime Turu</p>
                    <p className="root-badge">{selectedWord.partOfSpeech}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ceviriler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ceviriler ({filteredTranslations.length})
          </h3>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700"
          >
            <option value="all">Tum Diller</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'tr' ? 'Turkce' : lang === 'en' ? 'Ingilizce' : lang}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredTranslations.map((t) => (
            <div key={t.translatorCode} className="translation-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {t.translatorName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {t.language === 'tr' ? 'Turkce' : t.language === 'en' ? 'Ingilizce' : t.language}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigasyon */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        {parseInt(verseNumber) > 1 && (
          <Link
            href={`/verse/${surahId}/${parseInt(verseNumber) - 1}`}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            &larr; Onceki Ayet
          </Link>
        )}
        <div className="flex-1" />
        <Link
          href={`/verse/${surahId}/${parseInt(verseNumber) + 1}`}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Sonraki Ayet &rarr;
        </Link>
      </div>
    </div>
  );
}
