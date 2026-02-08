/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production build için static export, development'ta normal mode
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
