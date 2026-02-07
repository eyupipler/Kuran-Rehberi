import { ReactNode } from 'react';

// 114 sure için static params
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function SurahLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
