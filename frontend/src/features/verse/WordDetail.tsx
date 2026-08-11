'use client';

import Link from 'next/link';
import { IconButton } from '@/components/ui';
import { CloseIcon } from '@/components/ui/icons';
import { partOfSpeechTr } from '@/features/verse/partOfSpeech';
import { transliterate } from '@/utils/transliteration';
import type { Word } from '@/lib/api';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-faint">{label}</p>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  );
}

export function WordDetail({ word, onClose }: { word: Word; onClose: () => void }) {
  return (
    <section className="rounded-sm bg-accent-soft p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-center">
          <span className="block font-arabic text-3xl text-accent-ink">{word.arabicWord}</span>
          <span className="block text-xs text-ink-faint">{transliterate(word.arabicWord)}</span>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {(word.translationTr || word.rootMeaningTr) && (
            <Field label="Türkçe anlam">
              <span className="font-medium">{word.translationTr || word.rootMeaningTr}</span>
            </Field>
          )}

          {word.root && (
            <Field label="Kök">
              <Link
                href={`/roots/${encodeURIComponent(word.root)}`}
                className="font-arabic text-base text-accent hover:underline"
              >
                {word.root}
              </Link>
              {word.rootOccurrenceCount > 0 && (
                <span className="ml-2 text-xs text-ink-faint">
                  Kuran&apos;da {word.rootOccurrenceCount} kez
                </span>
              )}
            </Field>
          )}

          {word.partOfSpeech && (
            <Field label="Kelime türü">{partOfSpeechTr(word.partOfSpeech)}</Field>
          )}

          {word.lemma && (
            <Field label="Lemma">
              <span className="font-arabic text-base">{word.lemma}</span>
              <span className="ml-1.5 text-xs text-ink-faint">({transliterate(word.lemma)})</span>
            </Field>
          )}
        </div>

        <IconButton label="Kelime detayını kapat" size="sm" onClick={onClose}>
          <CloseIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </section>
  );
}
