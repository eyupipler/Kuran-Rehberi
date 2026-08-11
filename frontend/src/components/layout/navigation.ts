import {
  BookIcon,
  HomeIcon,
  NoteIcon,
  RootIcon,
  SearchIcon,
} from '@/components/ui/icons';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  Icon: typeof HomeIcon;
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Ana Sayfa', shortLabel: 'Ana Sayfa', Icon: HomeIcon, exact: true },
  { href: '/search', label: 'Arama', shortLabel: 'Ara', Icon: SearchIcon },
  { href: '/surahs', label: 'Sureler', shortLabel: 'Sureler', Icon: BookIcon },
  { href: '/roots', label: 'Kelime Kökleri', shortLabel: 'Kökler', Icon: RootIcon },
  { href: '/notes', label: 'Notlarım', shortLabel: 'Notlarım', Icon: NoteIcon },
];

export function isActivePath(pathname: string, item: NavItem): boolean {
  const path = pathname.replace(/\/$/, '') || '/';
  if (item.exact) return path === item.href;
  return path === item.href || path.startsWith(`${item.href}/`);
}
