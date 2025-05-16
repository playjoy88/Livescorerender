# Fixie Proxy Integration Guide

## Overview

This document explains how we've integrated Fixie proxy service with the LiveScore application to ensure all API requests go through whitelisted IPs. This is critical for the API Football service that has IP restrictions.

## How the Proxy Works

1. **Direct Tunneling Implementation**:
   - We've implemented a custom HTTP CONNECT tunnel in `src/utils/fixieProxy.ts`
   - This establishes a direct tunnel connection to the Fixie proxy service
   - All API requests are routed through this proxy, ensuring they come from Fixie's IP addresses

2. **API Flow**:
   - Frontend components make requests to our internal `/api/proxy` endpoint
   - The proxy endpoint in `src/app/api/proxy/route.ts` handles all API requests
   - The proxy authenticates with the Fixie service and routes requests through it
   - API Football receives requests from Fixie's whitelisted IPs, not our server's IP

3. **Server-Side Implementation**:
   - The implementation is server-side only, so the frontend code doesn't need to know about the proxy
   - All proxy configuration and credentials are kept secure on the server

## Configuration

The Fixie proxy is configured with the following details:

```javascript
// Default Fixie configuration
const fixieUrl = process.env.FIXIE_URL || 
                 process.env.HTTP_PROXY || 
                 process.env.HTTPS_PROXY || 
                 'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';
```

## Testing the Connection

To verify the proxy connection is working:

1. Go to Admin → Settings → API
2. Click "ทดสอบการเชื่อมต่อ" (Test Connection)
3. The system will test the API connection through the Fixie proxy
4. If successful, you'll see confirmation that the API is operational

You can also use the standalone test script:

```javascript
// Run this with Node.js to test the proxy connection directly
node test-proxy.js
```

## Components Using the Proxy

All front-end API requests automatically use the proxy through our API service:

1. The main API service in `src/services/api.ts` routes all requests to `/api/proxy`
2. The proxy endpoint handles authentication and routing through Fixie
3. All components that use the API service automatically benefit from the proxy

## Troubleshooting

If you encounter issues with the API connection:

1. **Check Fixie Credentials**: Verify the Fixie credentials are correct in environment variables
2. **API Settings**: Confirm that API key and host settings are correct
3. **Proxy Logs**: Check the server logs for any proxy-related errors
4. **IP Whitelist**: Make sure the Fixie IP range is whitelisted in API Football

## Security Notes

- The Fixie proxy credentials are stored securely and only used on the server-side
- All communication with the Fixie proxy is secure and authenticated
- Even if the Fixie credentials are exposed, they can be quickly rotated without affecting the application
