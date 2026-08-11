'use client';

import { CheckIcon } from '@/components/ui/icons';
import { useTranslators } from '@/features/quran/useTranslators';
import { MAX_PINNED_TRANSLATORS, useSettings } from '@/context/SettingsContext';

export function PinnedTranslators() {
  const { settings, togglePinnedTranslator } = useSettings();
  const { translators } = useTranslators();
  const pinned = settings.pinnedTranslators;

  return (
    <div>
      <p className="text-sm font-medium text-ink">Karşılaştırma mealleri</p>
      <p className="mb-2 text-xs text-ink-faint">
        Ayet sayfasında yan yana gösterilir — en fazla {MAX_PINNED_TRANSLATORS} meal.
      </p>

      <div className="max-h-56 overflow-y-auto rounded-sm border border-line">
        {translators.map((translator) => {
          const selected = pinned.includes(translator.code);
          return (
            <button
              key={translator.code}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => togglePinnedTranslator(translator.code)}
              className={`flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2 text-left text-sm transition-colors last:border-0 ${
                selected ? 'bg-accent-soft text-accent-ink' : 'text-ink-muted hover:bg-surface-sunken'
              }`}
            >
              <span className="truncate">{translator.name}</span>
              {selected && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
