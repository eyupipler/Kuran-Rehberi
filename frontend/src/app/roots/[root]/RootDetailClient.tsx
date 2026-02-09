'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/config';
import { transliterate, transliterateRoot } from '@/utils/transliteration';

interface RootInfo {
  id: number;
  root: string;
  rootLatin: string;
  meaningTr: string;
  meaningEn: string;
  occurrenceCount: number;
}

interface Occurrence {
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
  word: string;
  wordPosition: number;
  lemma: string;
  partOfSpeech: string;
  translationTr: string | null;
}

interface DerivedForm {
  word: string;
  lemma: string;
  partOfSpeech: string;
  count: number;
}

interface Distribution {
  surahId: number;
  surahName: string;
  count: number;
}

// Kelime türünü Türkçe'ye çevir
const getPartOfSpeechTr = (pos: string) => {
  const posMap: { [key: string]: string } = {
    'N': 'İsim',
    'PN': 'Özel İsim',
    'V': 'Fiil',
    'ADJ': 'Sıfat',
    'ADV': 'Zarf',
    'P': 'Edat',
    'PREP': 'Edat',
    'CONJ': 'Bağlaç',
    'PRON': 'Zamir',
    'DET': 'Belirteç',
    'INTJ': 'Ünlem',
    'REL': 'İlgi Zamiri',
    'NEG': 'Olumsuzluk',
    'EMPH': 'Vurgu',
    'PART': 'Edat',
    'ACC': 'Belirtme',
    'COND': 'Şart',
    'ANS': 'Cevap',
    'RES': 'Sonuç',
    'SUP': 'Dua',
    'PRO': 'Zamir',
    'INL': 'Başlangıç',
    'SUB': 'Alt',
    'EXP': 'Açıklama',
    'SUR': 'Şaşırma',
    'EXH': 'Teşvik',
    'INC': 'Başlangıç',
    'INT': 'Soru',
    'VOC': 'Seslenme',
    'PREV': 'Önleme',
    'CIRC': 'Durum',
    'COM': 'Birliktelik',
    'EQ': 'Eşitlik',
    'REM': 'Hatırlatma',
    'RSLT': 'Sonuç',
    'RETRACT': 'Geri Çekme',
    'AMD': 'Düzeltme',
  };
  return posMap[pos] || pos;
};

interface Props {
  rootParam: string;
}

