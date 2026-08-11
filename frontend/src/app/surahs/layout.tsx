import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sureler',
  description:
    'Kuran-ı Kerim\'in 114 suresi — kitap sırası, iniş sırası, ayet sayısı ve Mekki/Medeni bilgisiyle tam liste.',
};

export default function SurahsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
