import RootDetailClient from './RootDetailClient';
import allRoots from '@/data/roots.json';

// Tüm kökleri statik olarak oluştur
export function generateStaticParams() {
  return allRoots.map((root: string) => ({
    root: encodeURIComponent(root),
  }));
}

interface Props {
  params: {
    root: string;
  };
}

export default function RootDetailPage({ params }: Props) {
  return <RootDetailClient rootParam={params.root} />;
}
