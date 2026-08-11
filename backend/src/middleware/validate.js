class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function requireInt(value, { min, max, field }) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new HttpError(400, `Geçersiz ${field} değeri`);
  }
  return parsed;
}

function optionalInt(value, { min, max, fallback }) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function parsePagination(query, { defaultLimit = 50, maxLimit = 200 } = {}) {
  return {
    limit: optionalInt(query.limit, { min: 1, max: maxLimit, fallback: defaultLimit }),
    offset: optionalInt(query.offset, { min: 0, max: 100_000, fallback: 0 }),
  };
}

function requireSearchTerm(value, { min = 2, max = 100 } = {}) {
  if (typeof value !== 'string') {
    throw new HttpError(400, `Arama sorgusu en az ${min} karakter olmalı`);
  }
  const term = value.trim();
  if (term.length < min) {
    throw new HttpError(400, `Arama sorgusu en az ${min} karakter olmalı`);
  }
  if (term.length > max) {
    throw new HttpError(400, `Arama sorgusu en fazla ${max} karakter olabilir`);
  }
  return term;
}

/** Serbest metin parametreleri (tercüman kodu, harf vb.) için uzunluk sınırı. */
function optionalString(value, { max = 60 } = {}) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

module.exports = {
  HttpError,
  requireInt,
  optionalInt,
  parsePagination,
  requireSearchTerm,
  optionalString,
};
