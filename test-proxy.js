// Simple script to test the Fixie proxy implementation directly in Node.js
// This doesn't rely on the development server or require ES modules

// First, we'll implement a simple direct HTTP proxy request
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Function to get Fixie proxy configuration
function getFixieConfig() {
    const fixieUrl = process.env.FIXIE_URL ||
        process.env.HTTP_PROXY ||
        process.env.HTTPS_PROXY ||
        'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';

    const url = new URL(fixieUrl);

    return {
        host: url.hostname || 'criterium.usefixie.com',
        port: url.port ? parseInt(url.port) : 80,
        auth: url.username && url.password ?
            `${url.username}:${url.password}` : 'fixie:L56rcsBn8mulaUC'
    };
}

// Function to make proxied request
function makeProxiedRequest(method, targetUrl, headers = {}, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(targetUrl);
        const isHttps = url.protocol === 'https:';
        const config = getFixieConfig();

        console.log(`Making ${method} request to ${targetUrl} via Fixie`);
        console.log(`Using proxy config:`, {
            host: config.host,
            port: config.port,
            auth: config.auth.replace(/:[^:]+$/, ':****')
        });

        // Create proxy connection options
        const options = {
            host: config.host,
            port: config.port,
            method: 'CONNECT',
            path: `${url.hostname}:${url.port || (isHttps ? 443 : 80)}`,
            headers: {
                'Proxy-Authorization': `Basic ${Buffer.from(config.auth).toString('base64')}`
            }
        };

        // Connect to proxy
        const proxyReq = http.request(options);

        proxyReq.on('connect', (res, socket) => {
            if (res.statusCode !== 200) {
                socket.destroy();
                return reject(new Error(`Proxy connection failed: ${res.statusCode}`));
            }

            // Make actual request through established tunnel
            const requestOptions = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: `${url.pathname}${url.search}`,
                method: method,
                headers: headers,
                socket: socket, // Use established socket
                agent: false // Don't use default agent
            };

            // Use appropriate module
            const requestModule = isHttps ? https : http;
            const req = requestModule.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    let parsedData;

                    try {
                        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
                            parsedData = JSON.parse(data);
                        } else {
                            parsedData = data;
                        }
                    } catch (error) {
                        parsedData = data;
                    }

                    resolve({
                        status: res.statusCode || 0,
                        headers: res.headers,
                        data: parsedData
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (body) {
                req.write(body);
            }

            req.end();
        });

        proxyReq.on('error', (error) => {
            reject(error);
        });

        proxyReq.end();
    });
}

// Helper function for GET requests
function getViaFixie(url, headers = {}) {
    return makeProxiedRequest('GET', url, headers);
}

async function testProxy() {
    console.log('Testing direct Fixie proxy implementation...');

    try {
        // Set API key and host
        const apiKey = '311ca0120aa14feefaef14e768723481'; // Example key from code
        const apiHost = 'v3.football.api-sports.io';

        // Headers for the API request
        const headers = {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'x-apisports-key': apiKey // Alternative header format also accepted
        };

        // Make a request to the status endpoint which doesn't require parameters
        console.log('Sending request to API-Football status endpoint via Fixie proxy...');

        // Using the getViaFixie convenience function
        const result = await getViaFixie('https://v3.football.api-sports.io/status', headers);

        console.log('Response Status:', result.status);
        console.log('Response Headers:', JSON.stringify(result.headers, null, 2));
        console.log('Response Data:', JSON.stringify(result.data, null, 2));

        // Check if we got an IP restriction error
        if (result.data && result.data.errors && result.data.errors.Ip) {
            console.error('IP RESTRICTION ERROR: This IP is not allowed to call the API');
            console.error('Error message:', result.data.errors.Ip);
        } else if (result.status === 200) {
            console.log('SUCCESS: Proxy connection worked! The API accepted our request.');
        } else {
            console.error('ERROR: Received unexpected status code:', result.status);
        }

    } catch (error) {
        console.error('Error during proxy test:', error);
    }
}

// Run the test
testProxy();