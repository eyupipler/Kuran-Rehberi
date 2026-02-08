'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/config';

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

export default function RootDetailPage() {
  const params = useParams();
  const rootParam = params.root as string;

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !rootInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{error || 'Kök bulunamadı'}</p>
        <Link href="/roots" className="text-primary-600 hover:underline">
          &larr; Kelime Köklerine Dön
        </Link>
      </div>
    );
  }

  const displayedOccurrences = showAll ? occurrences : occurrences.slice(0, 50);

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8">
        <Link href="/roots" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
          &larr; Kelime Köklerine Dön
        </Link>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-arabic text-gray-900 dark:text-white mb-2">
                {rootInfo.root}
              </h1>
              {rootInfo.rootLatin && (
                <p className="text-gray-500">{rootInfo.rootLatin}</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary-600">
                {rootInfo.occurrenceCount}
              </span>
              <p className="text-sm text-gray-500">kez geçmektedir</p>
            </div>
          </div>

          {(rootInfo.meaningTr || rootInfo.meaningEn) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Anlam</h3>
              {rootInfo.meaningTr && (
                <p className="text-lg text-primary-700 dark:text-primary-400 font-medium">{rootInfo.meaningTr}</p>
              )}
              {rootInfo.meaningEn && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {rootInfo.meaningEn}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Menüsü */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('occurrences')}
            className={`py-3 px-4 border-b-2 font-medium ${
              activeTab === 'occurrences'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Geçişler ({occurrences.length})
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-3 px-4 border-b-2 font-medium ${
              activeTab === 'forms'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Türetilmiş Formlar ({derivedForms.length})
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`py-3 px-4 border-b-2 font-medium ${
              activeTab === 'distribution'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sure Dağılımı
          </button>
        </nav>
      </div>

      {/* Tab İçerikleri */}
      {activeTab === 'occurrences' && (
        <div className="space-y-4">
          {displayedOccurrences.map((occ, index) => (
            <div
              key={`${occ.surahId}-${occ.verseNumber}-${occ.wordPosition}-${index}`}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <Link
                  href={`/verse/${occ.surahId}/${occ.verseNumber}`}
                  className="font-medium text-primary-600 hover:underline"
                >
                  {occ.surahName} Suresi {occ.verseNumber}. Ayet
                </Link>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-arabic bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded">{occ.word}</span>
                    {(occ.translationTr || rootInfo.meaningTr) && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{occ.translationTr || rootInfo.meaningTr}</span>
                    )}
                  </div>
                  {occ.partOfSpeech && (
                    <span className="root-badge">{getPartOfSpeechTr(occ.partOfSpeech)}</span>
                  )}
                </div>
              </div>
              <p className="text-xl font-arabic arabic-text text-gray-800 dark:text-gray-200 leading-loose">
                {occ.arabicText}
              </p>
              <div className="mt-2 text-right">
                <Link
                  href={`/verse/${occ.surahId}/${occ.verseNumber}`}
                  className="text-sm text-primary-500 hover:underline"
                >
                  Detay ve Çeviriler →
                </Link>
              </div>
            </div>
          ))}

          {occurrences.length > 50 && !showAll && (
            <div className="text-center py-4">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Tümünü Göster ({occurrences.length - 50} daha)
              </button>
            </div>
          )}

          {occurrences.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Bu kök için geçiş bulunamadı
            </div>
          )}
        </div>
      )}

      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {derivedForms.map((form, index) => (
            <div
              key={`${form.word}-${index}`}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-arabic text-gray-900 dark:text-white">{form.word}</span>
                <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {form.count}x
                </span>
              </div>
              {rootInfo.meaningTr && (
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-1">{rootInfo.meaningTr}</p>
              )}
              {form.lemma && (
                <p className="text-xs text-gray-600 dark:text-gray-400">Lemma: {form.lemma}</p>
              )}
              {form.partOfSpeech && (
                <span className="root-badge">{getPartOfSpeechTr(form.partOfSpeech)}</span>
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
              className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <Link
                href={`/surah/${dist.surahId}`}
                className="w-48 font-medium text-primary-600 hover:underline"
              >
                {dist.surahName}
              </Link>
              <div className="flex-1">
                <div
                  className="h-6 bg-primary-100 rounded overflow-hidden"
                  style={{
                    width: `${Math.min(100, (dist.count / (distribution[0]?.count || 1)) * 100)}%`,
                  }}
                >
                  <div className="h-full bg-primary-500 rounded flex items-center justify-end pr-2">
                    <span className="text-xs text-white font-medium">{dist.count}</span>
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
