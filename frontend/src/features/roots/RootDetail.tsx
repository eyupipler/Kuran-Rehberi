'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Select,
  Tabs,
} from '@/components/ui';
import { ChevronLeftIcon, RootIcon } from '@/components/ui/icons';
import { useSettings } from '@/context/SettingsContext';
import { TranslatorSelect } from '@/features/quran/TranslatorSelect';
import { RootDistributionChart } from '@/features/roots/RootDistribution';
import { ArabicWithHighlight, MealWithHighlight } from '@/features/verse/highlightMeal';
import { partOfSpeechTr } from '@/features/verse/partOfSpeech';
import { getRoot } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { transliterate, transliterateRoot } from '@/utils/transliteration';

type TabValue = 'occurrences' | 'forms' | 'distribution';

const VISIBLE_STEP = 50;

interface Filters {
  surah: string;
  revelation: string;
  pos: string;
  form: string;
}

const EMPTY_FILTERS: Filters = { surah: '', revelation: '', pos: '', form: '' };

export function RootDetail({ rootParam }: { rootParam: string }) {
  const root = decodeURIComponent(rootParam);
  const { settings, update } = useSettings();
  const [tab, setTab] = useState<TabValue>('occurrences');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);

  const { data, loading, error, reload } = useAsync(
    (signal) =>
      getRoot(
        root,
        {
          translator: settings.defaultTranslator,
          surah: filters.surah ? Number(filters.surah) : null,
          revelation: (filters.revelation || null) as 'Mekki' | 'Medeni' | null,
          pos: filters.pos || null,
          form: filters.form || null,
        },
        { signal }
      ),
    [root, settings.defaultTranslator, filters]
  );

  const meanings = useMemo(() => {
    if (!data) return [];
    const raw =
      data.root.meaningTr ||
      [
        ...new Set(
          data.occurrences
            .map((occurrence) => occurrence.translationTr)
            .filter(Boolean)
            .flatMap((value) =>
              value!.split(/[,،/;]+/).map((part) => part.trim()).filter((part) => part.length > 1)
            )
        ),
      ]
        .slice(0, 6)
        .join(', ');
    return raw ? raw.split(',').map((part) => part.trim()).filter(Boolean) : [];
  }, [data]);

  // Bu alan API'ye sonradan eklendi; eski bir sürüm yanıt verirse filtre gizlenir.
  const partsOfSpeech = data?.partsOfSpeech ?? [];

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setVisibleCount(VISIBLE_STEP);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  if (loading) return <LoadingState label="Kök yükleniyor..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState message={error} onRetry={reload} />
        <div className="text-center">
          <Link href="/roots" className="text-sm text-accent hover:underline">
            Kelime köklerine dön
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const visible = data.occurrences.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/roots"
        className="mb-4 inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Kelime kökleri
      </Link>

      <header className="mb-6 rounded-sm bg-surface p-5 border border-line sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            {/* Amiri'nin uzun çıkıntıları alt satıra taşmasın diye ayrı satır kutusu. */}
            <div className="flex items-baseline gap-3 pb-6">
              <h1 className="font-arabic text-4xl leading-none text-accent sm:text-5xl">
                {data.root.root}
              </h1>
              <span className="text-lg italic text-ink-faint">
                {transliterateRoot(data.root.root)}
              </span>
            </div>
            {meanings.length > 0 && (
              <p className="max-w-xl text-sm text-ink">{meanings.join(' · ')}</p>
            )}
            {!data.root.meaningTr && meanings.length > 0 && (
              <p className="mt-1 text-xs italic text-ink-faint">
                * Anlam, kelime kullanımlarından türetilmiştir
              </p>
            )}
          </div>

          <dl className="flex gap-5 rounded-sm px-4 py-3 text-center border border-line">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-faint">Kullanım</dt>
              <dd className="text-2xl font-semibold tabular-nums text-ink">
                {data.root.occurrenceCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-faint">Sure</dt>
              <dd className="text-2xl font-semibold tabular-nums text-ink">
                {data.distribution.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-faint">Biçim</dt>
              <dd className="text-2xl font-semibold tabular-nums text-ink">
                {data.derivedForms.length}
              </dd>
            </div>
          </dl>
        </div>

        {data.root.meaningEn && (
          <p className="mt-4 border-t border-line pt-4 text-sm italic text-ink-muted">
            <span className="mr-2 not-italic text-xs uppercase tracking-wider text-ink-faint">
              İngilizce
            </span>
            {data.root.meaningEn}
          </p>
        )}
      </header>

      <Tabs
        label="Kök detayları"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'occurrences', label: 'Ayetler', count: data.occurrences.length },
          { value: 'forms', label: 'Biçimler', count: data.derivedForms.length },
          { value: 'distribution', label: 'Dağılım' },
        ]}
      />

      {tab === 'occurrences' && (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-3 rounded-sm bg-surface p-3 border border-line">
            <Select
              label="Sure"
              value={filters.surah}
              onChange={(event) => setFilter('surah', event.target.value)}
              className="w-40"
            >
              <option value="">Tüm sureler</option>
              {data.distribution.map((item) => (
                <option key={item.surahId} value={item.surahId}>
                  {item.surahId}. {item.surahName} ({item.count})
                </option>
              ))}
            </Select>

            <Select
              label="İniş yeri"
              value={filters.revelation}
              onChange={(event) => setFilter('revelation', event.target.value)}
              className="w-32"
            >
              <option value="">Tümü</option>
              <option value="Mekki">Mekki</option>
              <option value="Medeni">Medeni</option>
            </Select>

            {/* partsOfSpeech eski API sürümünde yok; alan gelmezse filtre gizlenir. */}
            {partsOfSpeech.length > 0 && (
              <Select
                label="Kelime türü"
                value={filters.pos}
                onChange={(event) => setFilter('pos', event.target.value)}
                className="w-40"
              >
                <option value="">Tümü</option>
                {partsOfSpeech.map((item) => (
                  <option key={item.value} value={item.value}>
                    {partOfSpeechTr(item.value)} ({item.count})
                  </option>
                ))}
              </Select>
            )}

            <Select
              label="Kelime biçimi"
              value={filters.form}
              onChange={(event) => setFilter('form', event.target.value)}
              className="w-40"
            >
              <option value="">Tümü</option>
              {data.derivedForms.map((form) => (
                <option key={form.word} value={form.word}>
                  {form.word} ({form.count})
                </option>
              ))}
            </Select>

            <TranslatorSelect
              label="Meal"
              value={settings.defaultTranslator}
              onChange={(code) => update('defaultTranslator', code)}
              className="w-52"
            />

            {hasFilters && (
              <Button size="sm" variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
                Filtreleri temizle
              </Button>
            )}
          </div>

          {data.occurrences.length === 0 ? (
            <EmptyState
              icon={<RootIcon className="h-10 w-10" />}
              title="Bu filtreyle geçiş bulunamadı"
              description="Filtreleri temizleyerek tüm kullanımları görebilirsiniz."
            />
          ) : (
            <>
              <ul className="space-y-3">
                {visible.map((occurrence, index) => (
                  <li
                    key={`${occurrence.surahId}-${occurrence.verseNumber}-${occurrence.wordPosition}-${index}`}
                    className="rounded-sm bg-surface p-4 border border-line"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                      <Link
                        href={`/verse/${occurrence.surahId}/${occurrence.verseNumber}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        {occurrence.surahName} Suresi {occurrence.surahId}:{occurrence.verseNumber}
                      </Link>

                      <div className="flex items-center gap-2">
                        <span className="text-center">
                          {/* Harekeler kırpılmasın diye dikey iç boşluk ve satır yüksekliği. */}
                          <span className="block rounded bg-accent-soft px-2 py-1.5 font-arabic text-lg leading-[1.6] text-accent-ink">
                            {occurrence.word}
                          </span>
                          <span className="block text-[10px] text-ink-faint">
                            {occurrence.translationTr || transliterate(occurrence.word)}
                          </span>
                        </span>
                        {occurrence.partOfSpeech && (
                          <Badge>{partOfSpeechTr(occurrence.partOfSpeech)}</Badge>
                        )}
                        {occurrence.revelationType && (
                          <Badge tone={occurrence.revelationType === 'Mekki' ? 'accent' : 'neutral'}>
                            {occurrence.revelationType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <p className="prose-text text-ink">
                        {occurrence.verseMealTr ? (
                          <MealWithHighlight
                            meal={occurrence.verseMealTr}
                            translationTr={[occurrence.translationTr, data.root.meaningTr]
                              .filter(Boolean)
                              .join(', ')}
                          />
                        ) : (
                          <span className="italic text-ink-faint">Meal bulunamadı.</span>
                        )}
                      </p>

                      {!settings.onlyMeal && (
                        <p className="arabic text-ink">
                          <ArabicWithHighlight
                            text={occurrence.arabicText}
                            targetWord={occurrence.word}
                            wordPosition={occurrence.wordPosition}
                          />
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {visibleCount < data.occurrences.length && (
                <div className="mt-5 text-center">
                  <Button
                    variant="primary"
                    onClick={() => setVisibleCount((count) => count + VISIBLE_STEP)}
                  >
                    Daha fazla göster ({data.occurrences.length - visibleCount} kaldı)
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'forms' && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.derivedForms.map((form) => (
            <li key={form.word} className="rounded-sm bg-surface p-4 border border-line">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span>
                  <span className="block font-arabic text-2xl text-ink">{form.word}</span>
                  <span className="block text-xs text-ink-faint">{transliterate(form.word)}</span>
                </span>
                <Badge tone="accent">{form.count}x</Badge>
              </div>
              {form.lemma && (
                <p className="text-xs text-ink-muted">
                  Lemma: <span className="font-arabic">{form.lemma}</span>
                </p>
              )}
              {form.partOfSpeech && (
                <Badge className="mt-2">{partOfSpeechTr(form.partOfSpeech)}</Badge>
              )}
              <button
                type="button"
                onClick={() => {
                  setFilter('form', form.word);
                  setTab('occurrences');
                }}
                className="mt-3 block text-xs text-accent hover:underline"
              >
                Bu biçimin ayetlerini gör →
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === 'distribution' && <RootDistributionChart distribution={data.distribution} />}
    </div>
  );
}
