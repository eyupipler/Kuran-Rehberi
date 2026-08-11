'use client';

import Link from 'next/link';
import { Badge, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { RootIcon } from '@/components/ui/icons';
import { useRootOccurrences } from '@/features/verse/hooks/useRootOccurrences';
import { transliterateRoot } from '@/utils/transliteration';

/** Ayet sayfasındaki "Kökler" sekmesi — seçili kelimenin kökünü inceler. */
export function RootInspector({
  root,
  translator,
  currentSurahId,
  currentVerseNumber,
}: {
  root: string | null;
  translator: string;
  currentSurahId: number;
  currentVerseNumber: number;
}) {
  const { data, loading, error, reload } = useRootOccurrences(root, translator);

  if (!root) {
    return (
      <EmptyState
        icon={<RootIcon className="h-9 w-9" />}
        title="Bir kelime seçin"
        description="Ayetteki Arapça bir kelimeye ya da Kelimeler sekmesindeki bir satıra dokunduğunuzda kökü burada incelenir."
      />
    );
  }

  if (loading) return <LoadingState label="Kök bilgisi yükleniyor..." compact />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-sm bg-surface p-4 border border-line">
        <div>
          <p className="font-arabic text-3xl text-accent">{data.root.root}</p>
          <p className="text-xs italic text-ink-faint">{transliterateRoot(data.root.root)}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink">{data.root.meaningTr || 'Türkçe anlam bulunamadı'}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="accent">{data.root.occurrenceCount} kullanım</Badge>
            <Badge>{data.distribution.length} sure</Badge>
            <Badge>{data.derivedForms.length} biçim</Badge>
          </div>
        </div>
        <Link
          href={`/roots/${encodeURIComponent(data.root.root)}`}
          className="text-sm text-accent hover:underline"
        >
          Kök sayfası →
        </Link>
      </div>

      <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto">
        {data.occurrences.map((occurrence, index) => {
          const isCurrent =
            occurrence.surahId === currentSurahId && occurrence.verseNumber === currentVerseNumber;
          return (
            <li key={`${occurrence.surahId}-${occurrence.verseNumber}-${occurrence.wordPosition}-${index}`}>
              <Link
                href={`/verse/${occurrence.surahId}/${occurrence.verseNumber}`}
                className={`flex items-start gap-2.5 rounded-sm border p-2.5 text-xs transition-colors ${
                  isCurrent
                    ? 'border-accent bg-accent-soft'
                    : 'border-line hover:border-accent hover:bg-surface-sunken'
                }`}
              >
                <span className="w-14 flex-shrink-0 font-medium tabular-nums text-accent">
                  {occurrence.surahId}:{occurrence.verseNumber}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-arabic text-sm text-ink">{occurrence.word}</span>
                  {occurrence.verseMealTr && (
                    <span className="mt-0.5 block line-clamp-2 text-ink-muted">
                      {occurrence.verseMealTr}
                    </span>
                  )}
                </span>
                {isCurrent && <Badge tone="accent">Mevcut</Badge>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
