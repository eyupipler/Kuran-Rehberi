'use client';

import { createContext, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS, usePersistentState } from '@/lib/storage';

export interface HistoryEntry {
  surahId: number;
  verseNumber: number;
  surahName: string;
  snippet: string;
  visitedAt: string;
}

const MAX_ENTRIES = 12;

interface HistoryContextValue {
  history: HistoryEntry[];
  lastRead: HistoryEntry | null;
  recordVisit: (entry: Omit<HistoryEntry, 'visitedAt'>) => void;
  clearHistory: () => void;
  replaceHistory: (entries: HistoryEntry[]) => void;
}

const HistoryContext = createContext<HistoryContextValue>({
  history: [],
  lastRead: null,
  recordVisit: () => {},
  clearHistory: () => {},
  replaceHistory: () => {},
});

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { value: history, setValue } = usePersistentState<HistoryEntry[]>(STORAGE_KEYS.history, []);

  const recordVisit = useCallback(
    (entry: Omit<HistoryEntry, 'visitedAt'>) => {
      setValue((prev) => {
        const withoutDuplicate = prev.filter(
          (e) => !(e.surahId === entry.surahId && e.verseNumber === entry.verseNumber)
        );
        return [{ ...entry, visitedAt: new Date().toISOString() }, ...withoutDuplicate].slice(
          0,
          MAX_ENTRIES
        );
      });
    },
    [setValue]
  );

  const clearHistory = useCallback(() => setValue([]), [setValue]);
  const replaceHistory = useCallback((entries: HistoryEntry[]) => setValue(entries), [setValue]);

  return (
    <HistoryContext.Provider
      value={{ history, lastRead: history[0] ?? null, recordVisit, clearHistory, replaceHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
