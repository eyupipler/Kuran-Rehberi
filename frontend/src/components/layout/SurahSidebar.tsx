'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchField } from '@/components/ui';
import { useSurahs } from '@/features/quran/useSurahs';

export function SurahSidebar() {
  const pathname = usePathname() || '';
  const { surahs } = useSurahs();
  const [filter, setFilter] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const activeId = Number(pathname.split('/')[2]) || null;

  const visible = useMemo(() => {
    const term = filter.trim().toLocaleLowerCase('tr-TR');
    if (!term) return surahs;
    return surahs.filter(
      (surah) =>
        surah.name.toLocaleLowerCase('tr-TR').includes(term) || String(surah.id).startsWith(term)
    );
  }, [surahs, filter]);

  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const element = listRef.current.querySelector<HTMLElement>(`[data-surah-id="${activeId}"]`);
    if (!element) return;
    listRef.current.scrollTop =
      element.offsetTop - listRef.current.clientHeight / 2 + element.clientHeight / 2;
  }, [activeId, visible.length]);

  return (
    <aside
      aria-label="Sure listesi"
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col border-r border-line lg:flex"
    >
      <div className="flex-shrink-0 border-b border-line p-3">
        <SearchField
          label="Sure ara"
          placeholder="Sure ara..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        {visible.map((surah) => {
          const active = activeId === surah.id;
          return (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              data-surah-id={surah.id}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 border-b border-line px-4 py-2.5 text-sm transition-colors duration-150 ${
                active
                  ? 'border-l-2 border-l-accent bg-accent-soft font-medium text-accent-ink'
                  : 'border-l-2 border-l-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink'
              }`}
            >
              <span className="w-6 flex-shrink-0 text-right text-xs tabular-nums text-ink-faint">
                {surah.id}
              </span>
              <span className="min-w-0 flex-1 truncate">{surah.name}</span>
              <span className="flex-shrink-0 text-xs tabular-nums text-ink-faint">
                {surah.totalVerses}
              </span>
            </Link>
          );
        })}

        {visible.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-ink-faint">Sure bulunamadı</p>
        )}
      </div>
    </aside>
  );
}
