'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  defaultTranslator: string;
  defaultLanguage: string;
  onlyMeal: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateTranslator: (translator: string) => void;
  updateLanguage: (language: string) => void;
  updateOnlyMeal: (value: boolean) => void;
}

const defaultSettings: Settings = {
  defaultTranslator: 'tr.diyanet',
  defaultLanguage: 'tr',
  onlyMeal: false,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateTranslator: () => {},
  updateLanguage: () => {},
  updateOnlyMeal: () => {},
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

  const updateTranslator = (translator: string) => {
    setSettings((prev) => ({ ...prev, defaultTranslator: translator }));
  };

  const updateLanguage = (language: string) => {
    setSettings((prev) => ({ ...prev, defaultLanguage: language }));
  };

  const updateOnlyMeal = (value: boolean) => {
    setSettings((prev) => ({ ...prev, onlyMeal: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateTranslator, updateLanguage, updateOnlyMeal }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
