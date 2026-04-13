import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kelime Kökleri',
  description: 'Kuran-ı Kerim\'deki Arapça kelime kökleri. Morfolojik analiz, türetilmiş formlar ve Kuran\'daki kullanım sıklıkları.',
  openGraph: {
    title: 'Kuran Kelime Kökleri | Kuran Rehberi',
    description: 'Kuran\'daki tüm Arapça kelime köklerinin morfolojik analizi ve kullanım istatistikleri.',
  },
};

export default function RootsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
