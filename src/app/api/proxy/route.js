import { NextResponse } from 'next/server';

/**
 * API Proxy for API-SPORTS Football API
 * This route handler proxies requests to the API-SPORTS Football API,
 * keeping the API key on the server side for improved security.
 * 
 * Note: Using /api/proxy as the endpoint (shorter and easier to remember than /api/football-proxy)
 */

// API key and host should be stored in environment variables on the server side
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
const API_HOST = process.env.API_HOST || process.env.NEXT_PUBLIC_API_HOST || 'v3.football.api-sports.io';
const API_BASE_URL = `https://${API_HOST}/v3`;

/**
 * GET handler for football API proxy
 */
export async function GET(request) {
    try {
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
    
        console.log(`[API Proxy] Requesting: ${apiUrl}`);
        console.log(`[API Proxy] Using API key: ${API_KEY ? API_KEY.substring(0, 3) + '...' + (API_KEY.length > 6 ? API_KEY.substring(API_KEY.length - 3) : '') : 'No API Key'}`);
    
        // RapidAPI requires specific headers - only use allowed headers per API documentation
        const headers = {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
            'x-apisports-key': API_KEY // Alternative header format also accepted
        };
        
        console.log(`[API Proxy] Using headers:`, Object.keys(headers));
        
        // Direct approach without Fixie for now - we'll handle IP restrictions differently
        console.log(`[API Proxy] Making direct API request to: ${apiUrl}`);
        
        // Make the direct request to the football API
        const response = await fetch(apiUrl, {
            headers,
            // Pass through cache control headers
            cache: 'no-store'
        });
    
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