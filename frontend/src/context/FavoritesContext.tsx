'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS, usePersistentState } from '@/lib/storage';

export interface Favorite {
  /** "surahId:verseNumber" */
  id: string;
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  note: string;
  /** Ait olduğu koleksiyon adları; boşsa yalnızca genel favorilerde görünür. */
  collections: string[];
  addedAt: string;
}

export type FavoriteDraft = Pick<
  Favorite,
  'surahId' | 'verseNumber' | 'surahName' | 'arabicText' | 'translation'
>;

interface FavoritesContextValue {
  favorites: Favorite[];
  collections: string[];
  addFavorite: (draft: FavoriteDraft) => void;
  removeFavorite: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  toggleCollection: (id: string, collection: string) => void;
  createCollection: (name: string) => void;
  deleteCollection: (name: string) => void;
  isFavorite: (surahId: number, verseNumber: number) => boolean;
  replaceFavorites: (favorites: Favorite[], collections: string[]) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function migrate(favorite: Partial<Favorite>): Favorite {
  return {
    id: favorite.id || `${favorite.surahId}:${favorite.verseNumber}`,
    surahId: Number(favorite.surahId),
    verseNumber: Number(favorite.verseNumber),
    surahName: favorite.surahName || '',
    arabicText: favorite.arabicText || '',
    translation: favorite.translation || '',
    note: favorite.note || '',
    collections: Array.isArray(favorite.collections) ? favorite.collections : [],
    addedAt: favorite.addedAt || new Date().toISOString(),
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { value, setValue } = usePersistentState<Favorite[]>(STORAGE_KEYS.favorites, []);
  const { value: collections, setValue: setCollections } = usePersistentState<string[]>(
    STORAGE_KEYS.collections,
    []
  );
  const [panelOpen, setPanelOpen] = useState(false);

  const favorites = useMemo(() => value.map(migrate), [value]);

  const addFavorite = useCallback(
    (draft: FavoriteDraft) => {
      const id = `${draft.surahId}:${draft.verseNumber}`;
      setValue((prev) => {
        if (prev.some((f) => f.id === id)) return prev;
        return [
          ...prev,
          { ...draft, id, note: '', collections: [], addedAt: new Date().toISOString() },
        ];
      });
    },
    [setValue]
  );

  const removeFavorite = useCallback(
    (id: string) => setValue((prev) => prev.filter((f) => f.id !== id)),
    [setValue]
  );

  const updateNote = useCallback(
    (id: string, note: string) =>
      setValue((prev) => prev.map((f) => (f.id === id ? { ...f, note } : f))),
    [setValue]
  );

  const toggleCollection = useCallback(
    (id: string, collection: string) =>
      setValue((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const current = migrate(f).collections;
          return {
            ...f,
            collections: current.includes(collection)
              ? current.filter((c) => c !== collection)
              : [...current, collection],
          };
        })
      ),
    [setValue]
  );

  const createCollection = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setCollections((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    },
    [setCollections]
  );

  const deleteCollection = useCallback(
    (name: string) => {
      setCollections((prev) => prev.filter((c) => c !== name));
      setValue((prev) =>
        prev.map((f) => ({ ...f, collections: migrate(f).collections.filter((c) => c !== name) }))
      );
    },
    [setCollections, setValue]
  );

  const isFavorite = useCallback(
    (surahId: number, verseNumber: number) =>
      favorites.some((f) => f.id === `${surahId}:${verseNumber}`),
    [favorites]
  );

  const replaceFavorites = useCallback(
    (nextFavorites: Favorite[], nextCollections: string[]) => {
      setValue(nextFavorites.map(migrate));
      setCollections(nextCollections);
    },
    [setValue, setCollections]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        collections,
        addFavorite,
        removeFavorite,
        updateNote,
        toggleCollection,
        createCollection,
        deleteCollection,
        isFavorite,
        replaceFavorites,
        panelOpen,
        setPanelOpen,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites, FavoritesProvider içinde kullanılmalıdır');
  return context;
}
