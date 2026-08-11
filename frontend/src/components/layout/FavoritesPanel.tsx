'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, EmptyState, IconButton, SidePanel } from '@/components/ui';
import { CloseIcon, HeartIcon, NoteIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { useFavorites } from '@/context/FavoritesContext';
import type { Favorite } from '@/context/FavoritesContext';

const ALL = '__all__';

export function FavoritesPanel() {
  const {
    favorites,
    collections,
    removeFavorite,
    updateNote,
    toggleCollection,
    createCollection,
    deleteCollection,
    panelOpen,
    setPanelOpen,
  } = useFavorites();

  const [activeCollection, setActiveCollection] = useState<string>(ALL);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const [newCollection, setNewCollection] = useState('');

  const visible = useMemo(() => {
    const ordered = [...favorites].reverse();
    if (activeCollection === ALL) return ordered;
    return ordered.filter((favorite) => favorite.collections.includes(activeCollection));
  }, [favorites, activeCollection]);

  const startEdit = (favorite: Favorite) => {
    setEditingId(favorite.id);
    setDraftNote(favorite.note);
  };

  const submitCollection = () => {
    const name = newCollection.trim();
    if (!name) return;
    createCollection(name);
    setNewCollection('');
    setActiveCollection(name);
  };

  return (
    <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Favoriler">
      <div className="border-b border-line px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <CollectionChip
            label="Tümü"
            count={favorites.length}
            active={activeCollection === ALL}
            onSelect={() => setActiveCollection(ALL)}
          />
          {collections.map((collection) => (
            <CollectionChip
              key={collection}
              label={collection}
              count={favorites.filter((f) => f.collections.includes(collection)).length}
              active={activeCollection === collection}
              onSelect={() => setActiveCollection(collection)}
              onDelete={() => {
                deleteCollection(collection);
                if (activeCollection === collection) setActiveCollection(ALL);
              }}
            />
          ))}
        </div>

        <div className="mt-2.5 flex gap-2">
          <input
            type="text"
            value={newCollection}
            onChange={(event) => setNewCollection(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitCollection()}
            placeholder="Yeni koleksiyon"
            aria-label="Yeni koleksiyon adı"
            className="h-8 flex-1 rounded-sm border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-ink-faint"
          />
          <Button size="sm" onClick={submitCollection} disabled={!newCollection.trim()}>
            <PlusIcon className="h-4 w-4" />
            Ekle
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="h-10 w-10" />}
          title={
            activeCollection === ALL ? 'Henüz favori ayet yok' : 'Bu koleksiyon boş'
          }
          description="Ayetlerin yanındaki kalp ikonuna dokunarak favorilerinize ekleyebilirsiniz."
        />
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((favorite) => (
            <li key={favorite.id} className="px-4 py-3.5">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <Link
                  href={`/verse/${favorite.surahId}/${favorite.verseNumber}`}
                  onClick={() => setPanelOpen(false)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {favorite.surahName} {favorite.surahId}:{favorite.verseNumber}
                </Link>
                <IconButton
                  label="Favoriden kaldır"
                  size="sm"
                  onClick={() => removeFavorite(favorite.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </div>

              <p className="arabic mb-1.5 text-ink" style={{ fontSize: '1.05rem', lineHeight: 1.9 }}>
                {favorite.arabicText}
              </p>

              {favorite.translation && (
                <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                  {favorite.translation}
                </p>
              )}

              {collections.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {collections.map((collection) => {
                    const inCollection = favorite.collections.includes(collection);
                    return (
                      <button
                        key={collection}
                        type="button"
                        aria-pressed={inCollection}
                        onClick={() => toggleCollection(favorite.id, collection)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          inCollection
                            ? 'bg-accent text-accent-contrast'
                            : 'border-line text-ink-faint hover:border-accent'
                        }`}
                      >
                        {collection}
                      </button>
                    );
                  })}
                </div>
              )}

              {editingId === favorite.id ? (
                <div>
                  <textarea
                    value={draftNote}
                    onChange={(event) => setDraftNote(event.target.value)}
                    rows={3}
                    autoFocus
                    aria-label="Favori notu"
                    className="w-full resize-none rounded-sm border border-line bg-surface px-2.5 py-2 text-xs text-ink"
                  />
                  <div className="mt-1.5 flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        updateNote(favorite.id, draftNote.trim());
                        setEditingId(null);
                      }}
                    >
                      Kaydet
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      İptal
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(favorite)}
                  className="flex items-start gap-1.5 text-left text-xs text-ink-faint transition-colors hover:text-accent"
                >
                  <NoteIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  {favorite.note ? (
                    <span className="italic text-ink-muted">{favorite.note}</span>
                  ) : (
                    'Not ekle...'
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </SidePanel>
  );
}

function CollectionChip({
  label,
  count,
  active,
  onSelect,
  onDelete,
}: {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-accent text-accent-contrast' : 'border-line text-ink-muted'
      }`}
    >
      <button type="button" onClick={onSelect} className="font-medium">
        {label}
        <span className="ml-1 tabular-nums opacity-70">{count}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`${label} koleksiyonunu sil`}
          className="opacity-60 transition-opacity hover:opacity-100"
        >
          <CloseIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
