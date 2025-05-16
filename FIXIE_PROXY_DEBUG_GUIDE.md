# Fixie Proxy Debugging Guide

This guide provides detailed instructions for testing and debugging the Fixie proxy integration in the LiveScore application. Use these steps to verify that your API requests are correctly routed through Fixie proxy.

## Checking Proxy Traffic in the Fixie Dashboard

1. **Log in to your Fixie account** at https://usefixie.com/
2. Go to the **Dashboard** section
3. Check the **Requests** counter to see if your API calls are being routed through Fixie
   - If the counter is at "0 of 500 monthly requests used," your requests are not being routed through Fixie
   - This indicates a configuration issue that needs to be fixed

## Using the Enhanced Debug Tools

We've added enhanced debugging capabilities to the system:

### Debugging with fixie-test.html

1. Navigate to the `/fixie-test.html` page in your browser
2. Click the "Test API Connection via Fixie Proxy" button
3. Review the detailed debug information that appears:
   - The system will first check your server's IP without the proxy
   - It will then make a request through the `/api/proxy` endpoint, which should use the Fixie proxy
   - The debug log will display proxy-related information, timings, and response details
   - Look for the "API reports request came from IP" to see if a Fixie proxy IP is being used

### Debug Headers in API Responses

The API proxy now includes debug headers in its responses:

- `x-proxy-info` - Shows which Fixie proxy URL is being used
- `x-proxy-time` - Timestamp of when the proxy request was made
- `x-server-env` - The Node.js environment (development or production)

You can view these headers in your browser's developer tools when using fixie-test.html:
1. Open DevTools (F12 or right-click and select "Inspect")
2. Go to the Network tab
3. Click on the API request to /api/proxy
4. Look at the "Response Headers" section

## Common Issues and Solutions

### 1. No Fixie Requests Showing in Dashboard

**Possible causes:**
- Environment variables not properly set
- Proxy configuration in code is incorrect
- Request is not actually using the proxy despite configuration

**Solutions:**
- Verify `FIXIE_URL` is correctly set in your environment variables
- Check that both `next.config.js` and the API route files are correctly configured for proxy usage
- Ensure all fetch requests use the global `HTTP_PROXY` and `HTTPS_PROXY` settings

### 2. Incorrect IP Address in API Response

If the IP address shown is your Vercel server IP instead of a Fixie IP:

**Solutions:**
- Global environment variables may not be affecting fetch requests as expected
- Look at server logs to see if there are any proxy connection errors
- Try to use a direct HTTP client like Axios with explicit proxy configuration

### 3. "IP not allowed" Errors Still Appearing

**Solutions:**
- Verify that the Fixie IP ranges are whitelisted in your API-Football account
- Some API providers require explicit whitelisting of all proxy IPs
- Current Fixie proxy IPs can be verified with Fixie support

## Direct Console Debugging

For more detailed debugging, add these log statements to your `/api/proxy/route.ts` file:

```typescript
// For checking HTTP_PROXY environment variable
console.log('HTTP_PROXY:', process.env.HTTP_PROXY?.replace(/:[^:]*@/, ':****@'));

// For checking request headers
console.log('Request Headers:', JSON.stringify(headers));

// For checking response details
console.log('Response Status:', response.status);
console.log('Response Headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()])));
```

## Vercel Deployment Considerations

When deploying to Vercel:

1. **Environment Variables:**
   - The `HTTP_PROXY` and `HTTPS_PROXY` variables must be set in the Vercel project settings
   - Alternatively, Vercel makes the `FIXIE_URL` environment variable available to the `next.config.js` file
   - In the updated configuration, we set `HTTP_PROXY` and `HTTPS_PROXY` in `next.config.js` using `FIXIE_URL`

2. **Serverless Function Limitations:**
   - Vercel serverless functions have a limited execution context
   - Some global environment variables might not persist between invocations
   - This is why we explicitly set the proxy variables in both `next.config.js` and our API routes

3. **Logging:**
   - In Vercel, check the Function Logs in the deployment details
   - Look for log messages showing the proxy configuration and API requests

## Updating the Fixie Integration

If needed, update the proxy implementation in these files:

1. `src/app/api/proxy/route.ts` - Main API proxy implementation
2. `src/app/api/admin/api-settings/route.ts` - API settings test endpoint
3. `next.config.js` - Global environment configuration

Remember to deploy these changes to Vercel after updating the code.

## Contacting Fixie Support

If you're still having issues, you can contact Fixie support at support@usefixie.com with:

1. Your account details
2. The API service you're trying to access
3. The error messages or behavior you're seeing
4. The IP address of your server (shown in the debug logs)

## Verifying Correct Proxy Configuration

To know that your proxy is definitely working:

1. The IP address in API responses should be a Fixie proxy IP, not your server's IP
2. Your Fixie usage dashboard should show increasing request counts
3. API requests should succeed without IP restriction errors
4. The debug logs in fixie-test.html should show a different IP for direct requests vs. proxied requests
