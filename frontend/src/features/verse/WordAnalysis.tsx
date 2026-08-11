'use client';

import Link from 'next/link';
import { partOfSpeechTr } from '@/features/verse/partOfSpeech';
import { transliterate, transliterateRoot } from '@/utils/transliteration';
import type { Word } from '@/lib/api';

export function WordAnalysis({
  words,
  selectedPosition,
  onSelect,
}: {
  words: Word[];
  selectedPosition: number | null;
  onSelect: (word: Word) => void;
}) {
  if (words.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-faint">
        Bu ayet için kelime analizi bulunmuyor.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-line">
      <table className="w-full border-collapse">
        <caption className="sr-only">Ayetteki kelimelerin morfolojik analizi</caption>
        <thead className="border-b border-line bg-surface-sunken">
          <tr>
            <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Kelime
            </th>
            <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Türkçe
            </th>
            <th scope="col" className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Kök
            </th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => {
            const selected = selectedPosition === word.position;
            return (
              <tr
                key={word.position}
                onClick={() => onSelect(word)}
                className={`cursor-pointer border-b border-line transition-colors last:border-0 ${
                  selected ? 'bg-accent-soft' : 'hover:bg-surface-sunken'
                }`}
              >
                <td className="px-3 py-2.5 text-right align-top">
                  <span className="block font-arabic text-lg text-ink">{word.arabicWord}</span>
                  <span className="block text-xs text-ink-faint">
                    {transliterate(word.arabicWord)}
                  </span>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="block text-sm text-ink-muted">
                    {word.translationTr || word.rootMeaningTr || '—'}
                  </span>
                  <span className="block text-xs italic text-ink-faint">
                    {partOfSpeechTr(word.partOfSpeech)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center align-top">
                  {word.root ? (
                    <Link
                      href={`/roots/${encodeURIComponent(word.root)}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-block"
                    >
                      <span className="block font-arabic text-base text-accent">
                        {word.root.split('').join(' ')}
                      </span>
                      <span className="block text-xs text-ink-faint">
                        {transliterateRoot(word.root)}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-faint">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
