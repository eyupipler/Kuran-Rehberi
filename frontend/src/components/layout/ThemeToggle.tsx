'use client';

import { IconButton } from '@/components/ui';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons';
import { useTheme } from '@/context/ThemeContext';
import type { ThemePreference } from '@/context/ThemeContext';

const ORDER: ThemePreference[] = ['light', 'dark', 'system'];

const LABELS: Record<ThemePreference, string> = {
  light: 'Açık tema',
  dark: 'Koyu tema',
  system: 'Sistem teması',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = theme === 'light' ? SunIcon : theme === 'dark' ? MoonIcon : MonitorIcon;
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <IconButton
      label={`${LABELS[theme]} — ${LABELS[next]}na geç`}
      onClick={() => setTheme(next)}
    >
      <Icon className="h-5 w-5" />
    </IconButton>
  );
}

export function ThemeChoice() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2">
      {ORDER.map((option) => {
        const Icon = option === 'light' ? SunIcon : option === 'dark' ? MoonIcon : MonitorIcon;
        const selected = theme === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(option)}
            className={`flex flex-col items-center gap-1.5 rounded-sm px-3 py-3.5 text-xs font-medium transition-colors ${
              selected
                ? 'bg-accent text-accent-contrast'
                : 'bg-surface-sunken text-ink-muted hover:text-accent'
            }`}
          >
            <Icon className="h-5 w-5" />
            {option === 'light' ? 'Açık' : option === 'dark' ? 'Koyu' : 'Sistem'}
          </button>
        );
      })}
    </div>
  );
}
