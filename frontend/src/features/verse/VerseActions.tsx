'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconButton } from '@/components/ui';
import {
  CheckIcon,
  CompareIcon,
  CopyIcon,
  ExternalIcon,
  HeartIcon,
  LinkIcon,
  NoteIcon,
  ShareIcon,
} from '@/components/ui/icons';
import { useFavorites } from '@/context/FavoritesContext';
import { useNotes } from '@/context/NotesContext';
import { copyToClipboard, shareVerse, verseCitation, verseUrl } from '@/features/verse/share';

export interface VerseActionTarget {
  surahId: number;
  verseNumber: number;
  surahName: string;
  arabicText: string;
  translation?: string | null;
  translatorName?: string;
}

/**
 * Ayet aksiyonları. Okuyucuda üzerine gelince, ayet sayfasında sürekli görünür.
 * `onOpenNote` verilmezse not butonu gizlenir.
 */
export function VerseActions({
  verse,
  onOpenNote,
  onCompare,
  showDetailLink = true,
  size = 'sm',
}: {
  verse: VerseActionTarget;
  onOpenNote?: () => void;
  onCompare?: () => void;
  showDetailLink?: boolean;
  size?: 'sm' | 'md';
}) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { getNote } = useNotes();
  const [copied, setCopied] = useState<'text' | 'link' | null>(null);

  const favorited = isFavorite(verse.surahId, verse.verseNumber);
  const hasNote = Boolean(getNote(verse.surahId, verse.verseNumber));
  const url = verseUrl(verse.surahId, verse.verseNumber);

  const flash = (kind: 'text' | 'link') => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(`${verse.surahId}:${verse.verseNumber}`);
      return;
    }
    addFavorite({
      surahId: verse.surahId,
      verseNumber: verse.verseNumber,
      surahName: verse.surahName,
      arabicText: verse.arabicText,
      translation: verse.translation || '',
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      <IconButton
        label={favorited ? 'Favoriden kaldır' : 'Favorilere ekle'}
        size={size}
        active={favorited}
        onClick={toggleFavorite}
      >
        <HeartIcon className="h-4 w-4" filled={favorited} />
      </IconButton>

      {onOpenNote && (
        <IconButton
          label={hasNote ? 'Notu düzenle' : 'Not al'}
          size={size}
          active={hasNote}
          onClick={onOpenNote}
        >
          <NoteIcon className="h-4 w-4" />
        </IconButton>
      )}

      <IconButton
        label={copied === 'text' ? 'Kopyalandı' : 'Ayeti kopyala'}
        size={size}
        onClick={async () => {
          if (await copyToClipboard(verseCitation(verse))) flash('text');
        }}
      >
        {copied === 'text' ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      </IconButton>

      <IconButton
        label={copied === 'link' ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
        size={size}
        onClick={async () => {
          if (await copyToClipboard(url)) flash('link');
        }}
      >
        {copied === 'link' ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </IconButton>

      <IconButton
        label="Paylaş"
        size={size}
        onClick={async () => {
          const result = await shareVerse({
            title: `${verse.surahName} ${verse.surahId}:${verse.verseNumber}`,
            text: verseCitation(verse),
            url,
          });
          if (result === 'copied') flash('link');
        }}
      >
        <ShareIcon className="h-4 w-4" />
      </IconButton>

      {onCompare && (
        <IconButton label="Karşılaştır" size={size} onClick={onCompare}>
          <CompareIcon className="h-4 w-4" />
        </IconButton>
      )}

      {showDetailLink && (
        <Link
          href={`/verse/${verse.surahId}/${verse.verseNumber}`}
          aria-label="Ayet detayına git"
          title="Ayet detayına git"
          className={`inline-flex items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink ${
            size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
          }`}
        >
          <ExternalIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
