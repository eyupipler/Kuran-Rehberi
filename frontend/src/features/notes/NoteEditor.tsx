'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Modal, TextField } from '@/components/ui';
import { useNotes } from '@/context/NotesContext';

export interface NoteTarget {
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabicText: string;
}

function parseTags(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function NoteEditor({
  target,
  open,
  onClose,
}: {
  target: NoteTarget | null;
  open: boolean;
  onClose: () => void;
}) {
  const { getNote, saveNote, deleteNote, allTags } = useNotes();
  const existing = target ? getNote(target.surahId, target.verseNumber) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(existing?.title || '');
    setContent(existing?.content || '');
    setTagsInput((existing?.tags || []).map((tag) => `#${tag}`).join(' '));
    // Modal her açıldığında mevcut nottan yeniden doldurulur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id]);

  if (!target) return null;

  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      if (existing) deleteNote(existing.id);
      onClose();
      return;
    }
    saveNote({
      surahId: target.surahId,
      verseNumber: target.verseNumber,
      surahName: target.surahName,
      arabicText: target.arabicText,
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsInput),
    });
    onClose();
  };

  const suggestions = allTags.filter((tag) => !parseTags(tagsInput).includes(tag)).slice(0, 6);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Notu düzenle' : 'Not al'}
      description={`${target.surahName} Suresi ${target.surahId}:${target.verseNumber}`}
      headerExtra={
        existing ? (
          <Link
            href={`/notes#${target.surahId}-${target.verseNumber}`}
            onClick={onClose}
            className="text-xs text-accent hover:underline"
          >
            Notlarım
          </Link>
        ) : null
      }
      footer={
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave} className="flex-1">
            {content.trim() || title.trim() ? 'Kaydet' : 'Notu sil'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            İptal
          </Button>
          {existing && (
            <Button
              variant="danger"
              onClick={() => {
                deleteNote(existing.id);
                onClose();
              }}
            >
              Sil
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Başlık (isteğe bağlı)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Örn. Tevhid vurgusu"
        />

        <div>
          <label htmlFor="note-content" className="mb-1.5 block text-xs font-medium text-ink-muted">
            Not
          </label>
          <textarea
            id="note-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            autoFocus
            placeholder="Bu ayet hakkındaki notunuz..."
            className="w-full resize-none rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint"
          />
        </div>

        <div>
          <TextField
            label="Etiketler"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="#tevhid #sabır #araştır"
          />
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagsInput((current) => `${current} #${tag}`.trim())}
                  className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-ink-faint transition-colors hover:text-accent"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
