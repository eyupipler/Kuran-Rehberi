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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Kuran-ı Kerim
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          114 sure, 6236 ayet - Kelime kökü analizi ve çoklu çeviri desteği
        </p>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sıralama
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'number' | 'revelation')}
            className="border rounded-md px-3 py-2 bg-white dark:bg-gray-700"
          >
            <option value="number">Sure Sırasına Göre</option>
            <option value="revelation">İniş Sırasına Göre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtre
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'Mekki' | 'Medeni')}
            className="border rounded-md px-3 py-2 bg-white dark:bg-gray-700"
          >
            <option value="all">Tümü</option>
            <option value="Mekki">Mekki Sureler</option>
            <option value="Medeni">Medeni Sureler</option>
          </select>
        </div>
      </div>

      {/* Sure Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className="block p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <span className="verse-number mr-3">{surah.id}</span>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {surah.name}
                  </h2>
                  <p className="text-sm text-gray-500">{surah.englishName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-arabic text-gray-800 dark:text-gray-200">
                  {surah.arabicName}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>{surah.totalVerses} ayet</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  surah.revelationType === 'Mekki'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {surah.revelationType}
              </span>
              {sortBy === 'revelation' && (
                <span className="text-xs">İniş: {surah.revelationOrder}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
