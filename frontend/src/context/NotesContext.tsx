'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface NoteItem {
  id: string; // "surahId:verseNumber"
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabicText: string;
  content: string;
  updatedAt: string;
}

interface NotesContextType {
  notes: NoteItem[];
  getNote: (surahId: number, verseNumber: number) => NoteItem | undefined;
  saveNote: (data: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType>({
  notes: [],
  getNote: () => undefined,
  saveNote: () => {},
  deleteNote: () => {},
});

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kuran-rehberi-notes');
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('kuran-rehberi-notes', JSON.stringify(notes));
    }
  }, [notes, loaded]);

  const getNote = (surahId: number, verseNumber: number) =>
    notes.find((n) => n.surahId === surahId && n.verseNumber === verseNumber);

  const saveNote = (data: Omit<NoteItem, 'id' | 'updatedAt'>) => {
    const id = `${data.surahId}:${data.verseNumber}`;
    const item: NoteItem = { ...data, id, updatedAt: new Date().toISOString() };
    setNotes((prev) => {
      const existing = prev.findIndex((n) => n.id === id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, getNote, saveNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
