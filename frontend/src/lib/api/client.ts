import { API_BASE } from '@/config';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type QueryValue = string | number | boolean | null | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${API_BASE}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function apiGet<T>(
  path: string,
  options: { query?: Record<string, QueryValue>; signal?: AbortSignal } = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), { signal: options.signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.', 0);
  }

  if (!response.ok) {
    // Backend hata gövdesi JSON değilse okunamayabilir; durum koduna göre mesaj üret.
    let message: string | null = null;
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string') message = body.error;
    } catch {
      message = null;
    }
    throw new ApiError(message || defaultMessageFor(response.status), response.status);
  }

  return response.json() as Promise<T>;
}

function defaultMessageFor(status: number): string {
  if (status === 404) return 'İçerik bulunamadı.';
  if (status === 400) return 'Geçersiz istek.';
  if (status === 429) return 'Çok fazla istek gönderildi. Biraz sonra tekrar deneyin.';
  if (status >= 500) return 'Sunucu şu anda yanıt vermiyor. Lütfen tekrar deneyin.';
  return 'Beklenmeyen bir hata oluştu.';
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Beklenmeyen bir hata oluştu.';
}
