'use client';

import type { ReactNode } from 'react';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { NotesProvider } from '@/context/NotesContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <HistoryProvider>
          <NotesProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </NotesProvider>
        </HistoryProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
