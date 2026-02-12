/**
 * Kuran Rehberi - Backend API (sql.js)
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(compression());
app.use(express.json());

// Veritabanını başlat ve sonra route'ları yükle
initDatabase().then(() => {
  console.log('Veritabanı yüklendi.');

  // Routes
  const surahRoutes = require('./routes/surahs');
  const verseRoutes = require('./routes/verses');
  const searchRoutes = require('./routes/search');
  const rootRoutes = require('./routes/roots');

  app.use('/api/surahs', surahRoutes);
  app.use('/api/verses', verseRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/roots', rootRoutes);

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
      }
    });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Bir hata oluştu', message: err.message });
  });

  // Production'da frontend statik dosyalarını serve et
  const frontendOut = path.join(__dirname, '..', '..', 'frontend', 'out');
  const fs = require('fs');
  if (fs.existsSync(frontendOut)) {
    console.log('Frontend statik dosyaları serve ediliyor:', frontendOut);
    app.use(express.static(frontendOut));
    // SPA fallback - API olmayan tüm istekleri index.html'e yönlendir
    app.get('*', (req, res) => {
      // Önce exact path'e bak (trailingSlash: true, dosya .html olabilir)
      const urlPath = req.path.endsWith('/') ? req.path + 'index.html' : req.path;
      const filePath = path.join(frontendOut, urlPath);
      const filePathHtml = path.join(frontendOut, req.path + '.html');
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else if (fs.existsSync(filePathHtml)) {
        res.sendFile(filePathHtml);
      } else {
        res.sendFile(path.join(frontendOut, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('Kuran Rehberi API çalışıyor: port ' + PORT);
  });
}).catch(err => {
  console.error('Veritabanı başlatılamadı:', err);
});
