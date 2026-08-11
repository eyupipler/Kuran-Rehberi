'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchField } from '@/components/ui';
import { useSurahs } from '@/features/quran/useSurahs';
import { parseQuery, suggestionHref } from '@/features/search/parseQuery';

const KIND_LABELS = {
  verse: 'Ayet',
  surah: 'Sure',
  root: 'Kök',
  search: 'Arama',
} as const;

export function GlobalSearchBox() {
  const router = useRouter();
  const { surahs } = useSurahs();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => parseQuery(query, surahs).slice(0, 6), [query, surahs]);
  const showSuggestions = focused && query.trim().length > 0 && suggestions.length > 0;

  return (
    <div className="relative">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (suggestions[0]) router.push(suggestionHref(suggestions[0]));
        }}
      >
        <SearchField
          label="Kuran'da ara"
          size="lg"
          placeholder="Kur'an'da ara — ayet, sure, meal, kelime veya kök"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          // Öneriye tıklama blur'dan sonra gerçekleşiyor; kapatmayı geciktir.
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        />
      </form>

      {showSuggestions && (
        <ul className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-sm bg-surface border border-line shadow-overlay">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.kind}-${index}`}>
              <button
                type="button"
                onClick={() => router.push(suggestionHref(suggestion))}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent-soft"
              >
                <span className="w-11 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  {KIND_LABELS[suggestion.kind]}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm text-ink ${
                    suggestion.kind === 'root' ? 'font-arabic text-base' : ''
                  }`}
                >
                  {suggestion.title}
                </span>
                <span className="flex-shrink-0 text-xs text-ink-faint">{suggestion.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
