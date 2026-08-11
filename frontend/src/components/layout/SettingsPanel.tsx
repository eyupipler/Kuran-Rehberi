'use client';

import { SegmentedControl, SidePanel, Select, Toggle } from '@/components/ui';
import { SectionLabel } from '@/components/ui';
import { ThemeChoice } from '@/components/layout/ThemeToggle';
import { DataBackup } from '@/features/backup/DataBackup';
import { InstallApp } from '@/features/pwa/InstallApp';
import { PinnedTranslators } from '@/features/quran/PinnedTranslators';
import { TranslatorSelect } from '@/features/quran/TranslatorSelect';
import { useSettings } from '@/context/SettingsContext';
import type { FontSize } from '@/context/SettingsContext';

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'Küçük' },
  { value: 'md', label: 'Normal' },
  { value: 'lg', label: 'Büyük' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line px-4 py-5 last:border-0">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, update } = useSettings();

  return (
    <SidePanel open={open} onClose={onClose} title="Ayarlar">
      <Section title="Görünüm">
        <ThemeChoice />
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Yazı boyutu</p>
          <SegmentedControl
            label="Yazı boyutu"
            value={settings.fontSize}
            options={FONT_SIZE_OPTIONS}
            onChange={(value) => update('fontSize', value)}
          />
        </div>
        <Toggle
          label="Kompakt mod"
          description="Ayetler arasındaki boşluğu azaltır"
          checked={settings.compactMode}
          onChange={(value) => update('compactMode', value)}
        />
      </Section>

      <Section title="Okuma">
        <Toggle
          label="Sadece meal"
          description="Arapça metni gizler"
          checked={settings.onlyMeal}
          onChange={(value) => update('onlyMeal', value)}
        />
        <Toggle
          label="Transliterasyon"
          description="Arapça metnin Latin okunuşunu gösterir"
          checked={settings.showTransliteration}
          onChange={(value) => update('showTransliteration', value)}
        />
      </Section>

      <Section title="Meal tercihleri">
        <Select
          label="Varsayılan dil"
          value={settings.defaultLanguage}
          onChange={(event) => update('defaultLanguage', event.target.value)}
        >
          <option value="tr">Türkçe</option>
          <option value="en">İngilizce</option>
          <option value="all">Tüm diller</option>
        </Select>

        <TranslatorSelect
          label="Varsayılan meal"
          value={settings.defaultTranslator}
          onChange={(code) => update('defaultTranslator', code)}
        />

        <PinnedTranslators />
      </Section>

      <Section title="Verilerim">
        <DataBackup />
      </Section>

      <Section title="Uygulama">
        <InstallApp />
      </Section>
    </SidePanel>
  );
}
