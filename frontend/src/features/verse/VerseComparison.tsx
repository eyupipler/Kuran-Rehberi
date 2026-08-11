'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, IconButton, LoadingState, SearchField } from '@/components/ui';
import { ChevronLeftIcon, CloseIcon } from '@/components/ui/icons';
import { useSurahs } from '@/features/quran/useSurahs';
import { MealWithHighlight } from '@/features/verse/highlightMeal';
import { normalizeTurkish } from '@/features/search/parseQuery';
import { errorMessage, getSurahVerses, getVerse } from '@/lib/api';
import type { Surah, Translation, VerseDetail, Word } from '@/lib/api';

interface Side {
  verse: VerseDetail;
  translations: Translation[];
  words: Word[];
}

function VersePanel({
  side,
  label,
  highlightRoot,
  onChange,
}: {
  side: Side;
  label: string;
  highlightRoot: string | null;
  onChange?: () => void;
}) {
  const turkish = side.translations.filter((translation) => translation.language === 'tr');
  const matchedWord = highlightRoot
    ? side.words.find((word) => word.root === highlightRoot)
    : undefined;
  const highlightTerm = matchedWord?.translationTr || matchedWord?.rootMeaningTr || null;
  const ordered = [...side.words].sort((a, b) => a.position - b.position);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-ink">
            {side.verse.surahName} · {side.verse.surahId}:{side.verse.verseNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/verse/${side.verse.surahId}/${side.verse.verseNumber}`}
            className="text-xs text-accent hover:underline"
          >
            Aç
          </Link>
          {onChange && (
            <Button size="sm" variant="ghost" onClick={onChange}>
              Değiştir
            </Button>
          )}
        </div>
      </div>

      <div className="mb-3 rounded-sm bg-surface-sunken p-3">
        <p className="arabic text-ink">
          {ordered.length === 0
            ? side.verse.arabicText
            : ordered.map((word, index) => (
                <span key={word.position}>
                  {index > 0 && ' '}
                  {highlightRoot && word.root === highlightRoot ? (
                    <mark className="rounded bg-marker px-0.5 not-italic text-marker-ink">
                      {word.arabicWord}
                    </mark>
                  ) : (
                    word.arabicWord
                  )}
                </span>
              ))}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {turkish.map((translation) => (
          <div key={translation.translatorCode} className="rounded-sm p-3 border border-line">
            <p className="mb-1 text-xs font-medium text-ink-faint">{translation.translatorName}</p>
            <p className="prose-text text-ink">
              <MealWithHighlight meal={translation.text} translationTr={highlightTerm} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerseComparison({
  current,
  highlightRoot,
  initialTarget,
  onClose,
}: {
  current: Side;
  highlightRoot: string | null;
  initialTarget: { surahId: number; verseNumber: number } | null;
  onClose: () => void;
}) {
  const { surahs } = useSurahs();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verseList, setVerseList] = useState<{ verseNumber: number; translation?: string | null }[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [target, setTarget] = useState<Side | null>(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surahFilter, setSurahFilter] = useState('');

  const loadVerse = async (surahId: number, verseNumber: number) => {
    setTargetLoading(true);
    setError(null);
    try {
      const data = await getVerse(surahId, verseNumber);
      setTarget({ verse: data.verse, translations: data.translations, words: data.words });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setTargetLoading(false);
    }
  };

  useEffect(() => {
    if (initialTarget) loadVerse(initialTarget.surahId, initialTarget.verseNumber);
    // Yalnızca dışarıdan gelen hedef değiştiğinde yüklenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTarget?.surahId, initialTarget?.verseNumber]);

  const chooseSurah = async (surah: Surah) => {
    setSelectedSurah(surah);
    setListLoading(true);
    setError(null);
    try {
      const data = await getSurahVerses(surah.id, 'tr.diyanet');
      setVerseList(
        data.verses.map((verse) => ({
          verseNumber: verse.verseNumber,
          translation: verse.translation,
        }))
      );
    } catch (cause) {
      setError(errorMessage(cause));
      setVerseList([]);
    } finally {
      setListLoading(false);
    }
  };

  const reset = () => {
    setTarget(null);
    setSelectedSurah(null);
    setVerseList([]);
    setSurahFilter('');
  };

  const filteredSurahs = useMemo(() => {
    const normalized = normalizeTurkish(surahFilter);
    if (!normalized) return surahs;
    return surahs.filter(
      (surah) =>
        normalizeTurkish(surah.name).includes(normalized) ||
        String(surah.id) === surahFilter.trim()
    );
  }, [surahs, surahFilter]);

  const sharedRoots = useMemo(() => {
    if (!target) return [];
    const currentRoots = new Set(current.words.map((word) => word.root).filter(Boolean));
    return [
      ...new Set(
        target.words
          .map((word) => word.root)
          .filter((root): root is string => Boolean(root) && currentRoots.has(root))
      ),
    ];
  }, [current.words, target]);

  return (
    <section className="mb-6 overflow-hidden rounded-sm bg-surface border border-line">
      <div className="flex items-center justify-between border-b border-line bg-accent-soft px-4 py-2.5">
        <h2 className="text-sm font-semibold text-accent-ink">Ayet karşılaştırma</h2>
        <IconButton label="Karşılaştırmayı kapat" size="sm" onClick={onClose}>
          <CloseIcon className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="grid divide-y divide-line lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="p-4">
          <VersePanel side={current} label="Mevcut ayet" highlightRoot={highlightRoot} />
        </div>

        <div className="flex min-h-[24rem] flex-col p-4">
          {targetLoading ? (
            <LoadingState label="Ayet yükleniyor..." compact />
          ) : error ? (
            <p role="alert" className="py-8 text-center text-sm text-danger">
              {error}
            </p>
          ) : target ? (
            <VersePanel
              side={target}
              label="Karşılaştırılan ayet"
              highlightRoot={highlightRoot}
              onChange={reset}
            />
          ) : selectedSurah ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <IconButton
                  label="Sure seçimine dön"
                  size="sm"
                  onClick={() => {
                    setSelectedSurah(null);
                    setVerseList([]);
                  }}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </IconButton>
                <p className="text-sm font-medium text-ink">{selectedSurah.name} — ayet seçin</p>
              </div>
              {listLoading ? (
                <LoadingState compact />
              ) : (
                <ul className="min-h-0 flex-1 overflow-y-auto rounded-sm border border-line">
                  {verseList.map((verse) => (
                    <li key={verse.verseNumber}>
                      <button
                        type="button"
                        onClick={() => loadVerse(selectedSurah.id, verse.verseNumber)}
                        className="flex w-full items-start gap-2.5 border-b border-line px-3 py-2 text-left transition-colors last:border-0 hover:bg-surface-sunken"
                      >
                        <span className="w-8 flex-shrink-0 text-xs font-medium tabular-nums text-accent">
                          {verse.verseNumber}
                        </span>
                        <span className="line-clamp-2 text-xs text-ink-muted">
                          {verse.translation || '—'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <SearchField
                label="Sure ara"
                placeholder="Sure ara..."
                value={surahFilter}
                onChange={(event) => setSurahFilter(event.target.value)}
                className="mb-3"
              />
              <ul className="min-h-0 flex-1 overflow-y-auto rounded-sm border border-line">
                {filteredSurahs.map((surah) => (
                  <li key={surah.id}>
                    <button
                      type="button"
                      onClick={() => chooseSurah(surah)}
                      className="flex w-full items-center gap-2.5 border-b border-line px-3 py-2 text-left transition-colors last:border-0 hover:bg-surface-sunken"
                    >
                      <span className="w-6 flex-shrink-0 text-right text-xs tabular-nums text-ink-faint">
                        {surah.id}
                      </span>
                      <span className="flex-1 text-sm text-ink">{surah.name} Suresi</span>
                      <span className="text-xs text-ink-faint">{surah.totalVerses} ayet</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {sharedRoots.length > 0 && (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Ortak kökler
          </p>
          <div className="flex flex-wrap gap-2">
            {sharedRoots.map((root) => (
              <Link key={root} href={`/roots/${encodeURIComponent(root)}`}>
                <Badge tone="accent" className="font-arabic text-base">
                  {root}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
