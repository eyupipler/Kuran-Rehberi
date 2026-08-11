// Proje genelinde tek kaynak: site adresi ve API adresi.
// Derleme sırasında NEXT_PUBLIC_* değişkenleriyle geçersiz kılınabilir.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kuranrehberi.com'
).replace(/\/$/, '');

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || 'https://kuran-rehberi.onrender.com/api'
).replace(/\/$/, '');

export const UPSTREAM_REPO_URL = 'https://github.com/eyupipler/Kuran-Rehberi';
export const UPSTREAM_REPO_LABEL = 'eyupipler/Kuran-Rehberi';

export const MAINTAINER = 'xRefunsen';
export const MAINTAINER_URL = 'https://github.com/xRefunsen';
