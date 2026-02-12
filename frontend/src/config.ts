// API Base URL
// .env.local (dev): http://localhost:3001/api
// .env.production: https://kuran-rehberi.onrender.com/api
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE
  || 'https://kuran-rehberi.onrender.com/api';
