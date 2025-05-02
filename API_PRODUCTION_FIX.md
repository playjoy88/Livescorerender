# API Production Fix for live-score-pink.vercel.app

This guide addresses the specific issue with your deployed LiveScore application at https://live-score-pink.vercel.app/ still using mockup data instead of real API data.

## Immediate Actions to Fix API Loading

### 1. Verify Environment Variables in Vercel

First, let's make sure your environment variables are correctly set in Vercel:

1. Go to your [Vercel Dashboard](https://vercel.com/)
2. Select the project connected to live-score-pink.vercel.app
3. Navigate to "Settings" → "Environment Variables"
4. Check if the following variables exist and are correctly set:
   ```
   NEXT_PUBLIC_API_URL=https://api-football-v1.p.rapidapi.com/v3
   NEXT_PUBLIC_API_KEY=your_actual_api_key
   NEXT_PUBLIC_API_HOST=api-football-v1.p.rapidapi.com
   ```
5. If any are missing or incorrect, add/update them
6. After updating, you need to **redeploy your application** for the changes to take effect

### 2. Add Specific Domain Authorization in RapidAPI

Make sure to authorize your exact production domain in RapidAPI:

1. Log in to [RapidAPI](https://rapidapi.com/)
2. Go to your API-Football subscription
3. Navigate to Security/Settings
4. Add specifically: `live-score-pink.vercel.app` to your authorized domains list
5. Save the changes

### 3. Check for Network/CORS Errors

Inspect the site for network errors:

1. Visit https://live-score-pink.vercel.app/
2. Open browser developer tools (F12 or right-click → Inspect)
3. Go to the "Console" tab
4. Look for any error messages related to:
   - API calls
   - CORS issues
   - 401/403 authentication issues

### 4. Diagnose with Network Monitoring

To see exactly what's happening with the API requests:

1. In browser developer tools, go to the "Network" tab
2. Filter for "XHR" or "Fetch" requests
3. Refresh the page
4. Look for any requests to `api-football-v1.p.rapidapi.com`
5. Check their:
   - Status (200, 401, 403, etc.)
   - Request headers (especially authorization)
   - Response body

## Deeper Fixes If Above Steps Don't Work

### 1. Add a Custom Debug Version

Create a special debug version that logs detailed information about API calls:

```jsx
// Add this to your src/app/page.tsx file
const debugAPIInfo = () => {
  return (
    <div className="text-xs p-2 bg-gray-100 mt-4 rounded overflow-auto max-h-40">
      <h4 className="font-bold">API Debug Info:</h4>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
      <p>API Key present: {process.env.NEXT_PUBLIC_API_KEY ? 'Yes' : 'No'}</p>
      <p>API Host: {process.env.NEXT_PUBLIC_API_HOST || 'Not set'}</p>
      <p>Production: {process.env.NODE_ENV === 'production' ? 'Yes' : 'No'}</p>
      <p>URL: {typeof window !== 'undefined' ? window.location.href : ''}</p>
    </div>
  );
};

// Add this to your return JSX, inside the main container:
{process.env.NODE_ENV === 'development' && debugAPIInfo()}
```

### 2. Modify API Service for Better Error Reporting

Update your API service to provide more context in errors:

```javascript
// In src/services/api.ts
export async function fetchFromApi({ endpoint, params = {}, cacheDuration = CACHE_DURATION }: ApiOptions) {
  // Construct the URL with query parameters
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  const url = `${API_URL}/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  // Debug info in production
  console.log(`[API] Calling ${url}`);
  console.log(`[API] Using key: ${API_KEY.substring(0, 5)}...`);
  console.log(`[API] Host: ${API_HOST}`);
  
  // Rest of your function...
}
```

### 3. Create a Custom API Test Page

Add a dedicated test page to check API connectivity:

1. Create a new file `src/app/api-debug/page.tsx`
2. Add the following content:

```tsx
'use client';

import React, { useState } from 'react';
import { fetchFromApi } from '../../services/api';

export default function ApiDebugPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFromApi({
        endpoint: 'status',
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-3 rounded">
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
          <p>API Key set: {process.env.NEXT_PUBLIC_API_KEY ? 'Yes' : 'No'}</p>
          <p>API Host: {process.env.NEXT_PUBLIC_API_HOST || 'Not set'}</p>
        </div>
      </div>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">API Response:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

After deploying, visit: https://live-score-pink.vercel.app/api-debug to test API connectivity.

### 4. Consider API Key Issues

If you're still having problems, the API key itself might be the issue:

1. Generate a completely new API key in RapidAPI
2. Check your subscription status and limits
3. Try a different endpoint or API plan if available
4. Contact RapidAPI support if you believe there's an issue with their service

## Implementing a Reliable Fallback Strategy

If API issues persist, you might want to adjust the fallback behavior:

```jsx
// In src/app/page.tsx, modify your fetchMatchData function
try {
  // API fetching code...
  
  // If API didn't return matches or failed, use sample data for demonstration
  if (fetchedMatches.length === 0) {
    console.log('No matches from API, using sample data');
    fetchedMatches = [...sampleMatches];
  }
  
  // Display a notice when using sample data
  if (fetchedMatches === sampleMatches) {
    setErrorMessage('Using demo data. To see real data, please set up your API key.');
  } else {
    setErrorMessage(null);
  }
  
} catch (error) {
  // Error handling...
}
```

Add a UI indicator when showing mockup data instead of real data:

```jsx
// In your JSX, add this notice when mockup data is used
{!isLoading && Object.keys(matchesByLeague).length > 0 && errorMessage && (
  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
    <p className="font-bold">Notice</p>
    <p>{errorMessage}</p>
  </div>
)}
```

This will make it clear to users when they're seeing mockup data vs. real API data.
