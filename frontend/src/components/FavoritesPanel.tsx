'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFavorites, Favorite } from '@/context/FavoritesContext';

export default function FavoritesPanel() {
  const { favorites, removeFavorite, updateNote, panelOpen, setPanelOpen } = useFavorites();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const startEdit = (fav: Favorite) => {
    setEditingId(fav.id);
    setNoteText(fav.note);
  };

  const saveNote = (id: string) => {
    updateNote(id, noteText);
    setEditingId(null);
  };

  if (!panelOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={() => setPanelOpen(false)}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-[70] flex flex-col">
        {/* Başlık */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-soft-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="font-semibold text-soft-800 dark:text-white text-sm">Favoriler</h2>
            {favorites.length > 0 && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-1.5 rounded-lg hover:bg-soft-100 dark:hover:bg-gray-700 text-soft-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <svg className="w-12 h-12 text-soft-200 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-soft-500 dark:text-gray-400 text-sm font-medium">Henüz favori ayet eklemediniz</p>
              <p className="text-soft-400 dark:text-gray-500 text-xs mt-1.5 leading-relaxed">
                Sure sayfalarında her ayetin yanındaki{' '}
                <span className="text-primary-500">♥</span> ikonuna tıklayarak ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-soft-100 dark:divide-gray-700">
              {[...favorites].reverse().map((fav) => (
                <div key={fav.id} className="p-4">
                  {/* Başlık satırı */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Link
                      href={`/verse/${fav.surahId}/${fav.verseNumber}`}
                      onClick={() => setPanelOpen(false)}
                      className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                    >
                      {fav.surahName} — {fav.verseNumber}. Ayet
                    </Link>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      title="Favoriden kaldır"
                      className="flex-shrink-0 p-1 text-soft-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Arapça metin */}
                  <p className="font-arabic text-base text-soft-700 dark:text-gray-200 text-right leading-relaxed mb-2">
                    {fav.arabicText}
                  </p>

                  {/* Meal */}
                  {fav.translation && (
                    <p className="text-xs text-soft-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
                      {fav.translation}
                    </p>
                  )}

                  {/* Not alanı */}
                  {editingId === fav.id ? (
                    <div className="mt-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Notunuzu yazın..."
                        rows={3}
                        autoFocus
                        className="w-full text-xs border border-soft-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-soft-50 dark:bg-gray-700 text-soft-700 dark:text-gray-200 resize-none focus:ring-2 focus:ring-primary-200 focus:outline-none"
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button
                          onClick={() => saveNote(fav.id)}
                          className="text-xs px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1.5 border border-soft-200 dark:border-gray-600 rounded-lg text-soft-500 hover:bg-soft-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(fav)}
                      className="flex items-center gap-1.5 text-xs text-soft-400 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {fav.note ? (
                        <span className="text-soft-600 dark:text-gray-300 italic">{fav.note}</span>
                      ) : (
                        'Not ekle...'
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
