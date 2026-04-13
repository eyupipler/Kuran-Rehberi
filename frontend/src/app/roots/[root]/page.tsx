import RootDetailClient from './RootDetailClient';
import allRoots from '@/data/roots.json';
import type { Metadata } from 'next';
import { transliterateRoot } from '@/utils/transliteration';

// Tüm kökleri statik olarak oluştur
export function generateStaticParams() {
  return allRoots.map((root: string) => ({
    root: root,
  }));
}

interface Props {
  params: {
    root: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const root = decodeURIComponent(params.root);
  const latin = transliterateRoot(root);
  return {
    title: `${root} (${latin}) Kök Analizi`,
    description: `Kuran-ı Kerim'de "${root}" kök kelimesinin analizi. Türetilmiş formlar, Kuran'daki kullanımları ve meal karşılıkları.`,
    openGraph: {
      title: `${root} Kök Analizi | Kuran Rehberi`,
      description: `"${root}" kök kelimesinin Kuran'daki tüm geçişleri, türetilmiş formlar ve Türkçe anlamları.`,
    },
  };
}

export default function RootDetailPage({ params }: Props) {
  return <RootDetailClient rootParam={params.root} />;
}
