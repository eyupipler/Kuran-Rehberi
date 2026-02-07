/** @type {import('next').NextConfig} */
const nextConfig = {
  // API proxy (backend aynı sunucuda çalışacak)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://localhost:3001/api/:path*'  // Production'da aynı sunucu
          : 'http://localhost:3001/api/:path*', // Development
      },
    ];
  },

  // Image optimization
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
