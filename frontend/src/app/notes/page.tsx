'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotes, NoteItem } from '@/context/NotesContext';

export default function NotesPage() {
  const { notes, deleteNote, saveNote } = useNotes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [search, setSearch] = useState('');

  const sorted = [...notes]
    .filter((n) =>
      !search ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.surahName.toLowerCase().includes(search.toLowerCase()) ||
      `${n.surahId}:${n.verseNumber}`.includes(search)
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const startEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (note: NoteItem) => {
    if (editContent.trim()) {
      saveNote({ ...note, content: editContent.trim() });
    }
    setEditingId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-soft-800 dark:text-white mb-1">
          Notlarım
        </h1>
        <p className="text-soft-500 dark:text-gray-400 text-sm">
          {notes.length > 0 ? `${notes.length} not` : 'Henüz not yok'} — ayet sayfalarından not ekleyebilirsiniz
        </p>
      </div>

      {notes.length > 0 && (
        <input
          type="text"
          placeholder="Notlarda ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-5 border border-soft-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:outline-none"
        />
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-soft-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p>{search ? 'Arama sonucu bulunamadı.' : 'Henüz not almadınız.'}</p>
          {!search && (
            <p className="text-sm mt-2">Ayet sayfalarındaki "Not Al" butonu ile not ekleyebilirsiniz.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((note) => (
            <div
              key={note.id}
              id={note.id.replace(':', '-')}
              className="bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 overflow-hidden shadow-soft hover:shadow-soft-md transition-all"
            >
              {/* Başlık */}
              <div className="flex items-center justify-between px-4 py-3 bg-cream-50 dark:bg-gray-800/50 border-b border-soft-100 dark:border-gray-700">
                <Link
                  href={`/verse/${note.surahId}/${note.verseNumber}`}
                  className="flex items-center gap-2 hover:text-primary-600 transition-colors"
                >
                  <span className="verse-number text-xs">{note.surahId}:{note.verseNumber}</span>
                  <span className="text-sm font-medium text-soft-700 dark:text-gray-200">
                    {note.surahName} Suresi, {note.verseNumber}. Ayet
                  </span>
                  <svg className="w-3.5 h-3.5 text-soft-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(note)}
                    className="p-1.5 rounded-lg text-soft-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    title="Düzenle"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 rounded-lg text-soft-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Arapça */}
              <div className="px-4 pt-3 pb-0">
                <p className="font-arabic text-lg text-soft-600 dark:text-gray-400 text-right leading-loose line-clamp-2">
                  {note.arabicText}
                </p>
              </div>

              {/* Not içeriği */}
              <div className="px-4 pb-4 pt-2">
                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      autoFocus
                      className="w-full border border-primary-300 dark:border-primary-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:outline-none resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(note)}
                        className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-soft-200 dark:border-gray-600 text-soft-500 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-soft-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-soft-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <p className="text-xs text-soft-400 dark:text-gray-500 mt-2">
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
