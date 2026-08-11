'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SearchField,
  SegmentedControl,
  Select,
} from '@/components/ui';
import { SearchIcon } from '@/components/ui/icons';
import { TranslatorSelect } from '@/features/quran/TranslatorSelect';
import { useSurahs } from '@/features/quran/useSurahs';
import { searchArabic, searchTranslations } from '@/lib/api';
import type { SearchResponse } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { transliterate } from '@/utils/transliteration';

type SearchType = 'translation' | 'arabic';
type Revelation = 'all' | 'Mekki' | 'Medeni';

const PAGE_SIZE = 25;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlighted({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(term.trim())})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded bg-marker px-0.5 text-marker-ink">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { surahs } = useSurahs();

  const urlQuery = searchParams.get('q') ?? '';
  const urlType = (searchParams.get('type') as SearchType) || 'translation';
  const urlTranslator = searchParams.get('translator') ?? '';
  const urlLanguage = searchParams.get('language') ?? 'all';
  const urlSurah = searchParams.get('surah') ?? '';
  const urlRevelation = (searchParams.get('revelation') as Revelation) || 'all';

  const [draft, setDraft] = useState(urlQuery);
  const [page, setPage] = useState(0);

  useEffect(() => setDraft(urlQuery), [urlQuery]);
  useEffect(() => setPage(0), [urlQuery, urlType, urlTranslator, urlLanguage, urlSurah, urlRevelation]);

  /** Tüm arama durumu URL'de tutulur; böylece sonuç paylaşılabilir ve geri tuşu çalışır. */
  const applyParams = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value && value !== 'all') next.set(key, value);
        else next.delete(key);
      }
      router.replace(`/search?${next.toString()}`);
    },
    [router, searchParams]
  );

  const filters = useMemo(
    () => ({
      surah: urlSurah ? Number(urlSurah) : null,
      revelation: urlRevelation === 'all' ? null : urlRevelation,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    [urlSurah, urlRevelation, page]
  );

  const { data, loading, error, reload } = useAsync<SearchResponse>(
    (signal) =>
      urlType === 'arabic'
        ? searchArabic(urlQuery, filters, { signal })
        : searchTranslations(
            urlQuery,
            {
              ...filters,
              translator: urlTranslator || null,
              language: urlLanguage === 'all' ? null : urlLanguage,
            },
            { signal }
          ),
    [urlQuery, urlType, urlTranslator, urlLanguage, filters],
    { enabled: urlQuery.trim().length >= 2 }
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Kuran'da ara"
        description="Meallerde ve Arapça metinde arama yapın; sonuç bağlantısını paylaşabilirsiniz."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          applyParams({ q: draft.trim() });
        }}
        className="mb-4"
      >
        <div className="flex gap-2">
          <SearchField
            label="Arama terimi"
            size="lg"
            placeholder={urlType === 'arabic' ? 'Arapça kelime...' : 'Aranacak kelime...'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            dir={urlType === 'arabic' ? 'rtl' : 'ltr'}
            className="flex-1"
          />
          <Button type="submit" variant="primary" className="h-14 px-6" disabled={draft.trim().length < 2}>
            Ara
          </Button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-sm bg-surface p-3 border border-line">
        <SegmentedControl
          label="Arama türü"
          value={urlType}
          onChange={(value) => applyParams({ type: value })}
          options={[
            { value: 'translation', label: 'Meal' },
            { value: 'arabic', label: 'Arapça' },
          ]}
        />

        <Select
          label="Sure"
          value={urlSurah}
          onChange={(event) => applyParams({ surah: event.target.value })}
          className="w-40"
        >
          <option value="">Tüm sureler</option>
          {surahs.map((surah) => (
            <option key={surah.id} value={surah.id}>
              {surah.id}. {surah.name}
            </option>
          ))}
        </Select>

        <Select
          label="İniş yeri"
          value={urlRevelation}
          onChange={(event) => applyParams({ revelation: event.target.value })}
          className="w-32"
        >
          <option value="all">Tümü</option>
          <option value="Mekki">Mekki</option>
          <option value="Medeni">Medeni</option>
        </Select>

        {urlType === 'translation' && (
          <>
            <Select
              label="Dil"
              value={urlLanguage}
              onChange={(event) => applyParams({ language: event.target.value })}
              className="w-32"
            >
              <option value="all">Tüm diller</option>
              <option value="tr">Türkçe</option>
              <option value="en">İngilizce</option>
            </Select>

            <TranslatorSelect
              label="Meal"
              value={urlTranslator}
              includeAllOption
              onChange={(code) => applyParams({ translator: code })}
              className="w-56"
            />
          </>
        )}
      </div>

      {urlQuery.trim().length < 2 ? (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10" />}
          title="Aramaya başlayın"
          description="En az iki karakter yazın. Sonuç sayfasının adresi paylaşılabilir."
        />
      ) : loading ? (
        <LoadingState label="Aranıyor..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10" />}
          title={`"${urlQuery}" için sonuç bulunamadı`}
          description="Farklı bir kelime deneyin veya filtreleri gevşetin."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            <strong className="text-ink">{data.total.toLocaleString('tr-TR')}</strong> sonuç
            {totalPages > 1 && ` · sayfa ${page + 1}/${totalPages}`}
          </p>

          <ul className="space-y-3">
            {data.results.map((result, index) => (
              <li
                key={`${result.surahId}-${result.verseNumber}-${result.translatorCode ?? ''}-${index}`}
                className="rounded-sm bg-surface p-4 border border-line"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/verse/${result.surahId}/${result.verseNumber}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {result.surahName} {result.surahId}:{result.verseNumber}
                  </Link>
                  {result.revelationType && (
                    <Badge tone={result.revelationType === 'Mekki' ? 'accent' : 'neutral'}>
                      {result.revelationType}
                    </Badge>
                  )}
                </div>

                <p className="arabic text-ink">
                  {urlType === 'arabic' ? (
                    <Highlighted text={result.arabicText} term={urlQuery} />
                  ) : (
                    result.arabicText
                  )}
                </p>
                <p className="mt-1 text-right text-xs italic text-ink-faint">
                  {transliterate(result.arabicText)}
                </p>

                {result.translation && (
                  <div className="mt-3 border-l-2 border-accent-soft pl-3">
                    <p className="prose-text text-ink">
                      {urlType === 'translation' ? (
                        <Highlighted text={result.translation} term={urlQuery} />
                      ) : (
                        result.translation
                      )}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">{result.translatorName}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Sonuç sayfaları" className="mt-6 flex items-center justify-center gap-3">
              <Button size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Önceki
              </Button>
              <span className="text-sm tabular-nums text-ink-muted">
                {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page + 1 >= totalPages}
              >
                Sonraki
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
