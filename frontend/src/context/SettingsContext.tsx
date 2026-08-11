'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS, usePersistentState } from '@/lib/storage';

export type FontSize = 'sm' | 'md' | 'lg';
export type SurahListView = 'card' | 'table';

export interface Settings {
  defaultTranslator: string;
  defaultLanguage: string;
  onlyMeal: boolean;
  compactMode: boolean;
  showTransliteration: boolean;
  fontSize: FontSize;
  surahListView: SurahListView;
  /** Meal karşılaştırmada sabitlenen mealler (2–4 arası). */
  pinnedTranslators: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  defaultTranslator: 'tr.diyanet',
  defaultLanguage: 'tr',
  onlyMeal: false,
  compactMode: false,
  showTransliteration: true,
  fontSize: 'md',
  surahListView: 'table',
  pinnedTranslators: ['tr.diyanet', 'tr.yazir'],
};

export const MAX_PINNED_TRANSLATORS = 4;

interface SettingsContextValue {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  togglePinnedTranslator: (code: string) => void;
  replaceSettings: (settings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
  togglePinnedTranslator: () => {},
  replaceSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { value, setValue, hydrated } = usePersistentState<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  );

  // Eski sürümden gelen kayıtlarda yeni alanlar eksik olabilir.
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...value }), [value]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('compact', settings.compactMode);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }, [settings.compactMode, settings.fontSize, hydrated]);

  const update = useCallback(
    <K extends keyof Settings>(key: K, next: Settings[K]) => {
      setValue((prev) => ({ ...DEFAULT_SETTINGS, ...prev, [key]: next }));
    },
    [setValue]
  );

  const togglePinnedTranslator = useCallback(
    (code: string) => {
      setValue((prev) => {
        const current = { ...DEFAULT_SETTINGS, ...prev };
        const pinned = current.pinnedTranslators.includes(code)
          ? current.pinnedTranslators.filter((c) => c !== code)
          : [...current.pinnedTranslators, code].slice(-MAX_PINNED_TRANSLATORS);
        return { ...current, pinnedTranslators: pinned };
      });
    },
    [setValue]
  );

  const replaceSettings = useCallback(
    (next: Partial<Settings>) => setValue({ ...DEFAULT_SETTINGS, ...next }),
    [setValue]
  );

  return (
    <SettingsContext.Provider
      value={{ settings, update, togglePinnedTranslator, replaceSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
