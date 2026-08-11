'use client';

import Link from 'next/link';
import { Button, SectionLabel } from '@/components/ui';
import { ChevronRightIcon } from '@/components/ui/icons';
import { useHistory } from '@/context/HistoryContext';

export function ContinueReading() {
  const { lastRead } = useHistory();
  if (!lastRead) return null;

  return (
    <Link
      href={`/verse/${lastRead.surahId}/${lastRead.verseNumber}`}
      className="group flex flex-col py-7 lg:pr-8"
    >
      <SectionLabel>Okumaya devam et</SectionLabel>

      <p className="mt-3 text-xl font-semibold text-ink transition-colors group-hover:text-accent">
        {lastRead.surahName} Suresi
        <span className="ml-2 text-base font-normal text-ink-muted">
          {lastRead.verseNumber}. Ayet
        </span>
      </p>

      {lastRead.snippet && (
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {lastRead.snippet}
        </p>
      )}

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
        Kaldığın yerden devam et
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function RecentVerses() {
  const { history, clearHistory } = useHistory();
  const recent = history.slice(1);
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="border-b border-line py-7">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span id="recent-heading">
          <SectionLabel>Son görüntülenenler</SectionLabel>
        </span>
        <Button size="sm" variant="ghost" onClick={clearHistory}>
          Temizle
        </Button>
      </div>

      <ul className="flex flex-wrap gap-2">
        {recent.map((entry) => (
          <li key={`${entry.surahId}:${entry.verseNumber}`}>
            <Link
              href={`/verse/${entry.surahId}/${entry.verseNumber}`}
              className="inline-flex items-center gap-2 rounded-sm border border-line px-2.5 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent"
            >
              <span className="font-semibold tabular-nums text-accent">
                {entry.surahId}:{entry.verseNumber}
              </span>
              <span className="max-w-[9rem] truncate text-ink-muted">{entry.surahName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
