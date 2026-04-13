import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kuran Arama',
  description: 'Kuran-ı Kerim\'de ayet ve meal arama. Türkçe ve İngilizce meal metinlerinde anahtar kelime ile arama yapın.',
  openGraph: {
    title: 'Kuran Arama | Kuran Rehberi',
    description: 'Kuran-ı Kerim\'de ayet ve meal arama platformu.',
  },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
