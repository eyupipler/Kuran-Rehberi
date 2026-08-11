import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SURAH_COUNT, surahName, surahVerseCount } from '@/data/surahMeta';

export function generateStaticParams() {
  return Array.from({ length: SURAH_COUNT }, (_, index) => ({ id: String(index + 1) }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = Number(params.id);
  const name = surahName(id);
  return {
    title: `${id}. ${name} Suresi`,
    description: `Kuran-ı Kerim ${id}. ${name} Suresi — ${surahVerseCount(id)} ayet. Türkçe meal, Arapça metin, kelime kökü analizi ve karşılaştırmalı çeviri.`,
    alternates: { canonical: `/surah/${id}` },
    openGraph: {
      title: `${id}. ${name} Suresi | Kuran Rehberi`,
      description: `${name} Suresi Türkçe meali ve Arapça metni, kelime kökü analiziyle.`,
    },
  };
}

export default function SurahLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
