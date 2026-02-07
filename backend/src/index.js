/**
 * Kuran Rehberi - Backend API (sql.js)
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(compression());
app.use(express.json());

// Veritabanini baslat ve sonra route'lari yukle
initDatabase().then(() => {
  console.log('Veritabani yuklendi.');

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
    res.status(500).json({ error: 'Bir hata olustu', message: err.message });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log('Kuran Rehberi API calisiyor: port ' + PORT);
  });
}).catch(err => {
  console.error('Veritabani baslatilamadi:', err);
});
