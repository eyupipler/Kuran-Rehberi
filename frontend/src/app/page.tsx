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

  useEffect(() => {
    fetch(`${API_BASE}/surahs`)
      .then((res) => res.json())
      .then((data) => { setSurahs(data); setLoading(false); })
      .catch((err) => { console.error('Sureler yüklenemedi:', err); setLoading(false); });
  }, []);

  const filteredSurahs = surahs
    .sort((a, b) => sortBy === 'revelation' ? a.revelationOrder - b.revelationOrder : a.id - b.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-soft-800 dark:text-white mb-1">
          Kuran-ı Kerim
        </h1>
        <p className="text-soft-500 dark:text-gray-400 text-sm">
          114 sure, 6236 ayet — Kelime kökü analizi ve çoklu çeviri desteği
        </p>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'number' | 'revelation')}
          className="border border-soft-200 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
        >
          <option value="number">Kitap Sırası</option>
          <option value="revelation">İniş Sırası</option>
        </select>
      </div>

      {/* Masaüstü tablo */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-soft-200 dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-soft-50 dark:bg-gray-800 border-b border-soft-200 dark:border-gray-700">
              <th className="text-left px-5 py-3 text-xs font-semibold text-soft-500 dark:text-gray-400 uppercase tracking-wide w-full">
                Sure İsmi
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-soft-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                Kitap Sırası
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-soft-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                İniş Sırası
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-soft-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                Ayet Sayısı
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSurahs.map((surah, i) => (
              <tr
                key={surah.id}
                className={[
                  'border-b border-soft-100 dark:border-gray-700/50',
                  'hover:bg-primary-50/60 dark:hover:bg-gray-700/40 transition-colors',
                  i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-soft-50/40 dark:bg-gray-800/60',
                ].join(' ')}
              >
                <td className="px-5 py-3">
                  <Link href={`/surah/${surah.id}`} className="flex items-center gap-3 group">
                    <span className="text-soft-400 dark:text-gray-500 text-xs w-5 text-right flex-shrink-0">
                      {surah.id}
                    </span>
                    <div>
                      <span className="font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 text-sm">
                        {surah.name} Suresi
                      </span>
                      <span className="block text-xs text-soft-400 dark:text-gray-500">
                        {surah.englishName}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="text-center px-4 py-3 text-sm text-soft-600 dark:text-gray-300">
                  {surah.id}
                </td>
                <td className="text-center px-4 py-3 text-sm text-soft-600 dark:text-gray-300">
                  {surah.revelationOrder}
                </td>
                <td className="text-center px-4 py-3 text-sm text-soft-600 dark:text-gray-300">
                  {surah.totalVerses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil liste */}
      <div className="sm:hidden -mx-4 divide-y divide-soft-100 dark:divide-gray-700 border-t border-soft-100 dark:border-gray-700">
        {filteredSurahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="verse-number flex-shrink-0">{surah.id}</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-soft-800 dark:text-white text-sm">{surah.name}</span>
              <div className="mt-0.5">
                <span className="text-xs text-soft-400">{surah.totalVerses} ayet</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
