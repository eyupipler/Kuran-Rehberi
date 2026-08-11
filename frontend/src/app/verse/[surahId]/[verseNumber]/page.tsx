'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, EmptyState, ErrorState, LoadingState, Tabs } from '@/components/ui';
import { BookIcon, NoteIcon } from '@/components/ui/icons';
import { useHistory } from '@/context/HistoryContext';
import { useNotes } from '@/context/NotesContext';
import { useSettings } from '@/context/SettingsContext';
import { NoteEditor } from '@/features/notes/NoteEditor';
import { useSurahs } from '@/features/quran/useSurahs';
import { ArabicVerse } from '@/features/verse/ArabicVerse';
import { RelatedVerses } from '@/features/verse/RelatedVerses';
import { RootInspector } from '@/features/verse/RootInspector';
import { TranslationComparison } from '@/features/verse/TranslationComparison';
import { TranslationList } from '@/features/verse/TranslationList';
import { VerseComparison } from '@/features/verse/VerseComparison';
import { VerseHeader } from '@/features/verse/VerseHeader';
import { WordAnalysis } from '@/features/verse/WordAnalysis';
import { WordDetail } from '@/features/verse/WordDetail';
import { getVerse } from '@/lib/api';
import type { Word } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

type TabValue = 'translations' | 'words' | 'roots' | 'related' | 'notes';

export default function VersePage() {
  const params = useParams();
  const surahId = Number(params?.surahId);
  const verseNumber = Number(params?.verseNumber);

  const { settings } = useSettings();
  const { surahs } = useSurahs();
  const { recordVisit } = useHistory();
  const { getNote } = useNotes();

  const [tab, setTab] = useState<TabValue>('translations');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [hoveredRoot, setHoveredRoot] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState<{ surahId: number; verseNumber: number } | null>(
    null
  );

  const valid =
    Number.isInteger(surahId) && surahId >= 1 && surahId <= 114 && Number.isInteger(verseNumber);

  const { data, loading, error, reload } = useAsync(
    (signal) => getVerse(surahId, verseNumber, { signal }),
    [surahId, verseNumber],
    { enabled: valid }
  );

  const verse = data?.verse ?? null;
  const words = useMemo(() => data?.words ?? [], [data]);
  const translations = useMemo(() => data?.translations ?? [], [data]);
  const relatedVerses = useMemo(() => data?.relatedVerses ?? [], [data]);

  const activeRoot = hoveredRoot ?? selectedWord?.root ?? null;
  const highlightTerm = selectedWord?.translationTr || selectedWord?.rootMeaningTr || null;
  const surah = surahs.find((item) => item.id === surahId) ?? null;
  const note = verse ? getNote(verse.surahId, verse.verseNumber) : undefined;

  useEffect(() => {
    setSelectedWord(null);
    setHoveredRoot(null);
    setCompareOpen(false);
    setCompareTarget(null);
  }, [surahId, verseNumber]);

  useEffect(() => {
    if (!verse) return;
    const turkish = translations.find((translation) => translation.language === 'tr');
    recordVisit({
      surahId: verse.surahId,
      verseNumber: verse.verseNumber,
      surahName: verse.surahName,
      snippet: turkish?.text?.slice(0, 140) || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse?.surahId, verse?.verseNumber]);

  if (!valid) {
    return (
      <EmptyState
        icon={<BookIcon className="h-10 w-10" />}
        title="Ayet bulunamadı"
        description="Adresteki sure veya ayet numarası geçersiz."
      />
    );
  }

  if (loading) return <LoadingState label="Ayet yükleniyor..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!verse) return null;

  const actionTarget = {
    surahId: verse.surahId,
    verseNumber: verse.verseNumber,
    surahName: verse.surahName,
    arabicText: verse.arabicText,
    translation: translations.find((translation) => translation.language === 'tr')?.text,
  };

  const openCompareWith = (target: { surahId: number; verseNumber: number } | null) => {
    setCompareTarget(target);
    setCompareOpen(true);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <VerseHeader
        target={actionTarget}
        totalVerses={surah?.totalVerses ?? null}
        onOpenNote={() => setNoteOpen(true)}
        onCompare={() => (compareOpen ? setCompareOpen(false) : openCompareWith(null))}
      />

      <ArabicVerse
        arabicText={verse.arabicText}
        words={words}
        activeRoot={activeRoot}
        selectedPosition={selectedWord?.position ?? null}
        onSelectWord={(word) =>
          setSelectedWord((current) => (current?.position === word.position ? null : word))
        }
        onHoverWord={setHoveredRoot}
      />

      {selectedWord && (
        <div className="mb-6">
          <WordDetail word={selectedWord} onClose={() => setSelectedWord(null)} />
        </div>
      )}

      {compareOpen && (
        <VerseComparison
          current={{ verse, translations, words }}
          highlightRoot={selectedWord?.root ?? null}
          initialTarget={compareTarget}
          onClose={() => setCompareOpen(false)}
        />
      )}

      <Tabs
        label="Ayet detayları"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'translations', label: 'Mealler', count: translations.length },
          { value: 'words', label: 'Kelimeler', count: words.length },
          { value: 'roots', label: 'Kökler' },
          { value: 'related', label: 'İlgili Ayetler', count: relatedVerses.length },
          { value: 'notes', label: 'Notlar' },
        ]}
      />

      {tab === 'translations' && (
        <div className="space-y-8">
          <TranslationComparison translations={translations} highlightTerm={highlightTerm} />
          <TranslationList
            translations={translations}
            highlightTerm={highlightTerm}
            defaultLanguage={settings.defaultLanguage}
          />
        </div>
      )}

      {tab === 'words' && (
        <WordAnalysis
          words={words}
          selectedPosition={selectedWord?.position ?? null}
          onSelect={(word) =>
            setSelectedWord((current) => (current?.position === word.position ? null : word))
          }
        />
      )}

      {tab === 'roots' && (
        <RootInspector
          root={selectedWord?.root ?? null}
          translator={settings.defaultTranslator}
          currentSurahId={verse.surahId}
          currentVerseNumber={verse.verseNumber}
        />
      )}

      {tab === 'related' && (
        <RelatedVerses
          verses={relatedVerses}
          currentSurahId={verse.surahId}
          currentVerseNumber={verse.verseNumber}
          onCompare={(related) =>
            openCompareWith({ surahId: related.surahId, verseNumber: related.verseNumber })
          }
        />
      )}

      {tab === 'notes' && (
        <section>
          {note ? (
            <article className="rounded-sm bg-surface p-4 border border-line">
              {note.title && <h3 className="mb-1 text-sm font-semibold text-ink">{note.title}</h3>}
              <p className="prose-text whitespace-pre-wrap text-ink">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-ink-faint"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <Button size="sm" className="mt-4" onClick={() => setNoteOpen(true)}>
                Düzenle
              </Button>
            </article>
          ) : (
            <EmptyState
              icon={<NoteIcon className="h-9 w-9" />}
              title="Bu ayet için notunuz yok"
              description="Araştırma notlarınızı ayetin yanında saklayın; etiketleyerek daha sonra kolayca bulun."
              action={
                <Button variant="primary" size="sm" onClick={() => setNoteOpen(true)}>
                  Not al
                </Button>
              }
            />
          )}
        </section>
      )}

      <NoteEditor
        target={{
          surahId: verse.surahId,
          verseNumber: verse.verseNumber,
          surahName: verse.surahName,
          arabicText: verse.arabicText,
        }}
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
      />
    </div>
  );
}
