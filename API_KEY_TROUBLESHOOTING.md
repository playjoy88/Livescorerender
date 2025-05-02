# API Key Error Troubleshooting Guide

This guide addresses the common error: `"Error/Missing application key"` that appears when testing the API.

## Error Analysis

When you see the following error response:

```json
{
  "get": "status",
  "parameters": [],
  "errors": {
    "token": "Error/Missing application key. Go to https://www.api-football.com/documentation-v3 to learn how to get your API application key."
  },
  "results": 0,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": []
}
```

This indicates that the API key is either missing, invalid, or not being properly passed to the API-SPORTS service.

## Common Causes & Solutions

### 1. Missing Environment Variable in Vercel

**Problem:** The `API_KEY` environment variable is not set in your Vercel deployment.

**Solutions:**
- Go to your Vercel project dashboard
- Navigate to "Settings" > "Environment Variables"
- Add or verify the environment variable: 
  - Name: `API_KEY`
  - Value: Your API-SPORTS API key
- Redeploy your application after setting the environment variable

### 2. Using an Expired or Invalid API Key

**Problem:** Your API key may be expired, revoked, or invalid.

**Solutions:**
- Verify your API key is still active in your API-SPORTS dashboard
- Test the key directly with a simple request to the API
- Get a new API key if necessary

### 3. API Host Authentication Issues

**Problem:** Your domain may not be authorized with API-SPORTS.

**Solutions:**
- Add your Vercel deployment URL to your authorized domains in the API-SPORTS dashboard
- Remember that API-SPORTS requires domain authorization for their API keys

### 4. Verifying the API Proxy Implementation

Check that the API proxy is correctly passing the API key:

```javascript
// In src/app/api/proxy/route.js
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

// Later in the fetch request:
const headers = {
  'x-apisports-key': API_KEY
};
```

### 5. Checking for Rate Limits

**Problem:** You may have exceeded your API quota or rate limits.

**Solutions:**
- Check your API-SPORTS dashboard for usage statistics
- Implement better caching to reduce API calls
- Consider upgrading your API plan if needed

## Next Steps

1. Update your Vercel environment variables with the correct API key
2. Deploy the application again
3. Test the API endpoints
4. Monitor the server logs for any additional error information

## Example Vercel Environment Variable Setup

![Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables/images/env-var-project-settings.png)

## API-SPORTS Requirements

- Valid API key
- Authorized domains for API access
- Proper request formatting (headers, parameters)
- Adhering to rate limits

Remember that the server-side proxy implementation is designed to keep your API key secure by only storing it on the server side, never exposing it to client-side code.
