'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Surah } from '@/lib/api';

export type SortKey = 'id' | 'name' | 'revelation' | 'verses';
type SortDirection = 'asc' | 'desc';

function compare(a: Surah, b: Surah, key: SortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, 'tr');
    case 'revelation':
      return a.revelationOrder - b.revelationOrder;
    case 'verses':
      return a.totalVerses - b.totalVerses;
    default:
      return a.id - b.id;
  }
}

export function useSortedSurahs(surahs: Surah[]) {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [direction, setDirection] = useState<SortDirection>('asc');

  const sorted = useMemo(() => {
    const result = [...surahs].sort((a, b) => compare(a, b, sortKey));
    return direction === 'asc' ? result : result.reverse();
  }, [surahs, sortKey, direction]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  };

  return { sorted, sortKey, direction, toggleSort };
}

function SurahNumber({ id }: { id: number }) {
  return (
    <span className="w-8 flex-shrink-0 text-right text-sm font-semibold tabular-nums text-accent">
      {id}
    </span>
  );
}

function RevelationTag({ type }: { type: Surah['revelationType'] }) {
  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${
        type === 'Mekki' ? 'bg-accent-soft text-accent-ink' : 'bg-surface-sunken text-ink-muted'
      }`}
    >
      {type}
    </span>
  );
}

function SortableHeader({
  label,
  columnKey,
  sortKey,
  direction,
  onSort,
  align = 'center',
}: {
  label: string;
  columnKey: SortKey;
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'center';
}) {
  const active = sortKey === columnKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider ${
        align === 'left' ? 'text-left' : 'text-center'
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`inline-flex items-center gap-1 transition-colors ${
          active ? 'text-accent' : 'text-ink-faint hover:text-ink'
        }`}
      >
        {label}
        <span aria-hidden="true" className="text-[10px]">
          {active ? (direction === 'asc' ? '↑' : '↓') : '⇅'}
        </span>
      </button>
    </th>
  );
}

export function SurahTable({
  surahs,
  sortKey,
  direction,
  onSort,
}: {
  surahs: Surah[];
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  return (
    <div className="hidden overflow-x-auto border-y border-line sm:block">
      <table className="w-full border-collapse">
        <caption className="sr-only">Kuran-ı Kerim sureleri</caption>
        <thead className="border-b border-line bg-surface-sunken">
          <tr>
            <SortableHeader
              label="Sure"
              columnKey="name"
              sortKey={sortKey}
              direction={direction}
              onSort={onSort}
              align="left"
            />
            <SortableHeader
              label="Kitap"
              columnKey="id"
              sortKey={sortKey}
              direction={direction}
              onSort={onSort}
            />
            <SortableHeader
              label="İniş"
              columnKey="revelation"
              sortKey={sortKey}
              direction={direction}
              onSort={onSort}
            />
            <SortableHeader
              label="Ayet"
              columnKey="verses"
              sortKey={sortKey}
              direction={direction}
              onSort={onSort}
            />
            <th
              scope="col"
              className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-faint"
            >
              İniş yeri
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {surahs.map((surah) => (
            <tr key={surah.id} className="group transition-colors hover:bg-surface-sunken">
                <td className="px-4 py-2.5">
                  <Link href={`/surah/${surah.id}`} className="flex items-center gap-4">
                    <SurahNumber id={surah.id} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink transition-colors group-hover:text-accent">
                        {surah.name}
                      </span>
                      <span className="block text-xs text-ink-faint">{surah.englishName}</span>
                    </span>
                    <span className="ml-auto font-arabic text-lg text-ink-muted">
                      {surah.arabicName}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-center text-sm tabular-nums text-ink-muted">
                  {surah.id}
                </td>
                <td className="px-4 py-2.5 text-center text-sm tabular-nums text-ink-muted">
                  {surah.revelationOrder}
                </td>
                <td className="px-4 py-2.5 text-center text-sm tabular-nums text-ink-muted">
                  {surah.totalVerses}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <RevelationTag type={surah.revelationType} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function SurahCards({ surahs }: { surahs: Surah[] }) {
  return (
    <div className="hidden border-t border-line sm:grid sm:grid-cols-2 lg:grid-cols-3">
      {surahs.map((surah) => (
        <Link
          key={surah.id}
          href={`/surah/${surah.id}`}
          className="group -mt-px flex flex-col border-b border-r border-line p-4 transition-colors hover:bg-surface-sunken"
        >
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <SurahNumber id={surah.id} />
            <span className="font-arabic text-xl leading-none text-ink">{surah.arabicName}</span>
          </div>
          <p className="text-sm font-medium text-ink transition-colors group-hover:text-accent">
            {surah.name} Suresi
          </p>
          <p className="text-xs text-ink-faint">{surah.englishName}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <span>{surah.totalVerses} ayet</span>
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
            <RevelationTag type={surah.revelationType} />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function SurahMobileList({ surahs }: { surahs: Surah[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line sm:hidden">
      {surahs.map((surah) => (
        <li key={surah.id}>
          <Link
            href={`/surah/${surah.id}`}
            className="flex min-h-[3.5rem] items-center gap-4 px-1 py-3"
          >
            <SurahNumber id={surah.id} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{surah.name}</span>
              <span className="block text-xs text-ink-faint">
                {surah.totalVerses} ayet · {surah.revelationType}
              </span>
            </span>
            <span className="font-arabic text-lg text-ink-muted">{surah.arabicName}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
