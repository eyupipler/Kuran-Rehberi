'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';

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

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('tr');

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
      {/* Başlık */}
      <div className="mb-8">
        <Link
          href={`/surah/${surahId}`}
          className="text-primary-600 hover:underline text-sm mb-4 inline-block"
        >
          &larr; {verse.surahName} Suresine Dön
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

      {/* Arapça Metin */}
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg border mb-8">
        <p className="text-3xl font-arabic leading-loose text-gray-900 dark:text-white arabic-text">
          {verse.arabicText}
        </p>
      </div>

      {/* İki Sütunlu Layout: Sol - Kelime Kökleri, Sağ - Çeviriler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Sütun - Kelime Kökleri */}
        <div>
          {words.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">KELİME KÖKLERİ</span>
              </h3>

              <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {words.map((word) => (
                      <tr
                        key={word.position}
                        className={`border-b last:border-b-0 cursor-pointer transition-colors ${
                          selectedWord?.position === word.position
                            ? 'bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedWord(word)}
                      >
                        {/* Arapça Kelime */}
                        <td className="p-3 border-r">
                          <div className="text-xl font-arabic text-gray-900 dark:text-white">
                            {word.arabicWord}
                          </div>
                          {word.lemma && (
                            <div className="text-xs text-gray-500 mt-1">{word.lemma}</div>
                          )}
                        </td>

                        {/* Kelime Türü ve Türkçe Anlam */}
                        <td className="p-3 border-r">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {word.partOfSpeech && getPartOfSpeechTr(word.partOfSpeech)}
                          </div>
                          {(word.translationTr || word.rootMeaningTr) && (
                            <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                              {word.translationTr || word.rootMeaningTr}
                            </div>
                          )}
                        </td>

                        {/* Kök */}
                        <td className="p-3 text-right">
                          {word.root ? (
                            <Link
                              href={`/roots/${encodeURIComponent(word.root)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-block px-3 py-1 rounded-lg text-base font-arabic bg-primary-100 text-primary-700 hover:bg-primary-600 hover:text-white transition-colors border border-primary-300 hover:border-primary-600"
                            >
                              {word.root}
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-base font-arabic">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Seçili Kelime Detayı */}
              {selectedWord && (
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200">
                  <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-3">Kelime Detayı</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Kelime</p>
                      <p className="text-2xl font-arabic">{selectedWord.arabicWord}</p>
                    </div>
                    {selectedWord.root && (
                      <div>
                        <p className="text-sm text-gray-500">Kök</p>
                        <Link
                          href={`/roots/${encodeURIComponent(selectedWord.root)}`}
                          className="text-xl font-arabic text-primary-600 hover:underline"
                        >
                          {selectedWord.root}
                        </Link>
                        {selectedWord.rootOccurrenceCount > 0 && (
                          <p className="text-xs text-gray-400">
                            Kuran'da {selectedWord.rootOccurrenceCount} kez
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
                        <p className="text-sm text-gray-500">Kelime Türü</p>
                        <p className="root-badge">{getPartOfSpeechTr(selectedWord.partOfSpeech)}</p>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Çeviriler ({filteredTranslations.length})
            </h3>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700"
            >
              <option value="all">Tüm Diller</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'İngilizce' : lang === 'ar' ? 'Arapça' : lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredTranslations.map((t) => (
              <div key={t.translatorCode} className="translation-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t.translatorName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {t.language === 'tr' ? 'Türkçe' : t.language === 'en' ? 'İngilizce' : t.language === 'ar' ? 'Arapça' : t.language}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        {parseInt(verseNumber) > 1 && (
          <Link
            href={`/verse/${surahId}/${parseInt(verseNumber) - 1}`}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            &larr; Önceki Ayet
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