export default function RootDetailClient({ rootParam }: Props) {
  const [rootInfo, setRootInfo] = useState<RootInfo | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [derivedForms, setDerivedForms] = useState<DerivedForm[]>([]);
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'occurrences' | 'forms' | 'distribution'>(
    'occurrences'
  );
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!rootParam) return;

    setLoading(true);
    setError(null);

    // URL'den gelen parametreyi decode et
    const decodedRoot = decodeURIComponent(rootParam);

    fetch(`${API_BASE}/roots/${encodeURIComponent(decodedRoot)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Kök bulunamadı');
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setRootInfo(data.root);
        setOccurrences(data.occurrences || []);
        setDerivedForms(data.derivedForms || []);
        setDistribution(data.distribution || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Kök yüklenemedi:', err);
        setError('Kök bulunamadı veya bir hata oluştu');
        setLoading(false);
      });
  }, [rootParam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-primary-500"></div>
      </div>
    );
  }

  if (error || !rootInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-soft-500 mb-4">{error || 'Kök bulunamadı'}</p>
        <Link href="/roots" className="text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kelime Köklerine Dön
        </Link>
      </div>
    );
  }

  const displayedOccurrences = showAll ? occurrences : occurrences.slice(0, 50);

  return (
    <div>
      {/* Başlık - Mobil uyumlu ve yumuşak */}
      <div className="mb-6 sm:mb-8">
        <Link href="/roots" className="text-primary-500 hover:text-primary-600 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kelime Köklerine Dön
        </Link>

        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl border border-soft-200 dark:border-gray-700 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-arabic text-soft-800 dark:text-white mb-1">
                {rootInfo.root}
              </h1>
              <p className="text-soft-500 text-base sm:text-lg">
                {transliterateRoot(rootInfo.root)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-semibold text-primary-500">
                {rootInfo.occurrenceCount}
              </span>
              <p className="text-sm text-soft-400">kez geçmektedir</p>
            </div>
          </div>

          {(rootInfo.meaningTr || rootInfo.meaningEn) && (
            <div className="pt-4 border-t border-soft-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-soft-500 mb-1">Anlam</h3>
              {rootInfo.meaningTr && (
                <p className="text-base sm:text-lg text-primary-600 dark:text-primary-400 font-medium">{rootInfo.meaningTr}</p>
              )}
              {rootInfo.meaningEn && (
                <p className="text-soft-500 dark:text-gray-400 text-sm mt-1">
                  {rootInfo.meaningEn}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Menüsü - Mobil uyumlu */}
      <div className="border-b border-soft-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <nav className="flex gap-1 sm:gap-2 min-w-max">
          <button
            onClick={() => setActiveTab('occurrences')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'occurrences'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-soft-500 hover:text-soft-700'
            }`}
          >
            Geçişler ({occurrences.length})
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'forms'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-soft-500 hover:text-soft-700'
            }`}
          >
            Formlar ({derivedForms.length})
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'distribution'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-soft-500 hover:text-soft-700'
            }`}
          >
            Sure Dağılımı
          </button>
        </nav>
      </div>

      {/* Tab İçerikleri */}
      {activeTab === 'occurrences' && (
        <div className="space-y-3 sm:space-y-4">
          {displayedOccurrences.map((occ, index) => (
            <div
              key={`${occ.surahId}-${occ.verseNumber}-${occ.wordPosition}-${index}`}
              className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 hover:shadow-soft-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <Link
                  href={`/verse/${occ.surahId}/${occ.verseNumber}`}
                  className="font-medium text-primary-500 hover:text-primary-600 transition-colors text-sm sm:text-base"
                >
                  {occ.surahName} Suresi {occ.verseNumber}. Ayet
                </Link>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-lg sm:text-xl font-arabic bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 px-3 py-1.5 rounded-lg">{occ.word}</span>
                    <span className="text-[10px] sm:text-xs text-soft-400 mt-0.5">{transliterate(occ.word)}</span>
                    {(occ.translationTr || rootInfo.meaningTr) && (
                      <span className="text-[10px] sm:text-xs text-primary-500 dark:text-primary-400 mt-0.5">{occ.translationTr || rootInfo.meaningTr}</span>
                    )}
                  </div>
                  {occ.partOfSpeech && (
                    <span className="root-badge text-[10px] sm:text-xs">{getPartOfSpeechTr(occ.partOfSpeech)}</span>
                  )}
                </div>
              </div>
              <p className="text-lg sm:text-xl font-arabic arabic-text text-soft-700 dark:text-gray-200 leading-loose">
                {occ.arabicText}
              </p>
              <div className="mt-3 text-right">
                <Link
                  href={`/verse/${occ.surahId}/${occ.verseNumber}`}
                  className="text-sm text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors"
                >
                  Detay ve Çeviriler
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}

          {occurrences.length > 50 && !showAll && (
            <div className="text-center py-4">
              <button
                onClick={() => setShowAll(true)}
                className="px-5 sm:px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-soft hover:shadow-soft-md transition-all duration-200"
              >
                Tümünü Göster ({occurrences.length - 50} daha)
              </button>
            </div>
          )}

          {occurrences.length === 0 && (
            <div className="text-center py-8 text-soft-500">
              Bu kök için geçiş bulunamadı
            </div>
          )}
        </div>
      )}

      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {derivedForms.map((form, index) => (
            <div
              key={`${form.word}-${index}`}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 hover:shadow-soft transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xl sm:text-2xl font-arabic text-soft-800 dark:text-white block">{form.word}</span>
                  <span className="text-sm text-soft-400">{transliterate(form.word)}</span>
                </div>
                <span className="text-sm px-2.5 py-1 bg-cream-100 dark:bg-gray-700 text-soft-600 dark:text-gray-300 rounded-full font-medium">
                  {form.count}x
                </span>
              </div>
              {rootInfo.meaningTr && (
                <p className="text-sm text-primary-500 dark:text-primary-400 font-medium mb-1">{rootInfo.meaningTr}</p>
              )}
              {form.lemma && (
                <p className="text-xs text-soft-500 dark:text-gray-400">Lemma: {form.lemma} <span className="text-soft-400">({transliterate(form.lemma)})</span></p>
              )}
              {form.partOfSpeech && (
                <span className="root-badge mt-2 inline-block">{getPartOfSpeechTr(form.partOfSpeech)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'distribution' && (
        <div className="space-y-2">
          {distribution.map((dist) => (
            <div
              key={dist.surahId}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700"
            >
              <Link
                href={`/surah/${dist.surahId}`}
                className="w-full sm:w-48 font-medium text-primary-500 hover:text-primary-600 transition-colors text-sm sm:text-base"
              >
                {dist.surahName}
              </Link>
              <div className="flex-1">
                <div
                  className="h-5 sm:h-6 bg-primary-100 rounded-lg overflow-hidden"
                  style={{
                    width: `${Math.min(100, (dist.count / (distribution[0]?.count || 1)) * 100)}%`,
                  }}
                >
                  <div className="h-full bg-primary-400 rounded-lg flex items-center justify-end pr-2">
                    <span className="text-[10px] sm:text-xs text-white font-medium">{dist.count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
