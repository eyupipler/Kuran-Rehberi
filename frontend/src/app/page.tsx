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

type SortKey = 'name' | 'id' | 'revelation' | 'verses';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span className="ml-1 text-soft-300 dark:text-gray-600 text-xs select-none">⇅</span>
    );
  }
  return (
    <span className="ml-1 text-primary-500 dark:text-primary-400 text-xs select-none">
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    fetch(`${API_BASE}/surahs`)
      .then((res) => { if (!res.ok) throw new Error('API hatası'); return res.json(); })
      .then((data) => { setSurahs(data); setLoading(false); })
      .catch((err) => { console.error('Sureler yüklenemedi:', err); setError(true); setLoading(false); });
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedSurahs = [...surahs].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'tr');
    else if (sortKey === 'id') cmp = a.id - b.id;
    else if (sortKey === 'revelation') cmp = a.revelationOrder - b.revelationOrder;
    else if (sortKey === 'verses') cmp = a.totalVerses - b.totalVerses;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-semibold text-soft-700 dark:text-gray-300">Sunucuya bağlanılamadı</h2>
        <p className="text-sm text-soft-500 dark:text-gray-400 max-w-sm">
          Site ilk açılışta biraz geç yanıt verebilir. Lütfen sayfayı yenileyin.
        </p>
        <button
          onClick={() => { setError(false); setLoading(true); fetch(`${API_BASE}/surahs`).then(r => r.json()).then(d => { setSurahs(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); }); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const thBase = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap cursor-pointer select-none transition-colors hover:text-primary-600 dark:hover:text-primary-400';
  const thActive = 'text-primary-600 dark:text-primary-400';
  const thInactive = 'text-soft-500 dark:text-gray-400';

  return (
    <div>
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-soft-800 dark:text-white mb-1">
          Kuran-ı Kerim
        </h1>
        <p className="text-soft-500 dark:text-gray-400 text-sm">
          114 sure, 6236 ayet — Kelime kökü analizi ve çoklu çeviri desteği
        </p>
      </div>

      {/* Masaüstü tablo */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-soft-200 dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-soft-50 dark:bg-gray-800 border-b border-soft-200 dark:border-gray-700">
              <th
                className={`text-left ${thBase} ${sortKey === 'name' ? thActive : thInactive} w-full`}
                onClick={() => handleSort('name')}
              >
                Sure İsmi
                <SortIcon active={sortKey === 'name'} dir={sortDir} />
              </th>
              <th
                className={`text-center ${thBase} ${sortKey === 'id' ? thActive : thInactive}`}
                onClick={() => handleSort('id')}
              >
                Kitap Sırası
                <SortIcon active={sortKey === 'id'} dir={sortDir} />
              </th>
              <th
                className={`text-center ${thBase} ${sortKey === 'revelation' ? thActive : thInactive}`}
                onClick={() => handleSort('revelation')}
              >
                İniş Sırası
                <SortIcon active={sortKey === 'revelation'} dir={sortDir} />
              </th>
              <th
                className={`text-center ${thBase} ${sortKey === 'verses' ? thActive : thInactive}`}
                onClick={() => handleSort('verses')}
              >
                Ayet Sayısı
                <SortIcon active={sortKey === 'verses'} dir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSurahs.map((surah, i) => (
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
        {sortedSurahs.map((surah) => (
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
