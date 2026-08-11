const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * İzin verilen origin listesi ALLOWED_ORIGINS ile virgüllü verilir.
 * Tanımlı değilse geliştirme kolaylığı için tüm origin'lere izin verilir;
 * production'da liste zorunludur.
 */
function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return null;
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function corsOptions() {
  const allowed = parseAllowedOrigins();

  if (!allowed) {
    if (IS_PRODUCTION) {
      console.warn(
        'ALLOWED_ORIGINS tanımlı değil — tüm origin\'lere izin veriliyor. Production için ayarlayın.'
      );
    }
    return { origin: true, methods: ['GET'], maxAge: 86400 };
  }

  return {
    origin(origin, callback) {
      // Origin başlığı olmayan istekler (curl, sunucu-sunucu) engellenmez.
      if (!origin || allowed.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      const error = new Error('Bu origin için erişim izni yok');
      error.status = 403;
      callback(error);
    },
    methods: ['GET'],
    maxAge: 86400,
  };
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );

  if (IS_PRODUCTION) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CSP yalnızca bu sunucudan servis edilen HTML için anlamlı; API yanıtları etkilenmez.
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' " + (parseAllowedOrigins() || []).join(' '),
    ]
      .join('; ')
      .trim()
  );

  next();
}

module.exports = { corsOptions, securityHeaders, IS_PRODUCTION };
