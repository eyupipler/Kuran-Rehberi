'use client';

import { useSettings } from '@/context/SettingsContext';
import { VerseActions } from '@/features/verse/VerseActions';
import type { VerseActionTarget } from '@/features/verse/VerseActions';
import { transliterate } from '@/utils/transliteration';
import type { Verse } from '@/lib/api';

export function VerseRow({
  verse,
  surahId,
  surahName,
  onOpenNote,
}: {
  verse: Verse;
  surahId: number;
  surahName: string;
  onOpenNote: (target: VerseActionTarget) => void;
}) {
  const { settings } = useSettings();

  const target: VerseActionTarget = {
    surahId,
    verseNumber: verse.verseNumber,
    surahName,
    arabicText: verse.arabicText,
    translation: verse.translation,
    translatorName: verse.translatorName,
  };

  return (
    <article
      id={`ayet-${verse.verseNumber}`}
      className="verse-row group grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-6 last:border-b-0"
    >
      {/* Sol kenar boşluğunda ayet numarası */}
      <div className="pt-1 text-right">
        <span className="text-sm font-semibold tabular-nums text-accent">{verse.verseNumber}</span>
      </div>

      <div className="min-w-0">
        {!settings.onlyMeal && (
          <>
            <p className="arabic text-ink">{verse.arabicText}</p>
            {settings.showTransliteration && (
              <p className="mt-2 text-right text-xs italic text-ink-faint">
                {transliterate(verse.arabicText)}
              </p>
            )}
          </>
        )}

        {verse.translation ? (
          <p className={`prose-text text-ink ${settings.onlyMeal ? '' : 'mt-4'}`}>
            {verse.translation}
          </p>
        ) : (
          <p className="text-sm italic text-ink-faint">
            (Bu ayetin meâli önceki ayette verilmiştir)
          </p>
        )}

        {/* Aksiyonlar masaüstünde hover ile, mobilde her zaman görünür. */}
        <div className="mt-2 -ml-2 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <VerseActions verse={target} onOpenNote={() => onOpenNote(target)} />
        </div>
      </div>
    </article>
  );
}
