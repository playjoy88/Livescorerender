/**
 * Fixie Proxy Direct Implementation
 * 
 * This module provides a direct HTTP/HTTPS proxy implementation for Fixie
 * using Node.js built-in modules rather than relying on environment variables.
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

/**
 * Get Fixie proxy configuration from environment variables
 */
export function getFixieConfig() {
  const fixieUrl = process.env.FIXIE_URL || 
                  process.env.HTTP_PROXY || 
                  process.env.HTTPS_PROXY || 
                  'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';
  
  const url = new URL(fixieUrl);
  
  return {
    host: url.hostname || 'criterium.usefixie.com',
    port: url.port ? parseInt(url.port) : 80,
    auth: url.username && url.password 
        ? `${url.username}:${url.password}`
        : 'fixie:L56rcsBn8mulaUC'
  };
}

/**
 * Make HTTP request through Fixie proxy
 */
export function makeProxiedRequest(
  method: string,
  targetUrl: string, 
  headers: Record<string, string> = {},
  body?: string
): Promise<{
  status: number,
  headers: http.IncomingHttpHeaders,
  data: any
}> {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const isHttps = url.protocol === 'https:';
    const config = getFixieConfig();
    
    console.log(`[FixieProxy] Making ${method} request to ${targetUrl.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')} via Fixie`);
    console.log(`[FixieProxy] Using proxy config:`, { 
      host: config.host, 
      port: config.port, 
      auth: config.auth.replace(/:[^:]+$/, ':****') 
    });
    
    // Create an options object for the proxy request
    const options: http.RequestOptions = {
      host: config.host,
      port: config.port,
      method: 'CONNECT',
      path: `${url.hostname}:${url.port || (isHttps ? 443 : 80)}`,
      headers: {
        'Proxy-Authorization': `Basic ${Buffer.from(config.auth).toString('base64')}`
      }
    };
    
    // Create a connection to the proxy server
    const proxyReq = http.request(options);
    
    proxyReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        return reject(new Error(`Proxy connection failed: ${res.statusCode}`));
      }
      
      // Now make the actual request through the established tunnel
      const requestOptions: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: method,
        headers: headers,
        // @ts-expect-error - TS doesn't know about these options, but they're valid
        socket: socket, // Use the socket from the proxy connection
        agent: false,   // Don't use the default agent
      };
      
      // Choose the appropriate module based on protocol
      const requestModule = isHttps ? https : http;
      const req = requestModule.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          let parsedData;
          
          try {
            if (res.headers['content-type']?.includes('application/json')) {
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

/**
 * Convenience function to make a GET request through the Fixie proxy
 */
export async function getViaFixie(
  url: string, 
  headers: Record<string, string> = {}
) {
  return makeProxiedRequest('GET', url, headers);
}

/**
 * Convenience function to make a POST request through the Fixie proxy
 */
export async function postViaFixie(
  url: string, 
  body: Record<string, any> = {},
  headers: Record<string, string> = {}
) {
  const bodyStr = JSON.stringify(body);
  const newHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyStr).toString(),
    ...headers
  };
  
  return makeProxiedRequest('POST', url, newHeaders, bodyStr);
}
