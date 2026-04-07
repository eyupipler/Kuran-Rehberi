'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { API_BASE } from '@/config';

interface Surah {
  id: number;
  name: string;
  totalVerses: number;
}

export default function SurahSidebar() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);

  const activeId = pathname.startsWith('/surah/')
    ? parseInt(pathname.split('/')[2])
    : null;

  useEffect(() => {
    fetch(`${API_BASE}/surahs`)
      .then((res) => res.json())
      .then((data) => setSurahs([...data].sort((a: Surah, b: Surah) => a.id - b.id)))
      .catch(console.error);
  }, []);

  // Aktif sureye otomatik kaydır
  useEffect(() => {
    if (!activeId || !listRef.current || surahs.length === 0) return;
    const el = listRef.current.querySelector(`[data-surah-id="${activeId}"]`) as HTMLElement;
    if (el) {
      const container = listRef.current;
      container.scrollTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
    }
  }, [activeId, surahs.length]);

  return (
    <>
      {/* Mobil overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobil açma butonu */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed lg:hidden bottom-6 left-4 z-30 bg-primary-600 text-white rounded-full px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-semibold"
        aria-label="Sure listesi"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Sureler
      </button>

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed lg:sticky lg:top-16',
          'top-16 left-0 bottom-0 z-50 lg:z-auto',
          'w-64 flex-shrink-0 flex flex-col',
          'bg-white dark:bg-gray-800',
          'border-r border-soft-200 dark:border-gray-700',
          'transition-transform duration-300 lg:translate-x-0',
          'h-[calc(100vh-4rem)]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Başlık */}
        <div className="px-4 py-3 border-b border-soft-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
          <span className="text-sm font-semibold text-soft-700 dark:text-gray-200">Sureler</span>
          <span className="text-xs text-soft-400 dark:text-gray-500">114 sure</span>
        </div>

        {/* Sure listesi */}
        <div ref={listRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {surahs.map((surah) => {
            const isActive = activeId === surah.id;
            return (
              <Link
                key={surah.id}
                href={`/surah/${surah.id}`}
                data-surah-id={surah.id}
                onClick={() => setIsOpen(false)}
                className={[
                  'flex items-center justify-between px-4 py-2.5',
                  'border-b border-soft-100 dark:border-gray-700/40',
                  'transition-colors last:border-0',
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-soft-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400',
                ].join(' ')}
              >
                <span className="text-sm font-medium">
                  <span className={`mr-1.5 text-xs ${isActive ? 'text-primary-100' : 'text-soft-400 dark:text-gray-500'}`}>
                    {surah.id}.
                  </span>
                  {surah.name.toUpperCase()}
                </span>
                <span
                  className={[
                    'text-xs rounded-full px-2 py-0.5 flex-shrink-0 ml-2',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-soft-100 dark:bg-gray-700 text-soft-500 dark:text-gray-400',
                  ].join(' ')}
                >
                  {surah.totalVerses}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
