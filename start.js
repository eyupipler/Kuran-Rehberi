/**
 * Kuran Rehberi - Production Starter
 * Backend ve Frontend'i birlikte başlatır
 */

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

console.log('Kuran Rehberi başlatılıyor...');

// Backend başlat
const backend = spawn(npm, ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 3 saniye bekle, sonra frontend başlat
setTimeout(() => {
  const frontend = spawn(npm, ['start'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend hatası:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend hatası:', err);
});

// Ctrl+C ile düzgün kapanma
process.on('SIGINT', () => {
  console.log('\nKapatılıyor...');
  backend.kill();
  process.exit();
});
