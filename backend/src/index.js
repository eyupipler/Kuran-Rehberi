/**
 * Kuran Rehberi - Backend API
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./db/database');
const { corsOptions, securityHeaders, IS_PRODUCTION } = require('./middleware/security');
const { createRateLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(cors(corsOptions()));
app.use(compression());
app.use(express.json({ limit: '32kb' }));

initDatabase()
  .then(() => {
    app.use('/api', createRateLimiter({ windowMs: 60_000, max: 240 }));

    app.use('/api/surahs', require('./routes/surahs'));
    app.use('/api/verses', require('./routes/verses'));
    app.use('/api/search', require('./routes/search'));
    app.use('/api/roots', require('./routes/roots'));

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.get('/api', (req, res) => {
      res.json({
        name: 'Kuran Rehberi API',
        version: '1.0.0',
        endpoints: {
          surahs: '/api/surahs',
          verses: '/api/verses/:surahId/:verseNumber',
          search: '/api/search?q=query',
          roots: '/api/roots/:root',
        },
      });
    });

    app.use('/api', (req, res) => {
      res.status(404).json({ error: 'Uç nokta bulunamadı' });
    });

    serveFrontendIfBuilt(app);

    // Hata gövdesi son katmanda üretilir; production'da iç detay sızdırılmaz.
    app.use((err, req, res, next) => {
      const status = err.status || 500;
      if (status >= 500) {
        console.error(err.stack || err.message);
      }
      const message =
        status >= 500 && IS_PRODUCTION ? 'Sunucu hatası' : err.message || 'Bir hata oluştu';
      res.status(status).json({ error: message });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log('Kuran Rehberi API çalışıyor: port ' + PORT);
    });
  })
  .catch((err) => {
    console.error('Veritabanı başlatılamadı:', err);
    process.exit(1);
  });

/** Aynı sunucudan statik frontend servis edilirse SPA fallback ile bağla. */
function serveFrontendIfBuilt(app) {
  const frontendOut = path.join(__dirname, '..', '..', 'frontend', 'out');
  if (!fs.existsSync(frontendOut)) return;

  console.log('Frontend statik dosyaları serve ediliyor:', frontendOut);
  app.use(
    express.static(frontendOut, {
      setHeaders(res, filePath) {
        const name = path.basename(filePath);
        // Service worker ve manifest her zaman tazelenmeli; hash'li varlıklar uzun süre kalabilir.
        if (name === 'sw.js' || name === 'manifest.json' || name === 'offline.html') {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else if (filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  app.get('*', (req, res) => {
    const candidates = [
      path.join(frontendOut, req.path.endsWith('/') ? req.path + 'index.html' : req.path),
      path.join(frontendOut, req.path + '.html'),
    ];
    const match = candidates.find(
      (candidate) => candidate.startsWith(frontendOut) && fs.existsSync(candidate)
    );
    res.sendFile(match || path.join(frontendOut, 'index.html'));
  });
}
