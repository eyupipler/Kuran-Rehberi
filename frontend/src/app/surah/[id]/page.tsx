'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';
import { transliterate } from '@/utils/transliteration';
import { useSettings } from '@/context/SettingsContext';

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
  const { settings, updateTranslator } = useSettings();

  const [surah, setSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [selectedTranslator, setSelectedTranslator] = useState(settings.defaultTranslator);
  const [loading, setLoading] = useState(true);
  const [onlyMeal, setOnlyMeal] = useState(false);

  // Settings değiştiğinde selectedTranslator'ı güncelle
  useEffect(() => {
    setSelectedTranslator(settings.defaultTranslator);
  }, [settings.defaultTranslator]);

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

  const handleTranslatorChange = (translator: string) => {
    setSelectedTranslator(translator);
    updateTranslator(translator);
  };

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
      <div className="mb-6 sm:mb-8 text-center">
        <Link href="/" className="text-primary-500 hover:text-primary-600 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Surelere Dön
        </Link>
        <h1 className="text-3xl sm:text-4xl font-arabic text-soft-800 dark:text-white mb-2">
          {surah.arabicName}
        </h1>
        <h2 className="text-xl sm:text-2xl font-medium text-soft-600 dark:text-gray-300">
          {surah.id}. {surah.name}
        </h2>
        <p className="text-soft-400 mt-2 text-sm">{surah.totalVerses} ayet</p>
      </div>

      {/* Tercüman Seçimi */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="font-medium text-soft-600 dark:text-gray-300 text-sm sm:text-base">Meal:</label>
        <select
          value={selectedTranslator}
          onChange={(e) => handleTranslatorChange(e.target.value)}
          className="border border-soft-200 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-soft-700 w-full sm:w-auto sm:min-w-[280px] focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
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
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyMeal}
            onChange={(e) => setOnlyMeal(e.target.checked)}
            className="w-4 h-4 rounded border-soft-300 text-primary-500 focus:ring-primary-200 transition-all"
          />
          <span className="text-sm text-soft-600 dark:text-gray-300">Sadece meal</span>
        </label>
      </div>

      {/* Besmele */}
      {surah.id !== 1 && surah.id !== 9 && (
        <div className="text-center py-6 mb-6 border-b border-soft-200 dark:border-gray-700">
          <p className="text-2xl sm:text-3xl font-arabic text-soft-700 dark:text-gray-200">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-sm text-soft-400 mt-1">
            {transliterate('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')}
          </p>
        </div>
      )}

      {/* Ayetler */}
      <div className={onlyMeal ? 'space-y-3' : 'space-y-4 sm:space-y-6'}>
        {verses.map((verse) => (
          <div
            key={verse.id}
            className={onlyMeal
              ? 'p-3 sm:p-4 border border-soft-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800'
              : 'p-4 sm:p-6 border border-soft-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-soft-md transition-all duration-200'
            }
          >
            {onlyMeal ? (
              /* Sadece Meal Modu */
              <Link href={`/verse/${surah.id}/${verse.verseNumber}`} className="block">
                <div className="flex gap-2 sm:gap-3">
                  <span className="verse-number flex-shrink-0">{verse.verseNumber}</span>
                  <p className="text-soft-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base flex-1">
                    {verse.translation}
                  </p>
                </div>
              </Link>
            ) : (
              /* Normal Mod */
              <>
                {/* Arapça */}
                <div className="flex items-start gap-3 sm:gap-4 mb-2">
                  <span className="verse-number flex-shrink-0">{verse.verseNumber}</span>
                  <div className="flex-1">
                    <p className="text-xl sm:text-2xl font-arabic leading-loose text-soft-800 dark:text-white arabic-text">
                      {verse.arabicText}
                    </p>
                    <p className="text-xs text-soft-400 text-right mt-0.5">
                      {transliterate(verse.arabicText)}
                    </p>
                  </div>
                </div>

                {/* Çeviri */}
                {verse.translation && (
                  <div className="pl-10 sm:pl-12 border-l-2 border-primary-200 mt-3">
                    <p className="text-soft-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                      {verse.translation}
                    </p>
                    <p className="text-xs text-soft-400 mt-2">{verse.translatorName}</p>
                  </div>
                )}

                {/* Detay Linki */}
                <div className="mt-4 pl-10 sm:pl-12">
                  <Link
                    href={`/verse/${surah.id}/${verse.verseNumber}`}
                    className="text-sm text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors"
                  >
                    Tüm çeviriler ve kelime analizi
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Navigasyon */}
      <div className="flex justify-between mt-6 sm:mt-8 pt-6 border-t border-soft-200 dark:border-gray-700">
        {surah.id > 1 && (
          <Link
            href={`/surah/${surah.id - 1}`}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 border border-soft-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 dark:hover:bg-gray-700 text-soft-600 hover:text-primary-600 transition-all duration-200 text-sm sm:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Önceki Sure</span>
            <span className="sm:hidden">Önceki</span>
          </Link>
        )}
        <div className="flex-1" />
        {surah.id < 114 && (
          <Link
            href={`/surah/${surah.id + 1}`}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 border border-soft-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 dark:hover:bg-gray-700 text-soft-600 hover:text-primary-600 transition-all duration-200 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Sonraki Sure</span>
            <span className="sm:hidden">Sonraki</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
