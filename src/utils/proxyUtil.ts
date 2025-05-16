/**
 * Proxy Utility
 * This utility provides functions for creating proxy agents for use with HTTP/HTTPS requests
 */

import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

/**
 * Get the Fixie proxy URL from environment variables or use a default
 */
export function getFixieProxyUrl(): string {
  return process.env.FIXIE_URL || 
         process.env.HTTP_PROXY || 
         process.env.HTTPS_PROXY ||
         'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';
}

/**
 * Create a proxy agent for HTTP requests
 */
export function createHttpProxyAgent() {
  const proxyUrl = getFixieProxyUrl();
  console.log(`Creating HTTP proxy agent with URL: ${proxyUrl.replace(/:[^:]*@/, ':****@')}`);
  return new HttpProxyAgent(proxyUrl);
}

/**
 * Create a proxy agent for HTTPS requests
 */
export function createHttpsProxyAgent() {
  const proxyUrl = getFixieProxyUrl();
  console.log(`Creating HTTPS proxy agent with URL: ${proxyUrl.replace(/:[^:]*@/, ':****@')}`);
  return new HttpsProxyAgent(proxyUrl);
}

/**
 * Create a fetch with proxy configuration for making requests
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export async function fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
  const isHttps = url.startsWith('https:');
  const agent = isHttps ? createHttpsProxyAgent() : createHttpProxyAgent();
  
  // Create a new options object with the agent
  // @ts-ignore - TypeScript doesn't know about the 'agent' property, but Node.js fetch supports it
  const proxyOptions = {
    ...options,
    agent: agent
  };
  
  console.log(`Fetching with proxy: ${url}`);
  return fetch(url, proxyOptions);
}
