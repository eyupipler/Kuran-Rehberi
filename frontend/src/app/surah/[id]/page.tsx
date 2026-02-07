'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  totalVerses: number;
}

interface Verse {
  id: number;
  verseNumber: number;
  arabicText: string;
  translation?: string;
  translatorName?: string;
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

  // Tercumanlari yukle
  useEffect(() => {
    fetch('/api/search/translators')
      .then((res) => res.json())
      .then((data) => setTranslators(data))
      .catch(console.error);
  }, []);

  // Sure ve ayetleri yukle
  useEffect(() => {
    if (!surahId) return;

    setLoading(true);
    fetch(`/api/surahs/${surahId}/verses?translator=${selectedTranslator}`)
      .then((res) => res.json())
      .then((data) => {
        setSurah(data.surah);
        setVerses(data.verses);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Sure yuklenemedi:', err);
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
    return <div className="text-center py-12">Sure bulunamadi</div>;
  }

  return (
    <div>
      {/* Baslik */}
      <div className="mb-8 text-center">
        <Link href="/" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
          &larr; Surelere Don
        </Link>
        <h1 className="text-4xl font-arabic text-gray-900 dark:text-white mb-2">
          {surah.arabicName}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          {surah.id}. {surah.name}
        </h2>
        <p className="text-gray-500 mt-2">{surah.totalVerses} ayet</p>
      </div>

      {/* Tercuman Secimi */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="font-medium text-gray-700 dark:text-gray-300">Meal:</label>
        <select
          value={selectedTranslator}
          onChange={(e) => setSelectedTranslator(e.target.value)}
          className="border rounded-md px-4 py-2 bg-white dark:bg-gray-700 min-w-[250px]"
        >
          <optgroup label="Turkce">
            {translators
              .filter((t) => t.language === 'tr')
              .map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Ingilizce">
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
            {/* Arapca */}
            <div className="flex items-start gap-4 mb-4">
              <span className="verse-number flex-shrink-0">{verse.verseNumber}</span>
              <p className="text-2xl font-arabic leading-loose text-gray-900 dark:text-white arabic-text flex-1">
                {verse.arabicText}
              </p>
            </div>

            {/* Ceviri */}
            {verse.translation && (
              <div className="pl-12 border-l-2 border-primary-200">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {verse.translation}
                </p>
                <p className="text-xs text-gray-400 mt-2">{verse.translatorName}</p>
              </div>
            )}

            {/* Detay Linki */}
            <div className="mt-4 pl-12">
              <Link
                href={`/verse/${surah.id}/${verse.verseNumber}`}
                className="text-sm text-primary-600 hover:underline"
              >
                Kelime analizi ve diger ceviriler &rarr;
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
            &larr; Onceki Sure
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
