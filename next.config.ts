import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_KEY: process.env.API_KEY,
    API_HOST: process.env.API_HOST,
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
