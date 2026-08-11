'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  PageHeader,
  SearchField,
  Select,
} from '@/components/ui';
import { NoteIcon, TrashIcon } from '@/components/ui/icons';
import { useNotes } from '@/context/NotesContext';
import { NoteEditor } from '@/features/notes/NoteEditor';
import type { NoteTarget } from '@/features/notes/NoteEditor';
import { normalizeTag } from '@/context/NotesContext';

type SortOption = 'updated' | 'created' | 'verse';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotesPage() {
  const { notes, allTags, deleteNote } = useNotes();
  const [term, setTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('updated');
  const [editing, setEditing] = useState<NoteTarget | null>(null);

  const visible = useMemo(() => {
    const needle = term.trim().toLocaleLowerCase('tr-TR');
    const filtered = notes.filter((note) => {
      if (activeTag && !note.tags.includes(activeTag)) return false;
      if (!needle) return true;
      return (
        note.content.toLocaleLowerCase('tr-TR').includes(needle) ||
        note.title.toLocaleLowerCase('tr-TR').includes(needle) ||
        note.surahName.toLocaleLowerCase('tr-TR').includes(needle) ||
        note.tags.some((tag) => tag.includes(normalizeTag(needle))) ||
        `${note.surahId}:${note.verseNumber}`.includes(needle)
      );
    });

    return filtered.sort((a, b) => {
      if (sort === 'verse') {
        return a.surahId - b.surahId || a.verseNumber - b.verseNumber;
      }
      const key = sort === 'created' ? 'createdAt' : 'updatedAt';
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
  }, [notes, term, activeTag, sort]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notlarım"
        description={
          notes.length > 0
            ? `${notes.length} not — ayet sayfalarından ekleyip etiketleyebilirsiniz`
            : 'Ayet sayfalarındaki "Not al" işlemiyle not ekleyin'
        }
      />

      {notes.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchField
              label="Notlarda ara"
              placeholder="Not, başlık, etiket veya sure ara..."
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="flex-1"
            />
            <Select
              label="Sıralama"
              hideLabel
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="sm:w-48"
            >
              <option value="updated">Son güncellenen</option>
              <option value="created">Son eklenen</option>
              <option value="verse">Ayet sırasına göre</option>
            </Select>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Etiket filtresi">
              <button
                type="button"
                aria-pressed={activeTag === null}
                onClick={() => setActiveTag(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTag === null
                    ? 'bg-accent text-accent-contrast'
                    : 'bg-surface-sunken text-ink-muted hover:text-accent'
                }`}
              >
                Tümü
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTag === tag
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-surface-sunken text-ink-muted hover:text-accent'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<NoteIcon className="h-10 w-10" />}
          title={notes.length === 0 ? 'Henüz not almadınız' : 'Bu filtreye uyan not yok'}
          description={
            notes.length === 0
              ? 'Ayet sayfalarındaki not ikonuna dokunarak araştırma notlarınızı kaydedin.'
              : 'Arama terimini veya etiket filtresini değiştirin.'
          }
          action={
            notes.length === 0 ? (
              <Link href="/surahs" className="text-sm text-accent hover:underline">
                Sureleri gör →
              </Link>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-4">
          {visible.map((note) => (
            <li
              key={note.id}
              id={`${note.surahId}-${note.verseNumber}`}
              className="overflow-hidden rounded-sm bg-surface border border-line"
            >
              <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-sunken px-4 py-2.5">
                <Link
                  href={`/verse/${note.surahId}/${note.verseNumber}`}
                  className="min-w-0 truncate text-sm font-medium text-accent hover:underline"
                >
                  {note.surahName} Suresi {note.surahId}:{note.verseNumber}
                </Link>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditing({
                        surahId: note.surahId,
                        verseNumber: note.verseNumber,
                        surahName: note.surahName,
                        arabicText: note.arabicText,
                      })
                    }
                  >
                    Düzenle
                  </Button>
                  <IconButton label="Notu sil" size="sm" onClick={() => deleteNote(note.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              <div className="px-4 py-3">
                {note.arabicText && (
                  <p className="arabic mb-3 line-clamp-2 text-ink-muted" style={{ fontSize: '1.1rem' }}>
                    {note.arabicText}
                  </p>
                )}

                {note.title && <h2 className="mb-1 text-sm font-semibold text-ink">{note.title}</h2>}
                <p className="prose-text whitespace-pre-wrap text-ink">{note.content}</p>

                {note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <button key={tag} type="button" onClick={() => setActiveTag(tag)}>
                        <Badge tone="accent">#{tag}</Badge>
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-ink-faint">
                  Güncellendi: {formatDate(note.updatedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <NoteEditor target={editing} open={editing !== null} onClose={() => setEditing(null)} />
    </div>
  );
}
