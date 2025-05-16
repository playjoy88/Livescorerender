import { NextRequest, NextResponse } from 'next/server';

/**
 * Blob proxy API route
 * This route proxies requests to external blob storage URLs to avoid CORS issues
 * It also handles redirects for storage.example.com URLs to the actual storage endpoint
 * or serves local files from the public directory
 */
export async function GET(request: NextRequest) {
  // Extract the URL from the query string
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  console.log('Blob proxy received request for URL:', url);
  
  // Handle storage.example.com URLs by replacing with actual blob storage URL or local files
  if (url.includes('storage.example.com/ads/')) {
    // Extract the path after "ads/"
    const match = url.match(/storage\.example\.com\/ads\/(.+)/);
    if (match && match[1]) {
      const path = match[1];
      
      console.log('Extracted path from storage.example.com/ads/:', path);
      
      // Always use local files from public directory for development
      if (process.env.NODE_ENV !== 'production' || process.env.USE_LOCAL_FILES === 'true') {
        console.log('Using local file from public directory:', `/ads/${path}`);
        return NextResponse.redirect(new URL(`/ads/${path}`, request.url));
      }
      
      // Use the specified Vercel Blob Storage URL for production
      const blobStorageBaseUrl = "https://8qeoqfv8tibaypbc.public.blob.vercel-storage.com";
      url = `${blobStorageBaseUrl}/ads/${path}`;
      console.log('Proxying to blob storage URL:', url);
    }
  } else if (url.includes('https://storage.example.com/ads/')) {
    // Extract the path after "ads/"
    const match = url.match(/https:\/\/storage\.example\.com\/ads\/(.+)/);
    if (match && match[1]) {
      const path = match[1];
      
      console.log('Extracted path from https://storage.example.com/ads/:', path);
      
      // Always use local files from public directory for development
      if (process.env.NODE_ENV !== 'production' || process.env.USE_LOCAL_FILES === 'true') {
        console.log('Using local file from public directory:', `/ads/${path}`);
        return NextResponse.redirect(new URL(`/ads/${path}`, request.url));
      }
      
      // Use the specified Vercel Blob Storage URL for production
      const blobStorageBaseUrl = "https://8qeoqfv8tibaypbc.public.blob.vercel-storage.com";
      url = `${blobStorageBaseUrl}/ads/${path}`;
      console.log('Proxying to blob storage URL:', url);
    }
  }

  // If the URL is already a relative path to our public directory
  if (url.startsWith('/ads/')) {
    console.log('Redirecting to local public directory:', url);
    return NextResponse.redirect(new URL(url, request.url));
  }
  
  try {
    // Fetch the file from the URL
    console.log('Fetching remote file:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch from URL:', url, 'Status:', response.status);
      return NextResponse.json(
        { error: `Failed to fetch from the provided URL: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the file content
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    console.log('Serving proxied content with type:', contentType);
    
    // Return the proxied response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*', // Allow any origin to access this resource
      },
    });
  } catch (error) {
    console.error('Error in blob-proxy API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to proxy the requested URL', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
