'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/config';

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  totalVerses: number;
  revelationType: 'Mekki' | 'Medeni';
  revelationOrder: number;
}

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'number' | 'revelation'>('number');
  const [filter, setFilter] = useState<'all' | 'Mekki' | 'Medeni'>('all');

  useEffect(() => {
    fetch(`${API_BASE}/surahs`)
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Sureler yüklenemedi:', err);
        setLoading(false);
      });
  }, []);

  const filteredSurahs = surahs
    .filter((s) => filter === 'all' || s.revelationType === filter)
    .sort((a, b) => {
      if (sortBy === 'revelation') {
        return a.revelationOrder - b.revelationOrder;
      }
      return a.id - b.id;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık - Daha yumuşak */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-soft-800 dark:text-white mb-2">
          Kuran-ı Kerim
        </h1>
        <p className="text-soft-500 dark:text-gray-400 text-sm sm:text-base">
          114 sure, 6236 ayet - Kelime kökü analizi ve çoklu çeviri desteği
        </p>
      </div>

      {/* Filtreler - Mobil uyumlu */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 sm:flex-none">
          <label className="block text-sm font-medium text-soft-600 dark:text-gray-300 mb-1.5">
            Sıralama
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'number' | 'revelation')}
            className="w-full sm:w-auto border border-soft-200 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-soft-700 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
          >
            <option value="number">Sure Sırasına Göre</option>
            <option value="revelation">İniş Sırasına Göre</option>
          </select>
        </div>
        <div className="flex-1 sm:flex-none">
          <label className="block text-sm font-medium text-soft-600 dark:text-gray-300 mb-1.5">
            Filtre
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'Mekki' | 'Medeni')}
            className="w-full sm:w-auto border border-soft-200 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-soft-700 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
          >
            <option value="all">Tümü</option>
            <option value="Mekki">Mekki Sureler</option>
            <option value="Medeni">Medeni Sureler</option>
          </select>
        </div>
      </div>

      {/* Sure Listesi - Mobil uyumlu kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredSurahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className="block p-4 sm:p-5 border border-soft-200 dark:border-gray-700 rounded-xl hover:shadow-soft-md transition-all duration-200 bg-white dark:bg-gray-800 hover:border-primary-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center min-w-0">
                <span className="verse-number mr-3 flex-shrink-0">{surah.id}</span>
                <div className="min-w-0">
                  <h2 className="font-medium text-soft-800 dark:text-white truncate">
                    {surah.name}
                  </h2>
                  <p className="text-sm text-soft-400 truncate">{surah.englishName}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl sm:text-2xl font-arabic text-soft-700 dark:text-gray-200">
                  {surah.arabicName}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-soft-500 flex-wrap gap-2">
              <span>{surah.totalVerses} ayet</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  surah.revelationType === 'Mekki'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {surah.revelationType}
              </span>
              {sortBy === 'revelation' && (
                <span className="text-xs text-soft-400">İniş: {surah.revelationOrder}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
