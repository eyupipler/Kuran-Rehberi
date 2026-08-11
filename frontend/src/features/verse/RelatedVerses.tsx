'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { LinkIcon } from '@/components/ui/icons';
import type { RelatedVerse } from '@/lib/api';

interface Props {
  verses: RelatedVerse[];
  currentSurahId: number;
  currentVerseNumber: number;
  onCompare: (verse: RelatedVerse) => void;
}

interface PositionedVerse {
  verse: RelatedVerse;
  x: number;
  y: number;
}

const VIEWBOX = 460;
const CENTER = VIEWBOX / 2;
const RINGS = [96, 168];
const INNER_RING_CAPACITY = 10;

/**
 * Bağlantıları halkalara dağıtır. Tek halkada 10'dan fazla düğüm olduğunda
 * etiketler üst üste bindiği için yarısı dış halkaya taşınır.
 */
function layout(verses: RelatedVerse[]): PositionedVerse[] {
  const useTwoRings = verses.length > INNER_RING_CAPACITY;
  const innerCount = useTwoRings ? Math.ceil(verses.length / 2) : verses.length;

  return verses.map((verse, index) => {
    const ring = index < innerCount ? 0 : 1;
    const countInRing = ring === 0 ? innerCount : verses.length - innerCount;
    const indexInRing = ring === 0 ? index : index - innerCount;
    // Dış halkayı yarım adım kaydırarak etiketlerin hizalanmasını önle.
    const offset = ring === 1 ? Math.PI / countInRing : 0;
    const angle = (indexInRing / countInRing) * Math.PI * 2 - Math.PI / 2 + offset;
    const radius = RINGS[ring];

    return {
      verse,
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
    };
  });
}

function verseKey(verse: RelatedVerse): string {
  return `${verse.surahId}:${verse.verseNumber}`;
}

export function RelatedVerses({ verses, currentSurahId, currentVerseNumber, onCompare }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const positioned = useMemo(() => layout(verses), [verses]);

  const bySurah = useMemo(() => {
    const groups = new Map<number, { name: string; items: RelatedVerse[] }>();
    for (const verse of verses) {
      const group = groups.get(verse.surahId) || { name: verse.surahName, items: [] };
      group.items.push(verse);
      groups.set(verse.surahId, group);
    }
    return [...groups.entries()]
      .map(([surahId, group]) => ({ surahId, ...group }))
      .sort((a, b) => b.items.length - a.items.length || a.surahId - b.surahId);
  }, [verses]);

  if (verses.length === 0) {
    return (
      <EmptyState
        icon={<LinkIcon className="h-7 w-7" />}
        title="İlgili ayet kaydı yok"
        description="Bu ayet için anlam bütünlüğü bağlantısı tanımlanmamış."
      />
    );
  }

  const mutualCount = verses.filter((verse) => verse.mutual).length;
  const active = positioned.find((item) => verseKey(item.verse) === hovered)?.verse ?? null;

  return (
    <section>
      <dl className="mb-6 flex flex-wrap gap-x-10 gap-y-2 border-b border-line pb-5">
        <div>
          <dt className="text-xs uppercase tracking-wider text-ink-faint">Bağlantı</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink">{verses.length}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-ink-faint">Sure</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink">{bySurah.length}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-ink-faint">Karşılıklı</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink">{mutualCount}</dd>
        </div>
      </dl>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Bağlantı şeması — erişilebilir kaynak sağdaki listedir. */}
        <figure className="m-0">
          <svg
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            className="w-full"
            role="img"
            aria-label={`${currentSurahId}:${currentVerseNumber} ayetinin ${verses.length} bağlantısını gösteren şema`}
          >
            {positioned.map((item) => {
              const key = verseKey(item.verse);
              return (
                <line
                  key={`line-${key}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={item.x}
                  y2={item.y}
                  className={hovered === key ? 'stroke-accent' : 'stroke-line-strong'}
                  strokeWidth={hovered === key ? 2 : 1}
                  strokeDasharray={item.verse.mutual ? undefined : '3 3'}
                />
              );
            })}

            {positioned.map((item) => {
              const key = verseKey(item.verse);
              const isHovered = hovered === key;
              return (
                <g
                  key={key}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={item.x}
                    cy={item.y}
                    r={isHovered ? 7 : 5}
                    className={
                      item.verse.mutual ? 'fill-accent stroke-canvas' : 'fill-canvas stroke-accent'
                    }
                    strokeWidth={2}
                  />
                  <text
                    x={item.x}
                    y={item.y + (item.y < CENTER ? -12 : 19)}
                    textAnchor="middle"
                    className={`text-[10px] tabular-nums ${
                      isHovered ? 'fill-accent font-semibold' : 'fill-ink-faint'
                    }`}
                  >
                    {key}
                  </text>
                </g>
              );
            })}

            <circle cx={CENTER} cy={CENTER} r={30} className="fill-accent" />
            <text
              x={CENTER}
              y={CENTER + 4}
              textAnchor="middle"
              className="fill-accent-contrast text-[11px] font-semibold tabular-nums"
            >
              {currentSurahId}:{currentVerseNumber}
            </text>
          </svg>

          <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
              Karşılıklı
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-accent" />
              Tek yönlü
            </span>
          </figcaption>

          {active && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-sm font-medium text-ink">
                {active.surahName} {active.surahId}:{active.verseNumber}
                {active.revelationType && (
                  <span className="ml-2 text-xs font-normal text-ink-faint">
                    {active.revelationType}
                  </span>
                )}
              </p>
              <p className="arabic mt-1 line-clamp-3 text-ink-muted" style={{ fontSize: '1.05rem' }}>
                {active.arabicText}
              </p>
            </div>
          )}
        </figure>

        {/* Sureye göre gruplanmış liste */}
        <div className="space-y-5">
          {bySurah.map((group) => (
            <section key={group.surahId}>
              <h3 className="mb-2 flex items-baseline gap-2 border-b border-line pb-1.5">
                <Link
                  href={`/surah/${group.surahId}`}
                  className="text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  {group.name} Suresi
                </Link>
                <span className="text-xs tabular-nums text-ink-faint">
                  {group.items.length} bağlantı
                </span>
              </h3>

              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((verse) => {
                  const key = verseKey(verse);
                  return (
                    <li key={key} className="flex">
                      <Link
                        href={`/verse/${verse.surahId}/${verse.verseNumber}`}
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(key)}
                        onBlur={() => setHovered(null)}
                        className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs tabular-nums transition-colors ${
                          hovered === key
                            ? 'border-accent bg-accent-soft text-accent-ink'
                            : 'border-line text-ink-muted hover:border-accent hover:text-accent'
                        }`}
                      >
                        {verse.mutual && (
                          <span
                            aria-hidden="true"
                            className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                          />
                        )}
                        {key}
                      </Link>
                      <button
                        type="button"
                        onClick={() => onCompare(verse)}
                        aria-label={`${key} ayetini karşılaştır`}
                        title="Karşılaştır"
                        className="-ml-px rounded-sm border border-line px-1.5 text-xs text-ink-faint transition-colors hover:border-accent hover:text-accent"
                      >
                        ⇄
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
