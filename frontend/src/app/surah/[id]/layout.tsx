import { ReactNode } from 'react';
import type { Metadata } from 'next';

const surahNames: string[] = [
  'Fatiha', 'Bakara', 'Âl-i İmrân', 'Nisâ', 'Mâide', 'En\'âm', 'A\'râf', 'Enfâl', 'Tevbe', 'Yûnus',
  'Hûd', 'Yûsuf', 'Ra\'d', 'İbrâhîm', 'Hicr', 'Nahl', 'İsrâ', 'Kehf', 'Meryem', 'Tâhâ',
  'Enbiyâ', 'Hac', 'Mü\'minûn', 'Nûr', 'Furkân', 'Şuarâ', 'Neml', 'Kasas', 'Ankebût', 'Rûm',
  'Lokmân', 'Secde', 'Ahzâb', 'Sebe\'', 'Fâtır', 'Yâsîn', 'Sâffât', 'Sâd', 'Zümer', 'Mü\'min',
  'Fussilet', 'Şûrâ', 'Zuhruf', 'Duhân', 'Câsiye', 'Ahkâf', 'Muhammed', 'Fetih', 'Hucurât', 'Kâf',
  'Zâriyât', 'Tûr', 'Necm', 'Kamer', 'Rahmân', 'Vâkıa', 'Hadîd', 'Mücâdele', 'Haşr', 'Mümtehine',
  'Sâff', 'Cumua', 'Münâfikûn', 'Teğâbün', 'Talâk', 'Tahrîm', 'Mülk', 'Kalem', 'Hâkka', 'Meâric',
  'Nûh', 'Cin', 'Müzzemmil', 'Müddessir', 'Kıyâme', 'İnsân', 'Mürselât', 'Nebe\'', 'Nâziât', 'Abese',
  'Tekvîr', 'İnfitâr', 'Mutaffifîn', 'İnşikâk', 'Burûc', 'Târık', 'A\'lâ', 'Ğâşiye', 'Fecr', 'Beled',
  'Şems', 'Leyl', 'Duhâ', 'İnşirâh', 'Tîn', 'Alak', 'Kadr', 'Beyyine', 'Zilzâl', 'Âdiyât',
  'Kâria', 'Tekâsür', 'Asr', 'Hümeze', 'Fîl', 'Kureyş', 'Mâûn', 'Kevser', 'Kâfirûn', 'Nasr',
  'Tebbet', 'İhlâs', 'Felak', 'Nâs',
];

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = parseInt(params.id);
  const name = surahNames[id - 1] || `Sure ${id}`;
  return {
    title: `${id}. ${name} Suresi`,
    description: `Kuran-ı Kerim ${id}. ${name} Suresi — Türkçe meal, Arapça metin, kelime analizi ve karşılaştırmalı çeviri. Kuran Rehberi ücretsiz Kuran okuma platformu.`,
    openGraph: {
      title: `${id}. ${name} Suresi | Kuran Rehberi`,
      description: `${name} Suresi Türkçe meali ve Arapça metni. Kelime kökü analizi ve karşılaştırmalı çeviri.`,
    },
  };
}

export default function SurahLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
