'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';
import { transliterate, transliterateRoot } from '@/utils/transliteration';

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

// Kelime türünü Türkçe'ye çevir
const getPartOfSpeechTr = (pos: string) => {
  const posMap: { [key: string]: string } = {
    'N': 'İsim',
    'PN': 'Özel İsim',
    'V': 'Fiil',
    'ADJ': 'Sıfat',
    'ADV': 'Zarf',
    'PREP': 'Edat',
    'CONJ': 'Bağlaç',
    'PRON': 'Zamir',
    'DET': 'Belirteç',
    'INTJ': 'Ünlem',
    'REL': 'İlgi',
    'NEG': 'Olumsuzluk',
    'EMPH': 'Vurgu',
    'PART': 'Edat',
    'ACC': 'Yükleme',
    'P': 'Edat',
    'COND': 'Şart',
    'RES': 'Sonuç',
    'SUP': 'Dua',
    'EXH': 'Teşvik',
    'INC': 'Başlangıç',
    'ANS': 'Cevap',
    'AVR': 'Caydırma',
    'CERT': 'Kesinlik',
    'CIRC': 'Durum',
    'COM': 'Birliktelik',
    'EXL': 'Ünlem',
    'EXP': 'Açıklama',
    'FUT': 'Gelecek',
    'IMPV': 'Emir',
    'LOC': 'Yer',
    'T': 'Zaman',
    'VOC': 'Seslenme',
  };
  return posMap[pos] || pos;
};

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
      {/* Başlık - Daha yumuşak ve mobil uyumlu */}
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

      {/* Tercüman Seçimi - Mobil uyumlu */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="font-medium text-soft-600 dark:text-gray-300 text-sm sm:text-base">Meal:</label>
        <select
          value={selectedTranslator}
          onChange={(e) => setSelectedTranslator(e.target.value)}
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
      </div>

      {/* Besmele - Daha yumuşak */}
      {surah.id !== 1 && surah.id !== 9 && (
        <div className="text-center py-6 mb-6 border-b border-soft-200 dark:border-gray-700">
          <p className="text-2xl sm:text-3xl font-arabic text-soft-700 dark:text-gray-200">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayetler - Mobil uyumlu */}
      <div className="space-y-4 sm:space-y-6">
        {verses.map((verse) => (
          <div
            key={verse.id}
            className="p-4 sm:p-6 border border-soft-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-soft-md transition-all duration-200"
          >
            {/* Arapça */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <span className="verse-number flex-shrink-0">{verse.verseNumber}</span>
              <p className="text-xl sm:text-2xl font-arabic leading-loose text-soft-800 dark:text-white arabic-text flex-1">
                {verse.arabicText}
              </p>
            </div>

            {/* Çeviri */}
            {verse.translation && (
              <div className="pl-10 sm:pl-12 border-l-2 border-primary-200">
                <p className="text-soft-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  {verse.translation}
                </p>
                <p className="text-xs text-soft-400 mt-2">{verse.translatorName}</p>
              </div>
            )}

            {/* Kelime Kökleri - Mobil uyumlu grid */}
            {verse.words && verse.words.length > 0 && (
              <div className="mt-4 sm:pl-12">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {verse.words.map((word, idx) => (
                    <div key={idx} className="group relative">
                      {word.root ? (
                        <Link
                          href={`/roots/${encodeURIComponent(word.root)}`}
                          className="inline-flex flex-col items-center px-2 py-1.5 rounded-lg bg-cream-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200 border border-soft-200 dark:border-gray-600 hover:border-primary-300"
                        >
                          <span className="text-base sm:text-lg font-arabic text-soft-700 dark:text-gray-200">{word.arabicWord}</span>
                          <span className="text-[9px] sm:text-[10px] text-soft-400">{transliterate(word.arabicWord)}</span>
                          <span className="text-[9px] sm:text-[10px] text-soft-500 dark:text-gray-400 max-w-[70px] sm:max-w-[80px] truncate">
                            {word.translationTr || word.rootMeaningTr || '-'}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-soft-400 italic">
                            {getPartOfSpeechTr(word.partOfSpeech)}
                          </span>
                          <span className="text-xs text-primary-500 dark:text-primary-400 font-arabic">{word.root}</span>
                          <span className="text-[8px] sm:text-[9px] text-primary-400">{transliterateRoot(word.root)}</span>
                        </Link>
                      ) : (
                        <span className="inline-flex flex-col items-center px-2 py-1.5 rounded-lg bg-cream-50 dark:bg-gray-700 border border-soft-200 dark:border-gray-600">
                          <span className="text-base sm:text-lg font-arabic text-soft-700 dark:text-gray-200">{word.arabicWord}</span>
                          <span className="text-[9px] sm:text-[10px] text-soft-400">{transliterate(word.arabicWord)}</span>
                          <span className="text-[9px] sm:text-[10px] text-soft-500 dark:text-gray-400">
                            {word.translationTr || word.rootMeaningTr || '-'}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-soft-400 italic">
                            {getPartOfSpeechTr(word.partOfSpeech)}
                          </span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detay Linki */}
            <div className="mt-4 sm:pl-12">
              <Link
                href={`/verse/${surah.id}/${verse.verseNumber}`}
                className="text-sm text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors"
              >
                Tüm çeviriler
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigasyon - Mobil uyumlu */}
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
