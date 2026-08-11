'use client';

import Link from 'next/link';
import { ErrorState, LoadingState, SectionLabel, SegmentedControl } from '@/components/ui';
import { GridIcon, ListIcon } from '@/components/ui/icons';
import { useSettings } from '@/context/SettingsContext';
import { DailyVerse } from '@/features/home/DailyVerse';
import { ContinueReading, RecentVerses } from '@/features/home/ReadingHistory';
import {
  SurahCards,
  SurahMobileList,
  SurahTable,
  useSortedSurahs,
} from '@/features/quran/SurahList';
import { useSurahs } from '@/features/quran/useSurahs';
import { GlobalSearchBox } from '@/features/search/GlobalSearchBox';

const QUICK_LINKS = [
  { href: '/surahs', label: 'Sureleri gör' },
  { href: '/roots', label: 'Kelime kökleri' },
  { href: '/search', label: 'Mealde ara' },
  { href: '/notes', label: 'Notlarım' },
];

const STATS = [
  { value: '114', label: 'Sure' },
  { value: '6.236', label: 'Ayet' },
  { value: '43', label: 'Meal' },
  { value: '1.658', label: 'Kök' },
];

export default function HomePage() {
  const { surahs, loading, error, reload } = useSurahs();
  const { settings, update } = useSettings();
  const { sorted, sortKey, direction, toggleSort } = useSortedSurahs(surahs);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Başlık ve arama */}
      <section className="border-b border-line pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Kuran Rehberi
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl">
          Kur&apos;an-ı Kerim&apos;i kelime kelime araştırın
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          Çoklu meal karşılaştırması, kelime kökü analizi ve morfolojik arama.
        </p>

        <div className="mt-7 max-w-2xl">
          <GlobalSearchBox />
        </div>

        <nav aria-label="Hızlı erişim" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </nav>
      </section>

      {/* İstatistik şeridi */}
      <dl className="grid grid-cols-2 divide-line border-b border-line sm:grid-cols-4 sm:divide-x">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-1 py-6 sm:px-6 sm:first:pl-0">
            <dt className="text-xs uppercase tracking-wider text-ink-faint">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid divide-y divide-line border-b border-line lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <ContinueReading />
        <DailyVerse />
      </div>

      <RecentVerses />

      <section aria-labelledby="surah-list-heading" className="pt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <span id="surah-list-heading">
              <SectionLabel>Sureler</SectionLabel>
            </span>
            <p className="mt-1 text-sm text-ink-muted">Okumak istediğiniz sureyi seçin</p>
          </div>
          <div className="hidden sm:block">
            <SegmentedControl
              label="Sure listesi görünümü"
              value={settings.surahListView}
              onChange={(value) => update('surahListView', value)}
              options={[
                { value: 'table', label: <ListIcon className="h-4 w-4" />, title: 'Tablo görünümü' },
                { value: 'card', label: <GridIcon className="h-4 w-4" />, title: 'Kart görünümü' },
              ]}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="Sureler yükleniyor..." />
        ) : error ? (
          <ErrorState
            message={error}
            hint="Sunucu uykudaysa ilk istek biraz gecikebilir."
            onRetry={reload}
          />
        ) : (
          <>
            {settings.surahListView === 'card' ? (
              <SurahCards surahs={sorted} />
            ) : (
              <SurahTable
                surahs={sorted}
                sortKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              />
            )}
            <SurahMobileList surahs={sorted} />
          </>
        )}
      </section>
    </div>
  );
}
