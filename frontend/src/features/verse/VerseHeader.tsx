import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { VerseActions } from '@/features/verse/VerseActions';
import type { VerseActionTarget } from '@/features/verse/VerseActions';

export function VerseHeader({
  target,
  totalVerses,
  onOpenNote,
  onCompare,
}: {
  target: VerseActionTarget;
  totalVerses: number | null;
  onOpenNote: () => void;
  onCompare: () => void;
}) {
  const { surahId, verseNumber, surahName } = target;
  const hasNext = totalVerses === null || verseNumber < totalVerses;

  return (
    <header className="mb-8 border-b border-line pb-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/surah/${surahId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-accent"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {surahName} Suresi
        </Link>

        <nav aria-label="Ayet gezinmesi" className="flex items-center gap-4">
          {verseNumber > 1 && (
            <Link
              href={`/verse/${surahId}/${verseNumber - 1}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-accent"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Önceki</span>
            </Link>
          )}
          {hasNext && (
            <Link
              href={`/verse/${surahId}/${verseNumber + 1}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-accent"
            >
              <span className="hidden sm:inline">Sonraki</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Ayet {surahId}:{verseNumber}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {surahName} Suresi, {verseNumber}. Ayet
          </h1>
        </div>

        <div className="-mr-2">
          <VerseActions
            verse={target}
            size="md"
            onOpenNote={onOpenNote}
            onCompare={onCompare}
            showDetailLink={false}
          />
        </div>
      </div>
    </header>
  );
}
