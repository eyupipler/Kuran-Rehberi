import { ReactNode } from 'react';

// Roots için dynamicParams - runtime'da generate edilecek
// Static export'ta bu çalışmaz, fallback olarak boş liste
export function generateStaticParams() {
  // Kök sayısı çok fazla (1658+), hepsini listelemek yerine
  // en popüler kökleri önceden oluşturalım
  // Kullanıcılar diğer köklere link ile ulaşabilir
  const popularRoots = [
    'ك ت ب',  // kitap
    'ع ل م',  // bilim
    'ق ر ء',  // okumak
    'ا ل ه',  // ilah
    'ر ب ب',  // rab
    'ا م ن',  // iman
    'ص ل و',  // namaz
    'ق و ل',  // söylemek
    'ع م ل',  // amel
    'ج ع ل',  // yapmak
  ];

  return popularRoots.map(root => ({
    root: encodeURIComponent(root),
  }));
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
