'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS, usePersistentState } from '@/lib/storage';

export interface NoteItem {
  /** "surahId:verseNumber" — her ayet için tek not tutulur. */
  id: string;
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabicText: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NoteDraft = Pick<
  NoteItem,
  'surahId' | 'verseNumber' | 'surahName' | 'arabicText' | 'title' | 'content' | 'tags'
>;

interface NotesContextValue {
  notes: NoteItem[];
  allTags: string[];
  getNote: (surahId: number, verseNumber: number) => NoteItem | undefined;
  saveNote: (draft: NoteDraft) => void;
  deleteNote: (id: string) => void;
  replaceNotes: (notes: NoteItem[]) => void;
}

const NotesContext = createContext<NotesContextValue>({
  notes: [],
  allTags: [],
  getNote: () => undefined,
  saveNote: () => {},
  deleteNote: () => {},
  replaceNotes: () => {},
});

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/^#+/, '').toLocaleLowerCase('tr-TR');
}

// Eski sürümde not yalnızca içerikten oluşuyordu; eksik alanları tamamla.
function migrate(note: Partial<NoteItem>): NoteItem {
  const updatedAt = note.updatedAt || new Date().toISOString();
  return {
    id: note.id || `${note.surahId}:${note.verseNumber}`,
    surahId: Number(note.surahId),
    verseNumber: Number(note.verseNumber),
    surahName: note.surahName || '',
    arabicText: note.arabicText || '',
    title: note.title || '',
    content: note.content || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
    createdAt: note.createdAt || updatedAt,
    updatedAt,
  };
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const { value, setValue } = usePersistentState<NoteItem[]>(STORAGE_KEYS.notes, []);

  const notes = useMemo(() => value.map(migrate), [value]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }, [notes]);

  const getNote = useCallback(
    (surahId: number, verseNumber: number) =>
      notes.find((n) => n.surahId === surahId && n.verseNumber === verseNumber),
    [notes]
  );

  const saveNote = useCallback(
    (draft: NoteDraft) => {
      const id = `${draft.surahId}:${draft.verseNumber}`;
      const now = new Date().toISOString();
      setValue((prev) => {
        const existing = prev.find((n) => n.id === id);
        const item: NoteItem = {
          ...draft,
          id,
          tags: [...new Set(draft.tags.map(normalizeTag).filter(Boolean))],
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        };
        return existing ? prev.map((n) => (n.id === id ? item : n)) : [...prev, item];
      });
    },
    [setValue]
  );

  const deleteNote = useCallback(
    (id: string) => setValue((prev) => prev.filter((n) => n.id !== id)),
    [setValue]
  );

  const replaceNotes = useCallback((next: NoteItem[]) => setValue(next.map(migrate)), [setValue]);

  return (
    <NotesContext.Provider value={{ notes, allTags, getNote, saveNote, deleteNote, replaceNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
