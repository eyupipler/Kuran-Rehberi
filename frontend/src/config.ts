// API Base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE
  || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'
    : 'https://kuran-rehberi.onrender.com/api');
