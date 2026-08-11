'use client';

import { Select } from '@/components/ui';
import { languageLabel, useTranslators } from '@/features/quran/useTranslators';

export function TranslatorSelect({
  label = 'Meal',
  value,
  onChange,
  hideLabel = false,
  includeAllOption = false,
  className,
}: {
  label?: string;
  value: string;
  onChange: (code: string) => void;
  hideLabel?: boolean;
  includeAllOption?: boolean;
  className?: string;
}) {
  const { byLanguage } = useTranslators();

  return (
    <Select
      label={label}
      hideLabel={hideLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
    >
      {includeAllOption && <option value="">Tüm mealler</option>}
      {[...byLanguage.entries()].map(([language, items]) => (
        <optgroup key={language} label={languageLabel(language)}>
          {items.map((translator) => (
            <option key={translator.code} value={translator.code}>
              {translator.name}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
