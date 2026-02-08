'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  totalVerses: number;
}

interface Word {
  arabicWord: string;
  position: number;
  partOfSpeech: string;
  lemma: string;
  translationTr: string | null;
  root: string | null;
  rootLatin: string | null;
  rootMeaningTr: string | null;
}

interface Verse {
  id: number;
  verseNumber: number;
  arabicText: string;
  translation?: string;
  translatorName?: string;
  words?: Word[];
}

interface Translator {
  code: string;
  name: string;
  language: string;
}

export default function SurahPage() {
  const params = useParams();
  const surahId = params.id as string;

  const [surah, setSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [selectedTranslator, setSelectedTranslator] = useState('tr.diyanet');
  const [loading, setLoading] = useState(true);

  // Tercümanları yükle
  useEffect(() => {
    fetch(`${API_BASE}/search/translators`)
      .then((res) => res.json())
      .then((data) => setTranslators(data))
      .catch(console.error);
  }, []);

  // Sure ve ayetleri yükle
  useEffect(() => {
    if (!surahId) return;

    setLoading(true);
    fetch(`${API_BASE}/surahs/${surahId}/verses?translator=${selectedTranslator}`)
      .then((res) => res.json())
      .then((data) => {
        setSurah(data.surah);
        setVerses(data.verses);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Sure yüklenemedi:', err);
        setLoading(false);
      });
  }, [surahId, selectedTranslator]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!surah) {
    return <div className="text-center py-12">Sure bulunamadı</div>;
  }

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8 text-center">
        <Link href="/" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
          &larr; Surelere Dön
        </Link>
        <h1 className="text-4xl font-arabic text-gray-900 dark:text-white mb-2">
          {surah.arabicName}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          {surah.id}. {surah.name}
        </h2>
        <p className="text-gray-500 mt-2">{surah.totalVerses} ayet</p>
      </div>

      {/* Tercüman Seçimi */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="font-medium text-gray-700 dark:text-gray-300">Meal:</label>
        <select
          value={selectedTranslator}
          onChange={(e) => setSelectedTranslator(e.target.value)}
          className="border rounded-md px-4 py-2 bg-white dark:bg-gray-700 min-w-[250px]"
        >
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
      </div>

      {/* Besmele */}
      {surah.id !== 1 && surah.id !== 9 && (
        <div className="text-center py-6 mb-6 border-b">
          <p className="text-3xl font-arabic text-gray-800 dark:text-gray-200">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayetler */}
      <div className="space-y-6">
        {verses.map((verse) => (
          <div
            key={verse.id}
            className="p-6 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
          >
            {/* Arapça */}
            <div className="flex items-start gap-4 mb-4">
              <span className="verse-number flex-shrink-0">{verse.verseNumber}</span>
              <p className="text-2xl font-arabic leading-loose text-gray-900 dark:text-white arabic-text flex-1">
                {verse.arabicText}
              </p>
            </div>

            {/* Çeviri */}
            {verse.translation && (
              <div className="pl-12 border-l-2 border-primary-200">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {verse.translation}
                </p>
                <p className="text-xs text-gray-400 mt-2">{verse.translatorName}</p>
              </div>
            )}

            {/* Kelime Kökleri */}
            {verse.words && verse.words.length > 0 && (
              <div className="mt-4 pl-12">
                <div className="flex flex-wrap gap-2">
                  {verse.words.map((word, idx) => (
                    <div key={idx} className="group relative">
                      {word.root ? (
                        <Link
                          href={`/roots/${encodeURIComponent(word.root)}`}
                          className="inline-flex flex-col items-center px-2 py-1 rounded bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors border border-gray-200 dark:border-gray-600 hover:border-primary-300"
                        >
                          <span className="text-lg font-arabic text-gray-800 dark:text-gray-200">{word.arabicWord}</span>
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-arabic">{word.root}</span>
                          {(word.translationTr || word.rootMeaningTr) && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[80px] truncate">
                              {word.translationTr || word.rootMeaningTr}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <span className="inline-flex flex-col items-center px-2 py-1 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                          <span className="text-lg font-arabic text-gray-800 dark:text-gray-200">{word.arabicWord}</span>
                          <span className="text-xs text-gray-400">-</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detay Linki */}
            <div className="mt-4 pl-12">
              <Link
                href={`/verse/${surah.id}/${verse.verseNumber}`}
                className="text-sm text-primary-600 hover:underline"
              >
                Tüm çeviriler &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigasyon */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        {surah.id > 1 && (
          <Link
            href={`/surah/${surah.id - 1}`}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            &larr; Önceki Sure
          </Link>
        )}
        <div className="flex-1" />
        {surah.id < 114 && (
          <Link
            href={`/surah/${surah.id + 1}`}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Sonraki Sure &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
