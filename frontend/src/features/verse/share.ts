import { SITE_URL } from '@/config';

export function verseUrl(surahId: number, verseNumber: number): string {
  return `${SITE_URL}/verse/${surahId}/${verseNumber}`;
}

export function verseCitation(input: {
  surahName: string;
  surahId: number;
  verseNumber: number;
  arabicText?: string;
  translation?: string | null;
  translatorName?: string;
}): string {
  const lines = [];
  if (input.arabicText) lines.push(input.arabicText);
  if (input.translation) lines.push(input.translation);
  lines.push(
    `— ${input.surahName} Suresi ${input.surahId}:${input.verseNumber}${
      input.translatorName ? ` (${input.translatorName})` : ''
    }`
  );
  return lines.join('\n\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cihaz paylaşım menüsünü açar; desteklenmiyorsa bağlantıyı panoya kopyalar.
 * Dönen değer kullanıcıya hangi geri bildirimin gösterileceğini belirler.
 */
export async function shareVerse(input: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(input);
      return 'shared';
    } catch (error) {
      // Kullanıcı paylaşım penceresini kapattıysa kopyalamaya düşmeye gerek yok.
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }
  return (await copyToClipboard(input.url)) ? 'copied' : 'failed';
}
