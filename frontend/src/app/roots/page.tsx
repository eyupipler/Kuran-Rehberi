'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Root {
  id: number;
  root: string;
  rootLatin: string;
  meaningTr: string;
  meaningEn: string;
  occurrenceCount: number;
}

export default function RootsPage() {
  const [roots, setRoots] = useState<Root[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'count' | 'alpha'>('count');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    setLoading(true);

    let url = `/api/roots?limit=${limit}&offset=${page * limit}&sort=${sortBy}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRoots(data.roots);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Kokler yuklenemedi:', err);
        setLoading(false);
      });
  }, [sortBy, page]);

  const handleSearch = async () => {
    if (searchQuery.length < 1) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/roots/search/${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setRoots(data.results);
      setTotal(data.results.length);
    } catch (error) {
      console.error('Arama hatasi:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(0);
    // Trigger reload
    setSortBy(sortBy);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Kelime Kokleri
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Kuran'daki kelime koklerini kesfet ve her kokun nerede gectigini gor
        </p>
      </div>

      {/* Arama ve Filtre */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Kok ara (Arapca veya anlami)..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSearch}
              disabled={searchQuery.length < 1}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Ara
            </button>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Temizle
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'count' | 'alpha');
              setPage(0);
            }}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="count">En Cok Gecen</option>
            <option value="alpha">Alfabetik</option>
          </select>
        </div>
      </div>

      {/* Istatistik */}
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Toplam <strong>{total}</strong> benzersiz kok
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Kok Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roots.map((root) => (
              <Link
                key={root.id}
                href={`/roots/${encodeURIComponent(root.root)}`}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-arabic text-gray-900 dark:text-white">
                    {root.root}
                  </span>
                  <span className="text-sm px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {root.occurrenceCount}x
                  </span>
                </div>
                {root.rootLatin && (
                  <p className="text-sm text-gray-500 mb-1">{root.rootLatin}</p>
                )}
                {root.meaningTr && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {root.meaningTr}
                  </p>
                )}
                {root.meaningEn && !root.meaningTr && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {root.meaningEn}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* Sayfalama */}
          {!searchQuery && total > limit && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Onceki
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Sayfa {page + 1} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
