'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/storage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

/**
 * İlk boyamada yanlış temanın görünmemesi için <head> içinde çalışan betik.
 * ThemeProvider hidrasyondan sonra aynı mantığı devralır.
 */
export const themeBootstrapScript = `(function(){try{
var k=${JSON.stringify(STORAGE_KEYS.theme)};
var p=localStorage.getItem(k);
if(p){p=JSON.parse(p)}
if(p!=='light'&&p!=='dark'&&p!=='system'){p='light'}
var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',d);
}catch(e){}})();`;

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference: ThemePreference): 'light' | 'dark' {
  const dark = preference === 'dark' || (preference === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
  return dark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Varsayılan açık tema; kullanıcı isterse koyu veya sistem seçebilir.
    let stored: ThemePreference = 'light';
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.theme);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed === 'light' || parsed === 'dark' || parsed === 'system') stored = parsed;
    } catch {
      stored = 'light';
    }
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(applyTheme('system'));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    setResolvedTheme(applyTheme(next));
    try {
      localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(next));
    } catch {
      // Depolama yoksa tercih yalnızca bu oturumda geçerli olur.
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
