'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SearchField,
  SegmentedControl,
} from '@/components/ui';
import { RootIcon } from '@/components/ui/icons';
import { ARABIC_LETTERS } from '@/features/roots/arabicLetters';
import { getRoots, searchRoots } from '@/lib/api';
import type { Root } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

const PAGE_SIZE = 60;
type SortOption = 'count' | 'alpha';

export function RootsBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get('q') ?? '';
  const urlLetter = searchParams.get('harf') ?? '';
  const urlSort = (searchParams.get('sirala') as SortOption) || 'count';

  const [draft, setDraft] = useState(urlQuery);
  const [page, setPage] = useState(0);

  useEffect(() => setDraft(urlQuery), [urlQuery]);
  useEffect(() => setPage(0), [urlQuery, urlLetter, urlSort]);

  const applyParams = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `/roots?${qs}` : '/roots');
    },
    [router, searchParams]
  );

  // Arama yazılırken istek atmamak için kısa bir bekleme uygulanır.
  useEffect(() => {
    if (draft === urlQuery) return;
    const timer = window.setTimeout(() => applyParams({ q: draft, harf: '' }), 350);
    return () => window.clearTimeout(timer);
  }, [draft, urlQuery, applyParams]);

  const searching = urlQuery.trim().length > 0;

  const { data, loading, error, reload } = useAsync<{ total: number; roots: Root[] }>(
    (signal) =>
      searching
        ? searchRoots(urlQuery, { signal }).then((result) => ({
            total: result.results.length,
            roots: result.results,
          }))
        : getRoots(
            { limit: PAGE_SIZE, offset: page * PAGE_SIZE, sort: urlSort, letter: urlLetter || null },
            { signal }
          ),
    [urlQuery, urlLetter, urlSort, page, searching]
  );

  const roots = data?.roots ?? [];
  const total = data?.total ?? 0;
  const totalPages = searching ? 1 : Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Kelime Kökleri"
        description="Arapça kök, Latin yazım veya Türkçe anlamla arayın — sonuç bağlantısı paylaşılabilir."
      />

      <SearchField
        label="Kök ara"
        size="lg"
        placeholder="Kök ara... (ör. كتب, ktb, yazmak)"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        dir="auto"
        className="mb-4"
      />

      {!searching && (
        <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Harf filtresi">
          {ARABIC_LETTERS.map(({ letter, label }) => {
            const active = urlLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                aria-pressed={active}
                onClick={() => applyParams({ harf: active ? '' : letter })}
                className={`flex min-w-[2.75rem] flex-col items-center rounded-sm px-2 py-1.5 transition-colors ${
                  active
                    ? 'bg-accent text-accent-contrast border border-line'
                    : 'bg-surface text-ink-muted border border-line hover:text-accent'
                }`}
              >
                <span className="font-arabic text-base leading-tight">{letter}</span>
                <span className="text-[9px] leading-tight opacity-75">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {searching ? (
            <>
              &ldquo;<strong className="text-ink">{urlQuery}</strong>&rdquo; için{' '}
              <strong className="text-ink">{total}</strong> sonuç
            </>
          ) : (
            <>
              {urlLetter && <span className="font-arabic text-base">{urlLetter}</span>}{' '}
              {urlLetter ? 'harfiyle başlayan' : 'Toplam'}{' '}
              <strong className="text-ink">{total.toLocaleString('tr-TR')}</strong> kök
            </>
          )}
        </p>

        {!searching && (
          <SegmentedControl
            label="Sıralama"
            value={urlSort}
            onChange={(value) => applyParams({ sirala: value })}
            options={[
              { value: 'count', label: 'En çok geçen' },
              { value: 'alpha', label: 'Alfabetik' },
            ]}
          />
        )}
      </div>

      {loading ? (
        <LoadingState label="Kökler yükleniyor..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : roots.length === 0 ? (
        <EmptyState
          icon={<RootIcon className="h-10 w-10" />}
          title={searching ? `"${urlQuery}" için kök bulunamadı` : 'Kök bulunamadı'}
          description="Arapça kök, Latin ünsüz iskeleti (ktb) veya Türkçe anlam deneyebilirsiniz."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {roots.map((root) => (
            <li key={root.id}>
              <Link
                href={`/roots/${encodeURIComponent(root.root)}`}
                className="flex h-full flex-col rounded-sm bg-surface p-3 border border-line transition-colors hover:border-line-strong"
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <span className="font-arabic text-2xl leading-tight text-ink">{root.root}</span>
                  <span className="mt-1 flex-shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-accent-ink">
                    {root.occurrenceCount}
                  </span>
                </div>
                {root.rootLatin && (
                  <p className="mb-1 font-mono text-xs text-ink-faint">{root.rootLatin}</p>
                )}
                {root.meaningTr && (
                  <p className="line-clamp-2 text-xs leading-snug text-ink-muted">
                    {root.meaningTr}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!searching && totalPages > 1 && !loading && (
        <nav aria-label="Kök sayfaları" className="mt-8 flex items-center justify-center gap-3">
          <Button size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Önceki
          </Button>
          <span className="text-sm tabular-nums text-ink-muted">
            {page + 1} / {totalPages}
          </span>
          <Button size="sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}>
            Sonraki
          </Button>
        </nav>
      )}
    </div>
  );
}
