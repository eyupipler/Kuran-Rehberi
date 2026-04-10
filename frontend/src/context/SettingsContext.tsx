'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'sm' | 'md' | 'lg';

interface Settings {
  defaultTranslator: string;
  defaultLanguage: string;
  onlyMeal: boolean;
  compactMode: boolean;
  fontSize: FontSize;
}

interface SettingsContextType {
  settings: Settings;
  updateTranslator: (translator: string) => void;
  updateLanguage: (language: string) => void;
  updateOnlyMeal: (value: boolean) => void;
  updateCompactMode: (value: boolean) => void;
  updateFontSize: (value: FontSize) => void;
}

const defaultSettings: Settings = {
  defaultTranslator: 'tr.diyanet',
  defaultLanguage: 'tr',
  onlyMeal: false,
  compactMode: false,
  fontSize: 'md',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateTranslator: () => {},
  updateLanguage: () => {},
  updateOnlyMeal: () => {},
  updateCompactMode: () => {},
  updateFontSize: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kuran-rehberi-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('kuran-rehberi-settings', JSON.stringify(settings));
    }
  }, [settings, loaded]);

  // Apply compact mode and font size classes to <html>
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.classList.toggle('compact', settings.compactMode);
    root.setAttribute('data-font-size', settings.fontSize);
  }, [settings.compactMode, settings.fontSize, loaded]);

  const updateTranslator = (translator: string) => {
    setSettings((prev) => ({ ...prev, defaultTranslator: translator }));
  };

  const updateLanguage = (language: string) => {
    setSettings((prev) => ({ ...prev, defaultLanguage: language }));
  };

  const updateOnlyMeal = (value: boolean) => {
    setSettings((prev) => ({ ...prev, onlyMeal: value }));
  };

  const updateCompactMode = (value: boolean) => {
    setSettings((prev) => ({ ...prev, compactMode: value }));
  };

  const updateFontSize = (value: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateTranslator, updateLanguage, updateOnlyMeal, updateCompactMode, updateFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
