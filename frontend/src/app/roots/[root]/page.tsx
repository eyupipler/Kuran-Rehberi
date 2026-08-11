import type { Metadata } from 'next';
import allRoots from '@/data/roots.json';
import { RootDetail } from '@/features/roots/RootDetail';
import { transliterateRoot } from '@/utils/transliteration';

interface Props {
  params: { root: string };
}

export function generateStaticParams() {
  return (allRoots as string[]).map((root) => ({ root }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const root = decodeURIComponent(params.root);
  const latin = transliterateRoot(root);
  return {
    title: `${root} (${latin}) kök analizi`,
    description: `Kuran-ı Kerim'de "${root}" kökünün tüm geçişleri, türetilmiş biçimleri, sure dağılımı ve Türkçe karşılıkları.`,
    openGraph: {
      title: `${root} kök analizi | Kuran Rehberi`,
      description: `"${root}" kökünün Kuran'daki kullanımları ve morfolojik analizi.`,
    },
  };
}

export default function RootDetailPage({ params }: Props) {
  return <RootDetail rootParam={params.root} />;
}
