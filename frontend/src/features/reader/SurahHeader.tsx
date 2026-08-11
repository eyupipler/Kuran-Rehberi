import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import type { Surah } from '@/lib/api';

export function SurahHeader({ surah, fallbackName }: { surah: Surah | null; fallbackName: string }) {
  if (!surah) {
    return (
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{fallbackName}</h1>
      </header>
    );
  }

  // Alanlar eski API sürümünde eksik gelebilir; boş satır göstermek yerine atlanır.
  const facts = [
    surah.totalVerses > 0 ? `${surah.totalVerses} ayet` : null,
    surah.revelationType || null,
    surah.revelationOrder > 0 ? `${surah.revelationOrder}. sırada indi` : null,
    surah.englishName || null,
  ].filter(Boolean);

  return (
    <header className="mb-8 border-b border-line pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {surah.id}. Sure
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {surah.name} Suresi
          </h1>
        </div>
        <p className="font-arabic text-3xl leading-[1.7] text-ink-muted">{surah.arabicName}</p>
      </div>

      <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {facts.map((fact, index) => (
          <li key={fact} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden="true" className="text-line-strong">
                ·
              </span>
            )}
            {fact}
          </li>
        ))}
      </ul>
    </header>
  );
}

export function SurahPager({ surahId }: { surahId: number }) {
  return (
    <nav
      aria-label="Sure gezinmesi"
      className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6"
    >
      {surahId > 1 ? (
        <Link
          href={`/surah/${surahId - 1}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-accent"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Önceki sure
        </Link>
      ) : (
        <span />
      )}

      {surahId < 114 && (
        <Link
          href={`/surah/${surahId + 1}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-accent"
        >
          Sonraki sure
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}

export function ReaderBreadcrumb() {
  return (
    <Link
      href="/surahs"
      className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-accent"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      Tüm sureler
    </Link>
  );
}
