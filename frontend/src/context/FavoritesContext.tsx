'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Favorite {
  id: string; // `${surahId}:${verseNumber}`
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  note: string;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  addFavorite: (fav: Omit<Favorite, 'id' | 'addedAt' | 'note'>) => void;
  removeFavorite: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  isFavorite: (surahId: number, verseNumber: number) => boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'kuran-rehberi-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch { /* ignore */ }
  }, [favorites, loaded]);

  const addFavorite = (fav: Omit<Favorite, 'id' | 'addedAt' | 'note'>) => {
    const id = `${fav.surahId}:${fav.verseNumber}`;
    setFavorites((prev) => {
      if (prev.find((f) => f.id === id)) return prev;
      return [...prev, { ...fav, id, note: '', addedAt: new Date().toISOString() }];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const updateNote = (id: string, note: string) => {
    setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, note } : f)));
  };

  const isFavorite = (surahId: number, verseNumber: number) =>
    favorites.some((f) => f.id === `${surahId}:${verseNumber}`);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, updateNote, isFavorite, panelOpen, setPanelOpen }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
