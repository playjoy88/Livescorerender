# Fixing 403 Forbidden Error with API-SPORTS Football API

This guide specifically addresses the `403 Forbidden` error you're encountering with the API-SPORTS Football service on your production site.

## Understanding the 403 Error

A 403 Forbidden error means:
- Your request was received by the server
- The server understood your request
- The server is **refusing** to authorize it

In the context of API-SPORTS Football, this typically means one of these issues:
1. **Authentication Issue**: Your API key is invalid or expired
2. **Authorization Issue**: Your domain isn't properly configured
3. **Rate Limiting**: You've exceeded your API call limits

Based on the error logs you provided:
```
Error fetching data from API: Error: API request failed with status 403
```

This is most likely an authentication or authorization issue.

## Important API Information

You are using API-SPORTS directly:
- Base URL: `https://v3.football.api-sports.io/`
- Required Header: `x-apisports-key` (not RapidAPI headers)
- Request Type: GET requests only
- Rate Limits: Tracked in response headers

## Immediate Solution Steps

### 1. Update API Service Configuration

First, make sure your API configuration is using the correct endpoint and headers:

1. In your `.env.local` file, update these variables:
   ```
   NEXT_PUBLIC_API_URL=https://v3.football.api-sports.io
   NEXT_PUBLIC_API_KEY=your_actual_api_key
   NEXT_PUBLIC_API_HOST=v3.football.api-sports.io
   ```

2. In the Vercel dashboard for your project:
   - Go to "Settings" → "Environment Variables"
   - Update the same variables with the correct values

### 2. Update the API Service Code

Your API service may be using RapidAPI headers. Let's update it to use the correct API-SPORTS headers:

```javascript
// In src/services/api.ts
export async function fetchFromApi({ endpoint, params = {}, cacheDuration = CACHE_DURATION }: ApiOptions) {
  // ...existing code...
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,
        // Remove any RapidAPI headers if they exist
      }
    });
    
    // ...rest of the function...
  }
}
```

### 3. Check Your API Key and Subscription

Verify that your API key is valid and your subscription is active:

1. Log in to your [API-SPORTS account](https://dashboard.api-sports.io/)
2. Check your active subscriptions
3. Verify your API key is valid
4. Check your usage limits in the dashboard
5. Make sure your API key is correctly set in both environments

### 4. Monitor Rate Limits

API-SPORTS provides rate limit information in response headers:

- `x-ratelimit-requests-limit`: Daily request limit based on your subscription
- `x-ratelimit-requests-remaining`: Remaining daily requests
- `X-RateLimit-Limit`: Maximum API calls per minute
- `X-RateLimit-Remaining`: Remaining API calls per minute

You can modify your API service to log these values to help debug rate limiting issues:

```javascript
// Add this to your fetchFromApi function
if (response.headers) {
  console.log('Daily limit:', response.headers.get('x-ratelimit-requests-limit'));
  console.log('Daily remaining:', response.headers.get('x-ratelimit-requests-remaining'));
  console.log('Minute limit:', response.headers.get('X-RateLimit-Limit'));
  console.log('Minute remaining:', response.headers.get('X-RateLimit-Remaining'));
}
```

## Special Fix for CORS Issues

If you're having CORS issues with API-SPORTS, update your `vercel.json` file:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET" },
        { "key": "Access-Control-Allow-Headers", "value": "x-apisports-key, Content-Type" }
      ]
    }
  ]
}
```

## Using a Backend Proxy (Recommended Solution)

The most secure approach is to create a server-side proxy for your API calls:

1. Create a Next.js API route to proxy the request:
   ```javascript
   // pages/api/football-proxy.js
   export default async function handler(req, res) {
     const { endpoint, ...params } = req.query;
     
     const queryString = new URLSearchParams();
     Object.entries(params).forEach(([key, value]) => {
       queryString.append(key, String(value));
     });
     
     const url = `https://v3.football.api-sports.io/${endpoint}${queryString.toString() ? `?${queryString.toString()}` : ''}`;
     
     try {
       const response = await fetch(url, {
         headers: {
           'x-apisports-key': process.env.API_KEY // Server-side env var
         }
       });
       
       // Forward rate limit headers to client for debugging
       if (response.headers) {
         res.setHeader('X-Daily-Limit', response.headers.get('x-ratelimit-requests-limit') || '');
         res.setHeader('X-Daily-Remaining', response.headers.get('x-ratelimit-requests-remaining') || '');
       }
       
       const data = await response.json();
       res.status(200).json(data);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }
   ```

2. Update your frontend code to use this proxy:
   ```javascript
   // In src/services/api.ts
   const API_URL = '/api/football-proxy';
   ```

This approach keeps your API key on the server side, which is more secure and often resolves CORS and authorization issues.

## Contact API-SPORTS Support

If you've tried these steps and still encounter 403 errors:

1. Contact API-SPORTS support with your API key and error details
2. Provide them with:
   - Your API key (or at least the last few characters to identify it)
   - The domain you're accessing from
   - The exact endpoints you're trying to access
   - Screenshots of the error messages
