# API Test Page Deployment Guide

This guide explains how to deploy the API Test pages to Vercel, ensuring they work correctly with the server-side proxy.

## What's Included

1. **Static HTML Test Page** (`public/api-test.html`)
   - A simple, standalone HTML page that tests the API through the server-side proxy
   - No API keys exposed in client-side code
   - Can be accessed at `https://your-domain.com/api-test.html`

2. **Next.js Test Page** (`src/app/api-test/page.jsx`)
   - A React-based test page with similar functionality
   - Integrated with the Next.js framework
   - Can be accessed at `https://your-domain.com/api-test`

## Deployment Steps

1. **Ensure Environment Variables**
   - Make sure the API key is set in your Vercel environment variables:
     - `API_KEY` - Your API-SPORTS Football API key

2. **Deploy to Vercel**
   - Deploy the project to Vercel using one of these methods:
     - GitHub integration (recommended)
     - Vercel CLI
     - Vercel dashboard manual deployment

3. **Verify API Proxy**
   - After deployment, verify that the `/api/proxy` endpoint is working correctly
   - Test with the API test pages to confirm data is being fetched properly

## Security Considerations

- **API Key Protection**: The API key is kept secure on the server side and never exposed to the client
- **Proxy Implementation**: All API requests go through the server-side proxy at `/api/proxy`
- **CORS Protection**: The proxy handles proper CORS headers to protect your API

## Troubleshooting

If the API tests don't work after deployment:

1. **Check Environment Variables**: Verify that the API key is correctly set in Vercel
2. **Inspect Network Requests**: Use browser developer tools to see if the requests to `/api/proxy` are succeeding
3. **Check Vercel Logs**: Review the function logs in the Vercel dashboard
4. **API Rate Limits**: Confirm you haven't exceeded your API quota

## Server-Side Proxy Implementation

The proxy is implemented in:
- `/src/app/api/proxy/route.js`

This proxy:
1. Takes the requested endpoint as a query parameter
2. Adds the API key from environment variables
3. Forwards the request to the actual API
4. Returns the response to the client

This approach keeps the API key secure while allowing client-side API testing.
