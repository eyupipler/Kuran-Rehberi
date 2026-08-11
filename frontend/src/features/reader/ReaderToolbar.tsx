'use client';

import { IconButton, SegmentedControl } from '@/components/ui';
import { ListIcon, TextSizeIcon } from '@/components/ui/icons';
import { TranslatorSelect } from '@/features/quran/TranslatorSelect';
import { useSettings } from '@/context/SettingsContext';
import type { FontSize } from '@/context/SettingsContext';

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg'];

/**
 * Okuma sayfasında sayfa kaydırılırken üstte kalan araç çubuğu.
 * Tüm tercihler ayarlara yazılır; okuyucudan çıkınca da geçerli kalır.
 */
export function ReaderToolbar({
  translator,
  onTranslatorChange,
}: {
  translator: string;
  onTranslatorChange: (code: string) => void;
}) {
  const { settings, update } = useSettings();

  const cycleFontSize = () => {
    const next = FONT_SIZES[(FONT_SIZES.indexOf(settings.fontSize) + 1) % FONT_SIZES.length];
    update('fontSize', next);
  };

  return (
    <div className="sticky top-16 z-30 -mx-5 mb-6 border-b border-line bg-canvas/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <TranslatorSelect
          label="Meal"
          hideLabel
          value={translator}
          onChange={onTranslatorChange}
          className="min-w-0 flex-1 sm:max-w-xs"
        />

        <SegmentedControl
          label="Görünüm"
          value={settings.onlyMeal ? 'meal' : 'full'}
          onChange={(value) => update('onlyMeal', value === 'meal')}
          options={[
            { value: 'full', label: 'Arapça + Meal' },
            { value: 'meal', label: 'Sadece meal' },
          ]}
        />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => update('showTransliteration', !settings.showTransliteration)}
            aria-pressed={settings.showTransliteration}
            className={`h-8 rounded-sm border px-2.5 text-xs font-medium transition-colors ${
              settings.showTransliteration
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-line text-ink-muted hover:border-accent'
            }`}
          >
            Okunuş
          </button>

          <IconButton
            label={`Yazı boyutu: ${
              settings.fontSize === 'sm' ? 'küçük' : settings.fontSize === 'md' ? 'normal' : 'büyük'
            }`}
            size="sm"
            onClick={cycleFontSize}
          >
            <TextSizeIcon className="h-4 w-4" />
          </IconButton>

          <IconButton
            label="Kompakt mod"
            size="sm"
            active={settings.compactMode}
            onClick={() => update('compactMode', !settings.compactMode)}
          >
            <ListIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
