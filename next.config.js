/** @type {import('next').NextConfig} */

// Fixie proxy settings
const FIXIE_URL = process.env.FIXIE_URL || 'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';

// Configure proxy globally for Node.js processes
if (typeof process !== 'undefined') {
    process.env.HTTP_PROXY = FIXIE_URL;
    process.env.HTTPS_PROXY = FIXIE_URL;
    process.env.GLOBAL_AGENT_HTTP_PROXY = FIXIE_URL;
    process.env.GLOBAL_AGENT_HTTPS_PROXY = FIXIE_URL;
    process.env.NO_PROXY = 'localhost,127.0.0.1,.local';

    console.log('Configured global proxy for all server components');
}

const nextConfig = {
    eslint: {
        // Disable ESLint during production builds
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Disable TypeScript type checking during production builds
        ignoreBuildErrors: true,
    },
    env: {
        API_KEY: process.env.API_KEY,
        API_HOST: process.env.API_HOST,
        FIXIE_URL: FIXIE_URL,
        HTTP_PROXY: FIXIE_URL,
        HTTPS_PROXY: FIXIE_URL,
        FIXIE_ENABLED: 'true',
    },
    // Specify experimental features to enable proxy for streaming responses
    experimental: {
        serverComponentsExternalPackages: ['global-agent'],
        proxyTimeout: 120000, // Increase timeout for proxy requests
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
        remotePatterns: [{
            protocol: 'https',
            hostname: '**',
        }]
    },
    async headers() {
        return [{
            // Apply these headers to all routes
            source: '/:path*',
            headers: [{
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
        }, ];
    },
};

module.exports = nextConfig;