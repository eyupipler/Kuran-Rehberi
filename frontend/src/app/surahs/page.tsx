'use client';

import { useMemo, useState } from 'react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SearchField,
  SegmentedControl,
} from '@/components/ui';
import { BookIcon, GridIcon, ListIcon } from '@/components/ui/icons';
import { useSettings } from '@/context/SettingsContext';
import {
  SurahCards,
  SurahMobileList,
  SurahTable,
  useSortedSurahs,
} from '@/features/quran/SurahList';
import { useSurahs } from '@/features/quran/useSurahs';
import { normalizeTurkish } from '@/features/search/parseQuery';

type RevelationFilter = 'all' | 'Mekki' | 'Medeni';

export default function SurahsPage() {
  const { surahs, loading, error, reload } = useSurahs();
  const { settings, update } = useSettings();
  const [term, setTerm] = useState('');
  const [revelation, setRevelation] = useState<RevelationFilter>('all');

  const filtered = useMemo(() => {
    const normalized = normalizeTurkish(term);
    return surahs.filter((surah) => {
      if (revelation !== 'all' && surah.revelationType !== revelation) return false;
      if (!normalized) return true;
      return (
        normalizeTurkish(surah.name).includes(normalized) ||
        normalizeTurkish(surah.englishName).includes(normalized) ||
        String(surah.id) === term.trim()
      );
    });
  }, [surahs, term, revelation]);

  const { sorted, sortKey, direction, toggleSort } = useSortedSurahs(filtered);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Sureler"
        description={`${surahs.length || 114} sure — isim, numara veya iniş yerine göre filtreleyin`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField
          label="Sure ara"
          placeholder="Sure ara... (ör. bakara, 18)"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          className="flex-1"
        />

        <SegmentedControl
          label="İniş yeri"
          value={revelation}
          onChange={setRevelation}
          options={[
            { value: 'all', label: 'Tümü' },
            { value: 'Mekki', label: 'Mekki' },
            { value: 'Medeni', label: 'Medeni' },
          ]}
        />

        <div className="hidden sm:block">
          <SegmentedControl
            label="Görünüm"
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
        <ErrorState message={error} onRetry={reload} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<BookIcon className="h-10 w-10" />}
          title="Sure bulunamadı"
          description="Farklı bir arama terimi veya filtre deneyin."
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
    </div>
  );
}
