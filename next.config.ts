import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_KEY: process.env.API_KEY,
    API_HOST: process.env.API_HOST,
  },
  images: {
    domains: [
      'media-4.api-sports.io',
      'media.api-sports.io',
      'media-1.api-sports.io',
      'media-2.api-sports.io',
      'media-3.api-sports.io',
      'api.sofascore.app',
      'www.sofascore.com',
      'upload.wikimedia.org',
      'images.sofascore.app',
      'e0.365dm.com',
      'livescore-api.com',
      'www.livescore.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Configure this based on your needs
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-RapidAPI-Key, X-RapidAPI-Host, Content-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
