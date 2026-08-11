'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from '@/components/ui/icons';
import { useSurahs } from '@/features/quran/useSurahs';
import { parseQuery, suggestionHref } from '@/features/search/parseQuery';
import type { QuerySuggestion } from '@/features/search/parseQuery';

const KIND_LABELS: Record<QuerySuggestion['kind'], string> = {
  verse: 'Ayet',
  surah: 'Sure',
  root: 'Kök',
  search: 'Arama',
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { surahs } = useSurahs();
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => parseQuery(query, surahs).slice(0, 8), [query, surahs]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setHighlighted(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => setHighlighted(0), [query]);

  if (!open) return null;

  const go = (suggestion: QuerySuggestion) => {
    router.push(suggestionHref(suggestion));
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % Math.max(1, suggestions.length));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + suggestions.length) % Math.max(1, suggestions.length));
    }
    if (event.key === 'Enter' && suggestions[highlighted]) {
      event.preventDefault();
      go(suggestions[highlighted]);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hızlı arama"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-sm bg-surface border border-line shadow-overlay"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="h-5 w-5 flex-shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Sure, ayet, kelime veya kök ara... (ör. 2:255, bakara 255, rahmet)"
            aria-label="Hızlı arama"
            aria-controls="palette-results"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="hidden rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] text-ink-faint sm:block">
            Esc
          </kbd>
        </div>

        <ul id="palette-results" className="max-h-80 overflow-y-auto py-1">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.kind}-${suggestionHref(suggestion)}-${index}`}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => go(suggestion)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === highlighted ? 'bg-accent-soft' : ''
                }`}
              >
                <span className="w-12 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
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

          {query.trim() && suggestions.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-ink-faint">Eşleşme bulunamadı</li>
          )}

          {!query.trim() && (
            <li className="px-4 py-6 text-xs leading-relaxed text-ink-faint">
              <p className="mb-2 font-medium text-ink-muted">Örnek sorgular</p>
              <p>2:255 · bakara 255 · bakara · rahmet · رحمة · root:رحم</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
