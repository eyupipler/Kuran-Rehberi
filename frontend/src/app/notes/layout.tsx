import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Notlarım',
  description: 'Kuran Rehberi kişisel notlar — kaydettiğiniz ayetler ve çalışma notlarınız.',
};

export default function NotesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
