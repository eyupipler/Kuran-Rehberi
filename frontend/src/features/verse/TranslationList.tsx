'use client';

import { useMemo, useState } from 'react';
import { Badge, SearchField, Select } from '@/components/ui';
import { languageLabel } from '@/features/quran/useTranslators';
import { MealWithHighlight } from '@/features/verse/highlightMeal';
import type { Translation } from '@/lib/api';

export function TranslationList({
  translations,
  highlightTerm,
  defaultLanguage,
}: {
  translations: Translation[];
  highlightTerm: string | null;
  defaultLanguage: string;
}) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [filter, setFilter] = useState('');

  const languages = useMemo(
    () => [...new Set(translations.map((translation) => translation.language))],
    [translations]
  );

  const visible = useMemo(() => {
    const term = filter.trim().toLocaleLowerCase('tr-TR');
    return translations.filter((translation) => {
      if (language !== 'all' && translation.language !== language) return false;
      if (!term) return true;
      return (
        translation.translatorName.toLocaleLowerCase('tr-TR').includes(term) ||
        translation.text.toLocaleLowerCase('tr-TR').includes(term)
      );
    });
  }, [translations, language, filter]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField
          label="Meallerde filtrele"
          placeholder="Meal veya tercüman ara..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="flex-1"
        />
        <Select
          label="Dil"
          hideLabel
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="sm:w-40"
        >
          <option value="all">Tüm diller</option>
          {languages.map((code) => (
            <option key={code} value={code}>
              {languageLabel(code)}
            </option>
          ))}
        </Select>
      </div>

      <p className="mb-3 text-xs text-ink-faint">{visible.length} meal gösteriliyor</p>

      <div className="space-y-3">
        {visible.map((translation) => (
          <article
            key={translation.translatorCode}
            className="rounded-sm bg-surface p-4 border border-line"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-ink">{translation.translatorName}</h3>
              <Badge>{languageLabel(translation.language)}</Badge>
            </div>
            <p
              className={`prose-text text-ink ${
                translation.language === 'ar' ? 'arabic' : ''
              }`}
            >
              {translation.language === 'tr' ? (
                <MealWithHighlight meal={translation.text} translationTr={highlightTerm} />
              ) : (
                translation.text
              )}
            </p>
          </article>
        ))}

        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-faint">
            Bu filtreye uyan meal bulunamadı.
          </p>
        )}
      </div>
    </section>
  );
}
