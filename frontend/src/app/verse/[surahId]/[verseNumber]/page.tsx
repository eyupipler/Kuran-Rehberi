'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';
import { transliterate, transliterateRoot } from '@/utils/transliteration';
import { useSettings } from '@/context/SettingsContext';
import { useFavorites } from '@/context/FavoritesContext';

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

interface CompareData {
  verse: VerseData;
  translations: Translation[];
  words: Word[];
}

interface CompareSurah {
  id: number;
  name: string;
  totalVerses: number;
}

interface CompareVerseItem {
  verseNumber: number;
  arabicText: string;
  translation?: string;
}

const getPartOfSpeechTr = (pos: string) => {
  const posMap: { [key: string]: string } = {
    'N': 'İsim', 'PN': 'Özel İsim', 'V': 'Fiil', 'ADJ': 'Sıfat', 'ADV': 'Zarf',
    'PREP': 'Edat', 'CONJ': 'Bağlaç', 'PRON': 'Zamir', 'DET': 'Belirteç',
    'INTJ': 'Ünlem', 'REL': 'İlgi', 'NEG': 'Olumsuzluk', 'EMPH': 'Vurgu',
    'PART': 'Edat', 'ACC': 'Yükleme', 'P': 'Edat', 'COND': 'Şart',
    'RES': 'Sonuç', 'SUP': 'Dua', 'EXH': 'Teşvik', 'INC': 'Başlangıç',
    'ANS': 'Cevap', 'AVR': 'Caydırma', 'CERT': 'Kesinlik', 'CIRC': 'Durum',
    'COM': 'Birliktelik', 'EXL': 'Ünlem', 'EXP': 'Açıklama', 'FUT': 'Gelecek',
    'IMPV': 'Emir', 'LOC': 'Yer', 'T': 'Zaman', 'VOC': 'Seslenme',
  };
  return posMap[pos] || pos;
};

