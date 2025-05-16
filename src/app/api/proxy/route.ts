import { NextRequest, NextResponse } from 'next/server';
import { getViaFixie } from '@/utils/fixieProxy';
import { isClient } from '@/utils/clientSideDbFallback';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Dynamically import supabaseAdmin to avoid errors in environments where DB is not configured
let supabaseAdmin: SupabaseClient<Database> | null = null;
if (!isClient) {
  try {
    import('@/services/supabaseClient').then(({ supabaseAdmin: admin }) => {
      supabaseAdmin = admin;
    }).catch(err => {
      console.error('Failed to import supabaseClient:', err);
    });
  } catch (error) {
    console.error('Error importing supabaseClient:', error);
  }
}

/**
 * API Proxy for API-SPORTS Football API
 * This route handler proxies requests to the API-SPORTS Football API,
 * keeping the API key on the server side for improved security.
 * 
 * Note: Using /api/proxy as the endpoint (shorter and easier to remember than /api/football-proxy)
 */

// Using Database type for settings retrieval

// Get API settings from the database, with environment variables as fallbacks
const getApiSettings = async () => {
    try {
        // Attempt to get settings from database first
        if (supabaseAdmin) {
            const { data, error } = await supabaseAdmin
                .from('api_settings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0 && !error) {
                console.log('Using API settings from database');
                const apiSettings = data[0];
                return {
                    apiKey: apiSettings.api_key || process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '',
                    apiHost: apiSettings.api_host || process.env.API_HOST || process.env.NEXT_PUBLIC_API_HOST || 'v3.football.api-sports.io',
                    apiVersion: apiSettings.api_version || 'v3',
                    debugMode: apiSettings.debug_mode || false,
                    cacheTimeout: apiSettings.cache_timeout || 5,
                    pollingInterval: apiSettings.polling_interval || 60,
                    proxyEnabled: true, // Always enable the proxy
                    endpoints: apiSettings.endpoints || {
                        fixtures: true,
                        standings: true,
                        teams: true,
                        players: true,
                        odds: false,
                        predictions: true
                    }
                };
            }
        }
    } catch (error) {
        console.error('Error fetching API settings from database:', error);
    }

    // Fallback to environment variables
    console.log('Using API settings from environment variables (fallback)');
    return {
        apiKey: process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '',
        apiHost: process.env.API_HOST || process.env.NEXT_PUBLIC_API_HOST || 'v3.football.api-sports.io',
        apiVersion: 'v3',
        debugMode: false,
        cacheTimeout: 5,
        pollingInterval: 60,
        proxyEnabled: true,
        endpoints: {
            fixtures: true,
            standings: true,
            teams: true,
            players: true,
            odds: false,
            predictions: true
        }
    };
};

/**
 * GET handler for football API proxy
 */
export async function GET(request: NextRequest) {
    try {
        // Get API settings first
        const settings = await getApiSettings();
        const API_KEY = settings.apiKey;
        const API_HOST = settings.apiHost;
        const API_VERSION = settings.apiVersion;
        const API_BASE_URL = `https://${API_HOST}/${API_VERSION}`;
        const DEBUG_MODE = settings.debugMode;

        // Extract the endpoint and parameters from the URL
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');

        if (!endpoint) {
            return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
        }

        // Create a new URLSearchParams object for API params
        const apiParams = new URLSearchParams();

        // Copy all search params except 'endpoint'
        searchParams.forEach((value, key) => {
            if (key !== 'endpoint') {
                apiParams.append(key, value);
            }
        });

        // Construct the full API URL
        const apiUrl = `${API_BASE_URL}/${endpoint}${apiParams.toString() ? `?${apiParams.toString()}` : ''}`;
    
        if (DEBUG_MODE) {
            console.log(`[API Proxy] Requesting: ${apiUrl}`);
            console.log(`[API Proxy] Using API key: ${API_KEY ? API_KEY.substring(0, 3) + '...' + (API_KEY.length > 6 ? API_KEY.substring(API_KEY.length - 3) : '') : 'No API Key'}`);
        }
    
        // RapidAPI requires specific headers - use only allowed headers per API documentation
        const headers: Record<string, string> = {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
            'x-apisports-key': API_KEY // Alternative header format also accepted
        };
        
        if (DEBUG_MODE) {
            console.log(`[API Proxy] Using headers:`, Object.keys(headers));
        }
        
        // Use Fixie proxy for the request to bypass IP restrictions
        console.log(`[API Proxy] Making API request via Fixie proxy to: ${apiUrl}`);
        
        // Get Fixie proxy URL from environment variables or next.config.js
        const fixieUrl = process.env.FIXIE_URL || process.env.HTTP_PROXY || 'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';
        
        console.log(`[API Proxy] Using proxy URL from env: ${fixieUrl.replace(/:[^:]*@/, ':****@')}`);
        
        // Check if debug parameter was sent
        const isDebug = searchParams.get('debug') === 'true';
        
        // Log additional debug info
        if (isDebug || DEBUG_MODE) {
            console.log(`[API Proxy] HTTP_PROXY env var set to: ${process.env.HTTP_PROXY?.replace(/:[^:]*@/, ':****@')}`);
            console.log(`[API Proxy] HTTPS_PROXY env var set to: ${process.env.HTTPS_PROXY?.replace(/:[^:]*@/, ':****@')}`);
            console.log(`[API Proxy] Request headers:`, headers);
        }
        
        // Use our direct Fixie proxy implementation
        // This bypasses the environment variable approach completely and forces all requests
        // to go through the Fixie proxy service using the CONNECT method
        console.log(`[API Proxy] Making direct Fixie proxy request to: ${apiUrl}`);
        const result = await getViaFixie(apiUrl, headers);
        
        // Create a Response-like object from the result
        const response = {
            ok: result.status >= 200 && result.status < 300,
            status: result.status,
            statusText: result.status === 200 ? 'OK' : `Status: ${result.status}`,
            headers: new Headers(result.headers as Record<string, string>),
            json: async () => result.data,
            text: async () => JSON.stringify(result.data)
        };
    
        if (!response.ok) {
            console.error(`[API Proxy] API returned error status: ${response.status}`);
            const errorText = await response.text();
            console.error(`[API Proxy] Error response: ${errorText}`);
      
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    
        // Parse the response JSON
        const responseData = await response.json();
    
        // Create the response
        const apiResponse = NextResponse.json(responseData);
        
        // Add debug headers to help diagnose proxy issues
        apiResponse.headers.set('x-proxy-info', `Using Fixie proxy: ${fixieUrl.replace(/:[^:]*@/, ':****@')}`);
        apiResponse.headers.set('x-proxy-time', new Date().toISOString());
        apiResponse.headers.set('x-server-env', process.env.NODE_ENV || 'unknown');
    
        // Forward rate limit headers for debugging
        if (response.headers) {
            const rateLimitHeaders = [
                'x-ratelimit-requests-limit',
                'x-ratelimit-requests-remaining',
                'X-RateLimit-Limit',
                'X-RateLimit-Remaining'
            ];
      
            rateLimitHeaders.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    apiResponse.headers.set(header, value);
                }
            });
        }
    
        return apiResponse;
    } catch (error) {
        console.error('[API Proxy] Error:', error);
    
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
}
