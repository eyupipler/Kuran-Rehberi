'use client';

import Link from 'next/link';
import { SectionLabel, Spinner } from '@/components/ui';
import { ChevronRightIcon } from '@/components/ui/icons';
import { useSettings } from '@/context/SettingsContext';
import { useSurahs } from '@/features/quran/useSurahs';
import { getSurahVerses } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

const DAY_MS = 86_400_000;

/** Gün numarasından türetilen sabit seçim — aynı günde herkese aynı ayet düşer. */
function verseOfTheDay(surahCount: number, totalVersesOf: (index: number) => number) {
  const day = Math.floor(Date.now() / DAY_MS);
  const surahIndex = day % surahCount;
  return { surahIndex, verseOffset: day % totalVersesOf(surahIndex) };
}

export function DailyVerse() {
  const { surahs } = useSurahs();
  const { settings } = useSettings();

  const selection = surahs.length
    ? verseOfTheDay(surahs.length, (index) => surahs[index].totalVerses)
    : null;
  const surah = selection ? surahs[selection.surahIndex] : null;
  const verseNumber = selection ? selection.verseOffset + 1 : null;

  const { data, loading } = useAsync(
    (signal) => getSurahVerses(surah!.id, settings.defaultTranslator, { signal }),
    [surah?.id, settings.defaultTranslator],
    { enabled: Boolean(surah) }
  );

  if (!surah || !verseNumber) return null;

  const verse = data?.verses.find((item) => item.verseNumber === verseNumber) ?? data?.verses[0];

  return (
    <section aria-labelledby="daily-verse-heading" className="flex flex-col py-7 lg:pl-8">
      <div className="flex items-center justify-between gap-3">
        <span id="daily-verse-heading">
          <SectionLabel>Günün Ayeti</SectionLabel>
        </span>
        <span className="text-xs font-medium tabular-nums text-accent">
          {surah.name} {surah.id}:{verse?.verseNumber ?? verseNumber}
        </span>
      </div>

      {loading && !verse ? (
        <div className="flex flex-1 items-center justify-center py-6">
          <Spinner />
        </div>
      ) : verse?.translation ? (
        <Link href={`/verse/${surah.id}/${verse.verseNumber}`} className="group mt-3 flex flex-1 flex-col">
          <p className="prose-text flex-1 text-ink transition-colors group-hover:text-accent">
            {verse.translation}
          </p>
          <span className="mt-4 flex items-center justify-between gap-2 text-xs">
            <span className="text-ink-faint">{verse.translatorName}</span>
            <span className="inline-flex items-center gap-1 font-medium text-accent">
              Ayeti aç
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </span>
          </span>
        </Link>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">Günün ayeti şu anda yüklenemedi.</p>
      )}
    </section>
  );
}
