// API Base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://kuran-rehberi.onrender.com/api');
