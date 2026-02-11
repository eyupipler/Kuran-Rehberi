'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  defaultTranslator: string;
  defaultLanguage: string;
}

interface SettingsContextType {
  settings: Settings;
  updateTranslator: (translator: string) => void;
  updateLanguage: (language: string) => void;
}

const defaultSettings: Settings = {
  defaultTranslator: 'tr.diyanet',
  defaultLanguage: 'tr',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateTranslator: () => {},
  updateLanguage: () => {},
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

  return (
    <SettingsContext.Provider value={{ settings, updateTranslator, updateLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
