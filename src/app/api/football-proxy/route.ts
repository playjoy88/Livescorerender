import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy for API-SPORTS Football API
 * This route handler proxies requests to the API-SPORTS Football API,
 * keeping the API key on the server side for improved security.
 */

// API key should be stored in environment variables on the server side
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
const API_BASE_URL = 'https://live-score-pink.vercel.app';

/**
 * GET handler for football API proxy
 */
export async function GET(request: NextRequest) {
  try {
    // Extract the endpoint and parameters from the URL
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
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
    console.log(`[API Proxy] Using API key: ${API_KEY.substring(0, 3)}...${API_KEY.substring(API_KEY.length - 3)}`);
    
    // Make the request to the football API
    const response = await fetch(apiUrl, {
      headers: {
        'x-apisports-key': API_KEY,
      },
      // Pass through cache control headers
      cache: 'no-store',
    });
    
    // Create the response and forward the content type
    const apiResponse = NextResponse.json(await response.json());
    
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
