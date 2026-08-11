import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SURAH_VERSE_COUNTS, surahName } from '@/data/surahMeta';

export function generateStaticParams() {
  return SURAH_VERSE_COUNTS.flatMap((verseCount, index) =>
    Array.from({ length: verseCount }, (_, verseIndex) => ({
      surahId: String(index + 1),
      verseNumber: String(verseIndex + 1),
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { surahId: string; verseNumber: string };
}): Promise<Metadata> {
  const surahId = Number(params.surahId);
  const verseNumber = Number(params.verseNumber);
  const name = surahName(surahId);
  return {
    title: `${name} ${verseNumber}. Ayet`,
    description: `Kuran-ı Kerim ${name} Suresi ${verseNumber}. Ayet — Arapça metin, çoklu Türkçe meal, kelime kökü analizi ve karşılaştırma.`,
    alternates: { canonical: `/verse/${surahId}/${verseNumber}` },
    openGraph: {
      title: `${name} ${verseNumber}. Ayet | Kuran Rehberi`,
      description: `${name} ${verseNumber}. Ayet meali, kelime analizi ve morfolojik inceleme.`,
    },
  };
}

export default function VerseLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
