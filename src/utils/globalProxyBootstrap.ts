// Global Proxy Bootstrap
// This file configures global proxy settings for all server-side requests

// Import libraries only on the server side
const isServer = typeof window === 'undefined';

// Set HTTP_PROXY and HTTPS_PROXY environment variables directly in Node.js
if (isServer) {
  console.log('Initializing proxy settings for server-side requests...');
  
  // Get Fixie proxy URL from environment or use default
  const FIXIE_URL = process.env.FIXIE_URL || 'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';
  
  try {
    // Set environment variables directly
    process.env.HTTP_PROXY = FIXIE_URL;
    process.env.HTTPS_PROXY = FIXIE_URL;
    process.env.NO_PROXY = 'localhost,127.0.0.1,.local';
    
    // In Next.js, we can also modify the Node.js global HTTP agent
    // This requires the http and https modules
    try {
      const http = require('http');
      const https = require('https');
      const HttpProxyAgent = require('http-proxy-agent');
      const HttpsProxyAgent = require('https-proxy-agent');
      
      // Create proxy agents
      const httpAgent = new HttpProxyAgent(FIXIE_URL);
      const httpsAgent = new HttpsProxyAgent(FIXIE_URL);
      
      // Set the default agents for all http and https requests
      http.globalAgent = httpAgent;
      https.globalAgent = httpsAgent;
      
      console.log('Global proxy settings initialized successfully!');
    } catch (agentError) {
      // If proxy agent modules are not available, just continue with env vars
      console.log('HTTP/HTTPS agents not modified, using environment variables only');
    }
  } catch (error) {
    console.error('Error setting up proxy environment:', error);
  }
}

export default function enableGlobalProxy() {
  // This is just a marker function to ensure the file is imported
  return isServer;
}
