'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';
import { transliterate, transliterateRoot } from '@/utils/transliteration';
import { useSettings } from '@/context/SettingsContext';


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
  translationTr: string | null;
  root: string;
  rootOccurrenceCount: number;
  rootMeaningTr: string | null;
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

export default function VersePage() {
  const params = useParams();
  const surahId = params.surahId as string;
  const verseNumber = params.verseNumber as string;
  const { settings } = useSettings();

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>(settings.defaultLanguage);

  useEffect(() => {
    if (!surahId || !verseNumber) return;

    setLoading(true);
    fetch(`${API_BASE}/verses/${surahId}/${verseNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setVerse(data.verse);
        setTranslations(data.translations);
        setWords(data.words);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ayet yüklenemedi:', err);
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
    return <div className="text-center py-12">Ayet bulunamadı</div>;
  }

  return (
    <div>
      {/* Başlık - Mobil uyumlu */}
      <div className="mb-6 sm:mb-8">
        <Link
          href={`/surah/${surahId}`}
          className="text-primary-500 hover:text-primary-600 text-sm mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {verse.surahName} Suresine Dön
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-soft-800 dark:text-white">
              {verse.surahName} Suresi, {verseNumber}. Ayet
            </h1>
            <p className="text-soft-400 text-sm">
              {verse.surahId}:{verseNumber}
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-arabic text-soft-700 dark:text-gray-200">
            {verse.surahArabicName}
          </h2>
        </div>
      </div>

      {/* Arapça Metin - Mobil uyumlu */}
      <div className="p-5 sm:p-8 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 mb-6 sm:mb-8 shadow-soft">
        <p className="text-2xl sm:text-3xl font-arabic leading-loose text-soft-800 dark:text-white arabic-text">
          {verse.arabicText}
        </p>
        <p className="text-sm text-soft-400 text-right mt-1">
          {transliterate(verse.arabicText)}
        </p>
      </div>

      {/* İki Sütunlu Layout: Sol - Kelime Kökleri, Sağ - Çeviriler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Sol Sütun - Kelime Kökleri */}
        <div>
          {words.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-4 text-soft-800 dark:text-white flex items-center gap-2">
                <span className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">KELİME KÖKLERİ</span>
              </h3>

              {/* Mobil için kart görünümü, masaüstü için tablo */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 overflow-hidden shadow-soft">
                {/* Masaüstü tablo */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-cream-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-3 text-right text-sm font-medium text-soft-600 dark:text-gray-300 border-r border-soft-200">Kelime</th>
                        <th className="p-3 text-center text-sm font-medium text-soft-600 dark:text-gray-300 border-r border-soft-200">Türkçe</th>
                        <th className="p-3 text-center text-sm font-medium text-soft-600 dark:text-gray-300">Kök</th>
                      </tr>
                    </thead>
                    <tbody>
                      {words.map((word) => (
                        <tr
                          key={word.position}
                          className={`border-b border-soft-100 last:border-b-0 cursor-pointer transition-all duration-200 ${selectedWord?.position === word.position
                            ? 'bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:bg-cream-50 dark:hover:bg-gray-700'
                            }`}
                          onClick={() => setSelectedWord(word)}
                        >
                          {/* Arapça Kelime + Okunuş */}
                          <td className="p-3 border-r border-soft-100 text-right">
                            <div className="text-xl font-arabic text-soft-800 dark:text-white">
                              {word.arabicWord}
                            </div>
                            <div className="text-xs text-soft-400 mt-0.5">
                              {transliterate(word.arabicWord)}
                            </div>
                            {word.lemma && (
                              <div className="text-xs text-soft-500 mt-1 font-arabic">{word.lemma}</div>
                            )}
                          </td>

                          {/* Türkçe Anlam + Kelime Türü */}
                          <td className="p-3 border-r border-soft-100 text-center">
                            <div className="text-sm text-soft-600 dark:text-gray-300">
                              {word.translationTr || word.rootMeaningTr || '-'}
                            </div>
                            {word.partOfSpeech && (
                              <div className="text-xs text-soft-400 italic mt-1">
                                {getPartOfSpeechTr(word.partOfSpeech)}
                              </div>
                            )}
                          </td>

                          {/* Kök + Okunuş */}
                          <td className="p-3 text-center">
                            {word.root ? (
                              <Link
                                href={`/roots/${encodeURIComponent(word.root)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block"
                              >
                                <span className="block text-lg font-arabic text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 transition-colors">
                                  {word.root.split('').join(' ')}
                                </span>
                                <span className="text-xs text-soft-400">
                                  {transliterateRoot(word.root)}
                                </span>
                              </Link>
                            ) : (
                              <span className="text-soft-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil kart görünümü */}
                <div className="sm:hidden divide-y divide-soft-100">
                  {words.map((word) => (
                    <div
                      key={word.position}
                      className={`p-4 cursor-pointer transition-all duration-200 ${selectedWord?.position === word.position
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-cream-50 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => setSelectedWord(word)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-xl font-arabic text-soft-800 dark:text-white text-right">
                            {word.arabicWord}
                          </div>
                          <div className="text-xs text-soft-400 mt-0.5 text-right">
                            {transliterate(word.arabicWord)}
                          </div>
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm text-soft-600 dark:text-gray-300">
                            {word.translationTr || word.rootMeaningTr || '-'}
                          </div>
                          <div className="text-xs text-soft-400 italic">
                            {getPartOfSpeechTr(word.partOfSpeech)}
                          </div>
                        </div>
                        {word.root && (
                          <Link
                            href={`/roots/${encodeURIComponent(word.root)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-center"
                          >
                            <span className="block text-base font-arabic text-primary-600">{word.root}</span>
                            <span className="text-[10px] text-soft-400">{transliterateRoot(word.root)}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seçili Kelime Detayı */}
              {selectedWord && (
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                  <h4 className="font-medium text-primary-700 dark:text-primary-200 mb-3">Kelime Detayı</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-soft-500 mb-1">Kelime</p>
                      <p className="text-xl sm:text-2xl font-arabic text-soft-800">{selectedWord.arabicWord}</p>
                      <p className="text-sm text-soft-400">{transliterate(selectedWord.arabicWord)}</p>
                    </div>
                    {selectedWord.root && (
                      <div>
                        <p className="text-xs text-soft-500 mb-1">Kök</p>
                        <Link
                          href={`/roots/${encodeURIComponent(selectedWord.root)}`}
                          className="text-lg sm:text-xl font-arabic text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          {selectedWord.root}
                        </Link>
                        {selectedWord.rootOccurrenceCount > 0 && (
                          <p className="text-xs text-soft-400">
                            Kuran'da {selectedWord.rootOccurrenceCount} kez
                          </p>
                        )}
                      </div>
                    )}
                    {selectedWord.lemma && (
                      <div>
                        <p className="text-xs text-soft-500 mb-1">Lemma</p>
                        <p className="text-lg sm:text-xl font-arabic text-soft-700">{selectedWord.lemma}</p>
                      </div>
                    )}
                    {selectedWord.partOfSpeech && (
                      <div>
                        <p className="text-xs text-soft-500 mb-1">Kelime Türü</p>
                        <span className="root-badge">{getPartOfSpeechTr(selectedWord.partOfSpeech)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sağ Sütun - Çeviriler */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-medium text-soft-800 dark:text-white">
              Çeviriler ({filteredTranslations.length})
            </h3>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="border border-soft-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            >
              <option value="all">Tüm Diller</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'İngilizce' : lang === 'ar' ? 'Arapça' : lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
            {filteredTranslations.map((t) => (
              <div key={t.translatorCode} className="translation-card">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="font-medium text-soft-800 dark:text-white text-sm sm:text-base">
                    {t.translatorName}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-cream-100 dark:bg-gray-700 text-soft-500 dark:text-gray-300 flex-shrink-0">
                    {t.language === 'tr' ? 'Türkçe' : t.language === 'en' ? 'İngilizce' : t.language === 'ar' ? 'Arapça' : t.language}
                  </span>
                </div>
                <p className="text-soft-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigasyon - Mobil uyumlu */}
      <div className="flex justify-between mt-6 sm:mt-8 pt-6 border-t border-soft-200 dark:border-gray-700">
        {parseInt(verseNumber) > 1 && (
          <Link
            href={`/verse/${surahId}/${parseInt(verseNumber) - 1}`}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 border border-soft-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 dark:hover:bg-gray-700 text-soft-600 hover:text-primary-600 transition-all duration-200 text-sm sm:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Önceki Ayet</span>
            <span className="sm:hidden">Önceki</span>
          </Link>
        )}
        <div className="flex-1" />
        <Link
          href={`/verse/${surahId}/${parseInt(verseNumber) + 1}`}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 border border-soft-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 dark:hover:bg-gray-700 text-soft-600 hover:text-primary-600 transition-all duration-200 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Sonraki Ayet</span>
          <span className="sm:hidden">Sonraki</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
