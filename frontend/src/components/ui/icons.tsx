import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

function Outline({ children, className = 'w-5 h-5', ...rest }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Outline>
);

export const HeartIcon = ({ filled, ...p }: IconProps) => (
  <Outline {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.3l-7.1-7a4.4 4.4 0 016.2-6.2l.9.9.9-.9a4.4 4.4 0 016.2 6.2z" />
  </Outline>
);

export const NoteIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
    <path d="M17.6 3.6a2 2 0 112.8 2.8L12 14.8H9.2V12z" />
  </Outline>
);

export const SettingsIcon = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5v.2a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1h.2a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
  </Outline>
);

export const MenuIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Outline>
);

export const CloseIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Outline>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Outline>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M9 5l7 7-7 7" />
  </Outline>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M6 9l6 6 6-6" />
  </Outline>
);

export const CopyIcon = (p: IconProps) => (
  <Outline {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
  </Outline>
);

export const LinkIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M10 13a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L11.5 6" />
    <path d="M14 11a4 4 0 00-5.7 0l-3 3A4 4 0 1011 19.7l1.5-1.5" />
  </Outline>
);

export const ShareIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
    <path d="M16 6l-4-4-4 4M12 2v14" />
  </Outline>
);

export const CompareIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 5h6v14H4zM14 5h6v14h-6z" />
  </Outline>
);

export const ExternalIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M10 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4" />
    <path d="M14 4h6v6M20 4l-9 9" />
  </Outline>
);

export const SunIcon = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Outline>
);

export const MoonIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
  </Outline>
);

export const MonitorIcon = (p: IconProps) => (
  <Outline {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Outline>
);

export const BookIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" />
    <path d="M4 17.5A2 2 0 016 16h13" />
  </Outline>
);

export const RootIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 3v8M12 11c0 4-3 5-6 6M12 11c0 4 3 5 6 6" />
    <circle cx="12" cy="3.5" r="1.5" />
    <circle cx="5.5" cy="18" r="1.8" />
    <circle cx="18.5" cy="18" r="1.8" />
  </Outline>
);

export const LibraryIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 4h4v16H4zM10 4h4v16h-4z" />
    <path d="M16.5 4.5l3.5 1-4 15-3.4-1z" />
  </Outline>
);

export const HomeIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />
  </Outline>
);

export const TrashIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
  </Outline>
);

export const CheckIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Outline>
);

export const PlusIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 5v14M5 12h14" />
  </Outline>
);

export const FilterIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 5h16l-6.5 7.5V19l-3 1.5v-8z" />
  </Outline>
);

export const TagIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M3 12V5a2 2 0 012-2h7l9 9-9 9z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </Outline>
);

export const DownloadIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M4 20h16" />
  </Outline>
);

export const UploadIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M4 20h16" />
  </Outline>
);

export const WarningIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 4l9 16H3z" />
    <path d="M12 10v4M12 17.2v.1" />
  </Outline>
);

export const BookmarkIcon = ({ filled, ...p }: IconProps) => (
  <Outline {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6 4h12v16l-6-4-6 4z" />
  </Outline>
);

export const GridIcon = (p: IconProps) => (
  <Outline {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Outline>
);

export const ListIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </Outline>
);

export const TextSizeIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M3 7V5h8v2M7 5v14M13 12v-1.5h6V12M16 10.5V19" />
  </Outline>
);
