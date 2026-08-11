'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { DownloadIcon, UploadIcon } from '@/components/ui/icons';
import { useFavorites } from '@/context/FavoritesContext';
import { useHistory } from '@/context/HistoryContext';
import { useNotes } from '@/context/NotesContext';
import { useSettings } from '@/context/SettingsContext';
import {
  BackupParseError,
  buildBackup,
  describeBackup,
  downloadBackup,
  parseBackup,
} from '@/features/backup/backup';

type Status = { tone: 'ok' | 'error'; message: string } | null;

export function DataBackup() {
  const { settings, replaceSettings } = useSettings();
  const { notes, replaceNotes } = useNotes();
  const { favorites, collections, replaceFavorites } = useFavorites();
  const { history, replaceHistory } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);

  const handleExport = () => {
    downloadBackup(buildBackup({ settings, notes, favorites, collections, history }));
    setStatus({ tone: 'ok', message: 'Yedek dosyası indirildi.' });
  };

  const handleImport = async (file: File) => {
    try {
      const backup = parseBackup(await file.text());
      replaceSettings(backup.settings);
      replaceNotes(backup.notes);
      replaceFavorites(backup.favorites, backup.collections);
      replaceHistory(backup.history);
      setStatus({ tone: 'ok', message: `İçe aktarıldı: ${describeBackup(backup)}` });
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof BackupParseError ? error.message : 'Dosya içe aktarılamadı.',
      });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-ink-muted">
        Notlar, favoriler, koleksiyonlar, okuma geçmişi ve ayarlar yalnızca bu tarayıcıda saklanır.
        Cihaz değiştirmeden veya tarayıcı verilerini temizlemeden önce yedek alın.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleExport}>
          <DownloadIcon className="h-4 w-4" />
          Verilerimi dışa aktar
        </Button>
        <Button size="sm" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon className="h-4 w-4" />
          Verileri içe aktar
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleImport(file);
          event.target.value = '';
        }}
      />

      {status && (
        <p
          role="status"
          className={`text-xs ${status.tone === 'error' ? 'text-danger' : 'text-accent'}`}
        >
          {status.message}
        </p>
      )}

      <p className="text-[11px] text-ink-faint">
        İçe aktarma mevcut verilerin üzerine yazar.
      </p>
    </div>
  );
}
