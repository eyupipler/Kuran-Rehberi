import type { Favorite } from '@/context/FavoritesContext';
import type { HistoryEntry } from '@/context/HistoryContext';
import type { NoteItem } from '@/context/NotesContext';
import type { Settings } from '@/context/SettingsContext';

export const BACKUP_FORMAT = 'kuran-rehberi-backup';
export const BACKUP_VERSION = 1;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  settings: Partial<Settings>;
  notes: NoteItem[];
  favorites: Favorite[];
  collections: string[];
  history: HistoryEntry[];
}

export function buildBackup(data: Omit<BackupFile, 'format' | 'version' | 'exportedAt'>): BackupFile {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export function downloadBackup(backup: BackupFile): void {
  const stamp = backup.exportedAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kuran-rehberi-yedek-${stamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export class BackupParseError extends Error {}

export function parseBackup(text: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupParseError('Dosya okunamadı — geçerli bir JSON değil.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new BackupParseError('Yedek dosyası boş veya bozuk.');
  }

  const candidate = parsed as Partial<BackupFile>;
  if (candidate.format !== BACKUP_FORMAT) {
    throw new BackupParseError('Bu dosya bir Kuran Rehberi yedeği değil.');
  }
  if (typeof candidate.version !== 'number' || candidate.version > BACKUP_VERSION) {
    throw new BackupParseError('Yedek sürümü bu uygulamadan daha yeni. Uygulamayı güncelleyin.');
  }

  return {
    format: BACKUP_FORMAT,
    version: candidate.version,
    exportedAt: candidate.exportedAt || new Date().toISOString(),
    settings: candidate.settings && typeof candidate.settings === 'object' ? candidate.settings : {},
    notes: Array.isArray(candidate.notes) ? candidate.notes : [],
    favorites: Array.isArray(candidate.favorites) ? candidate.favorites : [],
    collections: Array.isArray(candidate.collections) ? candidate.collections : [],
    history: Array.isArray(candidate.history) ? candidate.history : [],
  };
}

export function describeBackup(backup: BackupFile): string {
  return [
    `${backup.notes.length} not`,
    `${backup.favorites.length} favori`,
    `${backup.collections.length} koleksiyon`,
  ].join(' · ');
}
