// API Base URL - Development'ta localhost, Production'da Render.com
export const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001/api'
  : 'https://kuran-rehberi.onrender.com/api';
