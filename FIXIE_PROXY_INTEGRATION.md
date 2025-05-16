# Fixie Proxy Integration for API-Football

## Overview

To resolve the IP restriction issues with the API-Football service, we've integrated the Fixie proxy service. This allows all API requests to originate from a fixed, known IP address that can be easily whitelisted with the API provider.

## Implementation Details

### Fixie Configuration

- **Proxy URL**: `http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80`
- **HTTP Basic Auth**: Username: `fixie`, Password: `L56rcsBn8mulaUC`
- **Proxy Method**: All API requests are now routed through the Fixie proxy service

### Files Modified

1. **`src/app/api/proxy/route.ts`**
   - Updated to proxy all API-Football requests through Fixie
   - Used HTTP Basic Auth for Fixie authentication
   - Implemented URL-based proxy approach for compatibility with Vercel edge functions

2. **`src/app/api/proxy/route.js`**
   - Similar updates as the TypeScript version
   - Ensured compatibility with JavaScript codebase

3. **`src/app/api/admin/api-settings/route.ts`**
   - Updated the API testing function to use Fixie proxy
   - Added detailed logging for proxy connection status

### How It Works

1. When an API request is initiated, instead of contacting API-Football directly, the request is sent to Fixie
2. Fixie acts as an intermediary, forwarding the request from its fixed IP address
3. API-Football receives the request from Fixie's IP (which should be whitelisted)
4. The response is relayed back through Fixie to our application

### Request Flow

```
Client -> Next.js API Routes -> Fixie Proxy -> API-Football -> Fixie Proxy -> Next.js API Routes -> Client
```

## Benefits

1. **Consistent IP Address**: All requests come from the same fixed IP, regardless of where your Vercel functions are executing
2. **No IP Whitelisting Hassle**: No need to constantly update IP addresses in the API dashboard
3. **Global Access**: Works from any deployment environment (development, staging, production)
4. **Simple Implementation**: No complex networking setup required

## Testing the Connection

When you click the "ทดสอบการเชื่อมต่อ" (Test Connection) button in Admin Settings:
1. The request is now routed through Fixie
2. The system still shows your server's IP (for informational purposes)
3. The connection should succeed regardless of server IP since Fixie's IP will be used

## Troubleshooting

If you encounter connectivity issues:

1. **Fixie Authentication**: Ensure the Fixie credentials are correct
2. **Proxy URL Format**: Verify the proxy URL is correctly formatted
3. **API Host**: Confirm the API host is set to `v3.football.api-sports.io`
4. **Headers**: Make sure all the required headers are being passed through:
   - `x-rapidapi-key`
   - `x-rapidapi-host`
   - `x-apisports-key`
   - `Proxy-Authorization`

## Future Considerations

- Fixie credentials should ideally be stored in environment variables for security
- Monitor your Fixie usage as there may be bandwidth/request limits
- Consider implementing error handling specifically for proxy-related issues

## Reverting to Direct Access

If you need to revert to direct API access:
1. Remove the proxy URL and Fixie-specific headers
2. Restore the original direct fetch calls
3. Be prepared to handle IP restrictions again
