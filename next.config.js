/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile MUI packages for proper CSS handling
  transpilePackages: [
    '@mui/x-data-grid',
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
  ],

  // Optimize imports to reduce bundle size
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // Turbopack-specific configuration
  experimental: {
    turbo: {
      rules: {
        '*.css': {
          loaders: ['css-loader'],
          as: '*.css',
        },
      },
    },
  },

  // Image optimization settings
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;
