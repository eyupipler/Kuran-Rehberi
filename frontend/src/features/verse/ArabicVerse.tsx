'use client';

import { useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { transliterate } from '@/utils/transliteration';
import type { Word } from '@/lib/api';

export function ArabicVerse({
  arabicText,
  words,
  activeRoot,
  selectedPosition,
  onSelectWord,
  onHoverWord,
}: {
  arabicText: string;
  words: Word[];
  activeRoot: string | null;
  selectedPosition: number | null;
  onSelectWord: (word: Word) => void;
  onHoverWord: (root: string | null) => void;
}) {
  const { settings } = useSettings();
  const ordered = useMemo(() => [...words].sort((a, b) => a.position - b.position), [words]);

  return (
    <section className="mb-6 rounded-sm bg-surface p-6 border border-line sm:p-9">
      <p className="arabic arabic-lg text-ink">
        {ordered.length === 0
          ? arabicText
          : ordered.map((word) => {
              const highlighted = Boolean(activeRoot && word.root === activeRoot);
              const selected = selectedPosition === word.position;
              return (
                <span
                  key={word.position}
                  role={word.root ? 'button' : undefined}
                  tabIndex={word.root ? 0 : undefined}
                  title={word.root ? `Kök: ${word.root}` : undefined}
                  onMouseEnter={() => word.root && onHoverWord(word.root)}
                  onMouseLeave={() => onHoverWord(null)}
                  onFocus={() => word.root && onHoverWord(word.root)}
                  onBlur={() => onHoverWord(null)}
                  onClick={() => word.root && onSelectWord(word)}
                  onKeyDown={(event) => {
                    if (!word.root) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectWord(word);
                    }
                  }}
                  className={`mx-0.5 inline-block rounded-sm px-1.5 transition-colors duration-150 ${
                    word.root ? 'cursor-pointer' : ''
                  } ${
                    selected
                      ? 'bg-accent text-accent-contrast'
                      : highlighted
                        ? 'bg-accent-soft text-accent-ink'
                        : word.root
                          ? 'hover:bg-surface-sunken'
                          : ''
                  }`}
                >
                  {word.arabicWord}
                </span>
              );
            })}
      </p>

      {settings.showTransliteration && (
        <p className="mt-5 border-t border-line pt-4 text-right text-sm italic text-ink-faint">
          {transliterate(arabicText)}
        </p>
      )}
    </section>
  );
}
