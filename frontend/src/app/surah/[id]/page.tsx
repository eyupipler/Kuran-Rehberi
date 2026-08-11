'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { BookIcon } from '@/components/ui/icons';
import { useHistory } from '@/context/HistoryContext';
import { useSettings } from '@/context/SettingsContext';
import { NoteEditor } from '@/features/notes/NoteEditor';
import type { NoteTarget } from '@/features/notes/NoteEditor';
import { ReaderToolbar } from '@/features/reader/ReaderToolbar';
import { ReaderBreadcrumb, SurahHeader, SurahPager } from '@/features/reader/SurahHeader';
import { VerseRow } from '@/features/reader/VerseRow';
import { useSurahs } from '@/features/quran/useSurahs';
import { getSurahVerses } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

export default function SurahPage() {
  const params = useParams();
  const surahId = Number(params?.id);
  const { settings, update } = useSettings();
  const { surahs } = useSurahs();
  const { recordVisit } = useHistory();
  const [noteTarget, setNoteTarget] = useState<NoteTarget | null>(null);

  const { data, loading, error, reload } = useAsync(
    (signal) => getSurahVerses(surahId, settings.defaultTranslator, { signal }),
    [surahId, settings.defaultTranslator],
    { enabled: Number.isInteger(surahId) }
  );

  // Sure listesi iniş sırası ve Mekki/Medeni bilgisini her zaman taşır; ayet yanıtı
  // eski API sürümlerinde bunları içermeyebildiği için önce listeden okunur.
  const surah = surahs.find((item) => item.id === surahId) ?? data?.surah ?? null;
  const verses = data?.verses ?? [];

  useEffect(() => {
    if (!surah || verses.length === 0) return;
    recordVisit({
      surahId: surah.id,
      verseNumber: verses[0].verseNumber,
      surahName: surah.name,
      snippet: verses[0].translation || '',
    });
    // Sure meta verisi önbellekten ayetlerden önce gelebildiği için ayet sayısı da
    // bağımlılıkta tutulur; aksi halde ilk çalıştırmada erken çıkıp bir daha tetiklenmez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahId, verses.length]);

  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    return (
      <EmptyState
        icon={<BookIcon className="h-10 w-10" />}
        title="Sure bulunamadı"
        description="1 ile 114 arasında bir sure numarası seçin."
      />
    );
  }

  return (
    <div className="mx-auto max-w-reader">
      <ReaderToolbar
        translator={settings.defaultTranslator}
        onTranslatorChange={(code) => update('defaultTranslator', code)}
      />

      {loading ? (
        <LoadingState label="Ayetler yükleniyor..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <ReaderBreadcrumb />
          <SurahHeader surah={surah} fallbackName={`${surahId}. Sure`} />

          <div className="verse-list flex flex-col gap-3">
            {verses.map((verse) => (
              <VerseRow
                key={verse.id}
                verse={verse}
                surahId={surahId}
                surahName={surah?.name ?? ''}
                onOpenNote={(target) =>
                  setNoteTarget({
                    surahId: target.surahId,
                    verseNumber: target.verseNumber,
                    surahName: target.surahName,
                    arabicText: target.arabicText,
                  })
                }
              />
            ))}
          </div>

          <SurahPager surahId={surahId} />
        </>
      )}

      <NoteEditor
        target={noteTarget}
        open={noteTarget !== null}
        onClose={() => setNoteTarget(null)}
      />
    </div>
  );
}
