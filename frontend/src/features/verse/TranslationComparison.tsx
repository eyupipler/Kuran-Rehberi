'use client';

import { Badge, EmptyState, SectionLabel } from '@/components/ui';
import { CompareIcon } from '@/components/ui/icons';
import { useSettings } from '@/context/SettingsContext';
import { MealWithHighlight } from '@/features/verse/highlightMeal';
import type { Translation } from '@/lib/api';

/**
 * Ayarlarda sabitlenen 2–4 meali yan yana gösterir (plan §7).
 * Seçili kelime varsa Türkçe karşılığı her mealde vurgulanır.
 */
export function TranslationComparison({
  translations,
  highlightTerm,
  onOpenSettings,
}: {
  translations: Translation[];
  highlightTerm: string | null;
  onOpenSettings?: () => void;
}) {
  const { settings } = useSettings();
  const pinned = settings.pinnedTranslators
    .map((code) => translations.find((translation) => translation.translatorCode === code))
    .filter((translation): translation is Translation => Boolean(translation));

  if (pinned.length === 0) {
    return (
      <EmptyState
        icon={<CompareIcon className="h-9 w-9" />}
        title="Karşılaştırma meali seçilmedi"
        description="Ayarlar panelinden en fazla dört meal sabitleyerek burada yan yana görebilirsiniz."
        action={
          onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-sm text-accent hover:underline"
            >
              Ayarları aç
            </button>
          ) : null
        }
      />
    );
  }

  return (
    <section aria-labelledby="comparison-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span id="comparison-heading">
          <SectionLabel>Sabitlenen mealler</SectionLabel>
        </span>
        <Badge>{pinned.length} meal</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pinned.map((translation) => (
          <article
            key={translation.translatorCode}
            className="rounded-sm bg-surface p-4 border border-line"
          >
            <h3 className="mb-2 border-b border-line pb-2 text-sm font-medium text-ink">
              {translation.translatorName}
            </h3>
            <p className="prose-text text-ink">
              <MealWithHighlight meal={translation.text} translationTr={highlightTerm} />
            </p>
          </article>
        ))}
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Sabitlenen mealleri üst çubuktaki ayarlar ikonundan değiştirebilirsiniz.
      </p>
    </section>
  );
}
