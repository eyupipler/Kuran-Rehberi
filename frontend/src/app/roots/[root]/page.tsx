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

export default function RootDetailPage() {
  const params = useParams();
  const rootParam = params.root as string;

  const [rootInfo, setRootInfo] = useState<RootInfo | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [derivedForms, setDerivedForms] = useState<DerivedForm[]>([]);
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'occurrences' | 'forms' | 'distribution'>(
    'occurrences'
  );

  useEffect(() => {
    if (!rootParam) return;

    setLoading(true);
    fetch(`${API_BASE}/roots/${encodeURIComponent(rootParam)}`)
      .then((res) => res.json())
      .then((data) => {
        setRootInfo(data.root);
        setOccurrences(data.occurrences);
        setDerivedForms(data.derivedForms);
        setDistribution(data.distribution);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Kok yuklenemedi:', err);
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

  if (!rootInfo) {
    return <div className="text-center py-12">Kok bulunamadi</div>;
  }

  return (
    <div>
      {/* Baslik */}
      <div className="mb-8">
        <Link href="/roots" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
          &larr; Kelime Koklerine Don
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
              <p className="text-sm text-gray-500">kez gecmektedir</p>
            </div>
          </div>

          {(rootInfo.meaningTr || rootInfo.meaningEn) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Anlam</h3>
              {rootInfo.meaningTr && (
                <p className="text-gray-700 dark:text-gray-300">{rootInfo.meaningTr}</p>
              )}
              {rootInfo.meaningEn && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {rootInfo.meaningEn}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Menusu */}
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
            Gecisler ({occurrences.length})
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-3 px-4 border-b-2 font-medium ${
              activeTab === 'forms'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Turetilmis Formlar ({derivedForms.length})
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`py-3 px-4 border-b-2 font-medium ${
              activeTab === 'distribution'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sure Dagilimi
          </button>
        </nav>
      </div>

      {/* Tab Icerikleri */}
      {activeTab === 'occurrences' && (
        <div className="space-y-4">
          {occurrences.slice(0, 50).map((occ, index) => (
            <div
              key={`${occ.surahId}-${occ.verseNumber}-${occ.wordPosition}-${index}`}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/verse/${occ.surahId}/${occ.verseNumber}`}
                  className="font-medium text-primary-600 hover:underline"
                >
                  {occ.surahName} ({occ.surahId}:{occ.verseNumber})
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-arabic">{occ.word}</span>
                  {occ.partOfSpeech && (
                    <span className="root-badge">{occ.partOfSpeech}</span>
                  )}
                </div>
              </div>
              <p className="text-xl font-arabic arabic-text text-gray-800 dark:text-gray-200">
                {occ.arabicText}
              </p>
            </div>
          ))}

          {occurrences.length > 50 && (
            <p className="text-center text-gray-500 py-4">
              ve {occurrences.length - 50} daha fazla...
            </p>
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
                <span className="text-2xl font-arabic">{form.word}</span>
                <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {form.count}x
                </span>
              </div>
              {form.lemma && (
                <p className="text-sm text-gray-500">Lemma: {form.lemma}</p>
              )}
              {form.partOfSpeech && (
                <span className="root-badge">{form.partOfSpeech}</span>
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
                  className="h-6 bg-primary-200 rounded"
                  style={{
                    width: `${Math.min(100, (dist.count / distribution[0].count) * 100)}%`,
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