/* ─── Karşılaştırma paneli ─────────────────────────────────── */
function CompareVersePanel({
  verse,
  translations,
  label,
  onClear,
}: {
  verse: VerseData;
  translations: Translation[];
  label: string;
  onClear?: () => void;
}) {
  const trList = translations.filter((t) => t.language === 'tr');
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">{label}</span>
          <p className="text-sm font-medium text-soft-700 dark:text-gray-200 mt-0.5">
            {verse.surahName} Suresi — {verse.surahId}:{verse.verseNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/verse/${verse.surahId}/${verse.verseNumber}`}
            className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
            target="_blank"
          >
            Sayfaya git ↗
          </Link>
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-soft-400 hover:text-red-400 transition-colors border border-soft-200 dark:border-gray-600 rounded px-2 py-0.5"
            >
              Değiştir
            </button>
          )}
        </div>
      </div>

      {/* Arapça */}
      <div className="bg-soft-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 flex-shrink-0">
        <p className="font-arabic text-xl sm:text-2xl leading-loose text-soft-800 dark:text-white text-right arabic-text">
          {verse.arabicText}
        </p>
        <p className="text-xs text-soft-400 text-right mt-1">
          {transliterate(verse.arabicText)}
        </p>
      </div>

      {/* Çeviriler */}
      <div
        className="flex-1 overflow-y-auto space-y-2.5 pr-1"
        style={{ maxHeight: '42vh', scrollbarWidth: 'thin' }}
      >
        {trList.map((t) => (
          <div key={t.translatorCode} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-soft-100 dark:border-gray-700">
            <p className="text-xs font-medium text-soft-500 dark:text-gray-400 mb-1">{t.translatorName}</p>
            <p className="text-sm text-soft-700 dark:text-gray-200 leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Ana bileşen ───────────────────────────────────────────── */
export default function VersePage() {
  const params = useParams();
  const surahId = params.surahId as string;
  const verseNumber = params.verseNumber as string;
  const { settings } = useSettings();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>(settings.defaultLanguage);

  // Karşılaştırma
  const [compareMode, setCompareMode] = useState(false);
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareSurahs, setCompareSurahs] = useState<CompareSurah[]>([]);
  const [compareSelectedSurah, setCompareSelectedSurah] = useState<CompareSurah | null>(null);
  const [compareVerses, setCompareVerses] = useState<CompareVerseItem[]>([]);
  const [compareVersesLoading, setCompareVersesLoading] = useState(false);
  const [compareSurahSearch, setCompareSurahSearch] = useState('');

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

  // Karşılaştırma modu açıldığında sureleri yükle
  useEffect(() => {
    if (compareMode && compareSurahs.length === 0) {
      fetch(`${API_BASE}/surahs`)
        .then((res) => res.json())
        .then((data) => setCompareSurahs(data))
        .catch(console.error);
    }
  }, [compareMode]);

  const selectCompareSurah = async (surah: CompareSurah) => {
    setCompareSelectedSurah(surah);
    setCompareVersesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/surahs/${surah.id}/verses?translator=diyanet`);
      const data = await res.json();
      setCompareVerses(data.verses.map((v: { verseNumber: number; arabicText: string; translation?: string }) => ({
        verseNumber: v.verseNumber,
        arabicText: v.arabicText,
        translation: v.translation,
      })));
    } catch {
      setCompareVerses([]);
    }
    setCompareVersesLoading(false);
  };

  const selectCompareVerse = async (verseNum: number) => {
    if (!compareSelectedSurah) return;
    setCompareLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verses/${compareSelectedSurah.id}/${verseNum}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCompareData({ verse: data.verse, translations: data.translations, words: data.words });
    } catch {
      // ignore
    }
    setCompareLoading(false);
  };

  const resetCompare = () => {
    setCompareData(null);
    setCompareSelectedSurah(null);
    setCompareVerses([]);
    setCompareSurahSearch('');
  };

  const filteredTranslations = translations.filter(
    (t) => languageFilter === 'all' || t.language === languageFilter
  );
  const languages = [...new Set(translations.map((t) => t.language))];

  const favorited = verse ? isFavorite(verse.surahId, verse.verseNumber) : false;

  const toggleFavorite = () => {
    if (!verse) return;
    if (favorited) {
      removeFavorite(`${verse.surahId}:${verse.verseNumber}`);
    } else {
      const trTrans = translations.find((t) => t.language === 'tr');
      addFavorite({
        surahId: verse.surahId,
        verseNumber: verse.verseNumber,
        surahName: verse.surahName,
        arabicText: verse.arabicText,
        translation: trTrans?.text || '',
      });
    }
  };

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
      {/* ── Başlık ── */}
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

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-soft-800 dark:text-white">
              {verse.surahName} Suresi, {verseNumber}. Ayet
            </h1>
            <p className="text-soft-400 text-sm mt-0.5">{verse.surahId}:{verseNumber}</p>
          </div>

          {/* Aksiyon butonları */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Favorilere ekle */}
            <button
              onClick={toggleFavorite}
              title={favorited ? 'Favoriden kaldır' : 'Favorilere ekle'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                favorited
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400'
                  : 'border-soft-200 dark:border-gray-600 text-soft-500 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500'
              }`}
            >
              <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="hidden sm:inline">{favorited ? 'Favoride' : 'Favorile'}</span>
            </button>

            {/* Karşılaştır */}
            <button
              onClick={() => { if (compareMode) { setCompareMode(false); resetCompare(); } else { setCompareMode(true); } }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                compareMode
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-soft-200 dark:border-gray-600 text-soft-500 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="hidden sm:inline">Karşılaştır</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Arapça Metin ── */}
      <div className="p-5 sm:p-8 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 mb-6 sm:mb-8 shadow-soft">
        <p className="text-2xl sm:text-3xl font-arabic leading-loose text-soft-800 dark:text-white arabic-text">
          {verse.arabicText}
        </p>
        <p className="text-sm text-soft-400 text-right mt-1">
          {transliterate(verse.arabicText)}
        </p>
      </div>

      {/* ── Karşılaştırma Paneli ── */}
      {compareMode && (
        <div className="mb-8 rounded-xl border-2 border-primary-300 dark:border-primary-700 overflow-hidden shadow-soft-md">
          {/* Panel başlık */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-50 dark:bg-primary-900/30 border-b border-primary-200 dark:border-primary-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold text-sm text-primary-700 dark:text-primary-300">Ayet Karşılaştırma</span>
            </div>
            <button
              onClick={() => { setCompareMode(false); resetCompare(); }}
              className="p-1 rounded text-soft-400 hover:text-soft-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* İki panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-soft-200 dark:divide-gray-700">
            {/* Sol: Mevcut ayet */}
            <div className="p-5">
              <CompareVersePanel
                verse={verse}
                translations={translations}
                label="Mevcut Ayet"
              />
            </div>

            {/* Sağ: Karşılaştırma ayeti */}
            <div className="p-5 flex flex-col" style={{ minHeight: '400px' }}>
              {compareLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : compareData ? (
                <CompareVersePanel
                  verse={compareData.verse}
                  translations={compareData.translations}
                  label="Karşılaştırılan Ayet"
                  onClear={resetCompare}
                />
              ) : compareSelectedSurah ? (
                /* Ayet seçimi */
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                    <button
                      onClick={() => { setCompareSelectedSurah(null); setCompareVerses([]); }}
                      className="p-1.5 rounded-lg text-soft-400 hover:text-soft-700 dark:hover:text-gray-300 hover:bg-soft-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-soft-500 dark:text-gray-400 uppercase tracking-wide">Ayet Seç</p>
                      <p className="text-sm font-medium text-soft-700 dark:text-gray-200">{compareSelectedSurah.name} Suresi</p>
                    </div>
                  </div>
                  {compareVersesLoading ? (
                    <div className="flex items-center justify-center flex-1">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <div className="overflow-y-auto flex-1 rounded-xl border border-soft-200 dark:border-gray-700" style={{ maxHeight: '52vh', scrollbarWidth: 'thin' }}>
                      {compareVerses.map((v) => (
                        <button
                          key={v.verseNumber}
                          onClick={() => selectCompareVerse(v.verseNumber)}
                          className="w-full text-left px-3 py-2.5 border-b border-soft-100 dark:border-gray-700 last:border-b-0 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-2.5"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-medium flex items-center justify-center mt-0.5">
                            {v.verseNumber}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-arabic text-soft-600 dark:text-gray-300 text-right leading-relaxed line-clamp-2">
                              {v.arabicText}
                            </p>
                            {v.translation && (
                              <p className="text-xs text-soft-400 dark:text-gray-500 mt-0.5 line-clamp-1">{v.translation}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Sure seçimi */
                <div className="flex flex-col h-full">
                  <p className="text-xs font-semibold text-soft-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex-shrink-0">
                    Sure Seç
                  </p>
                  <input
                    type="text"
                    placeholder="Sure ara..."
                    value={compareSurahSearch}
                    onChange={(e) => setCompareSurahSearch(e.target.value)}
                    className="mb-2 flex-shrink-0 border border-soft-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:outline-none"
                  />
                  <div className="overflow-y-auto flex-1 rounded-xl border border-soft-200 dark:border-gray-700" style={{ maxHeight: '52vh', scrollbarWidth: 'thin' }}>
                    {compareSurahs
                      .filter((s) =>
                        !compareSurahSearch ||
                        s.name.toLowerCase().includes(compareSurahSearch.toLowerCase()) ||
                        String(s.id).includes(compareSurahSearch)
                      )
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => selectCompareSurah(s)}
                          className="w-full text-left px-3 py-2 border-b border-soft-100 dark:border-gray-700 last:border-b-0 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                        >
                          <span className="flex-shrink-0 text-xs text-soft-400 dark:text-gray-500 w-6 text-right">{s.id}</span>
                          <span className="flex-1 text-sm font-medium text-soft-700 dark:text-gray-200">{s.name} Suresi</span>
                          <span className="text-xs text-soft-400 dark:text-gray-500 flex-shrink-0">{s.totalVerses} ayet</span>
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Çeviriler + Kelime Kökleri ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 sm:gap-8 lg:items-start">
        {/* Sol Sütun - Çeviriler */}
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-medium text-soft-800 dark:text-white">
              Çeviriler ({filteredTranslations.length})
            </h3>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="border border-soft-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            >
              <option value="all">Tüm Diller</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'İngilizce' : lang === 'ar' ? 'Arapça' : lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2" style={{ maxHeight: '62vh', scrollbarWidth: 'thin' }}>
            {filteredTranslations.map((t) => (
              <div key={t.translatorCode} className="translation-card">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="font-medium text-soft-800 dark:text-white text-sm sm:text-base">{t.translatorName}</span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-cream-100 dark:bg-gray-700 text-soft-500 dark:text-gray-300 flex-shrink-0">
                    {t.language === 'tr' ? 'Türkçe' : t.language === 'en' ? 'İngilizce' : t.language === 'ar' ? 'Arapça' : t.language}
                  </span>
                </div>
                <p className="text-soft-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Sütun - Kelime Kökleri */}
        <div className="flex flex-col">
          {words.length > 0 && (
            <>
              <h3 className="text-base sm:text-lg font-medium mb-4 text-soft-800 dark:text-white flex items-center gap-2 flex-shrink-0">
                <span className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">KELİME KÖKLERİ</span>
              </h3>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 shadow-soft overflow-y-auto" style={{ maxHeight: '62vh', scrollbarWidth: 'thin' }}>
                {/* Masaüstü tablo */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-cream-100 dark:bg-gray-700 sticky top-0">
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
                          className={`border-b border-soft-100 last:border-b-0 cursor-pointer transition-all duration-200 ${
                            selectedWord?.position === word.position
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:bg-cream-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedWord(selectedWord?.position === word.position ? null : word)}
                        >
                          <td className="p-3 border-r border-soft-100 text-right">
                            <div className="text-xl font-arabic text-soft-800 dark:text-white">{word.arabicWord}</div>
                            <div className="text-xs text-soft-400 mt-0.5">{transliterate(word.arabicWord)}</div>
                            {word.lemma && <div className="text-xs text-soft-500 mt-1 font-arabic">{word.lemma}</div>}
                          </td>
                          <td className="p-3 border-r border-soft-100 text-center">
                            <div className="text-sm text-soft-600 dark:text-gray-300">{word.translationTr || word.rootMeaningTr || '-'}</div>
                            {word.partOfSpeech && (
                              <div className="text-xs text-soft-400 italic mt-1">{getPartOfSpeechTr(word.partOfSpeech)}</div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {word.root ? (
                              <a href={`/roots/${encodeURIComponent(word.root)}/`} onClick={(e) => e.stopPropagation()} className="inline-block">
                                <span className="block text-lg font-arabic text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                                  {word.root.split('').join(' ')}
                                </span>
                                <span className="text-xs text-soft-400">{transliterateRoot(word.root)}</span>
                              </a>
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
                      className={`p-4 cursor-pointer transition-all duration-200 ${
                        selectedWord?.position === word.position
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-cream-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedWord(selectedWord?.position === word.position ? null : word)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-xl font-arabic text-soft-800 dark:text-white text-right">{word.arabicWord}</div>
                          <div className="text-xs text-soft-400 mt-0.5 text-right">{transliterate(word.arabicWord)}</div>
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm text-soft-600 dark:text-gray-300">{word.translationTr || word.rootMeaningTr || '-'}</div>
                          <div className="text-xs text-soft-400 italic">{getPartOfSpeechTr(word.partOfSpeech)}</div>
                        </div>
                        {word.root && (
                          <a href={`/roots/${encodeURIComponent(word.root)}/`} onClick={(e) => e.stopPropagation()} className="text-center">
                            <span className="block text-base font-arabic text-primary-600">{word.root}</span>
                            <span className="text-[10px] text-soft-400">{transliterateRoot(word.root)}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seçili Kelime Detayı */}
              {selectedWord && (
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 flex-shrink-0">
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
                        <a href={`/roots/${encodeURIComponent(selectedWord.root)}/`} className="text-lg sm:text-xl font-arabic text-primary-600 hover:text-primary-700 transition-colors">
                          {selectedWord.root}
                        </a>
                        {selectedWord.rootOccurrenceCount > 0 && (
                          <p className="text-xs text-soft-400">Kuran'da {selectedWord.rootOccurrenceCount} kez</p>
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
            </>
          )}
        </div>
      </div>

      {/* ── Navigasyon ── */}
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
