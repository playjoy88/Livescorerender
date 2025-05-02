# API Testing Guide for Playjoy LiveScore

This guide explains how to test the API-Football integration in your LiveScore application during development and after deployment.

## Testing the API Locally

### 1. Using the Development Server

The simplest way to test your API integration is to run the development server and check if data loads correctly:

```bash
# Navigate to your project
cd playjoy-livescore

# Start the development server
npm run dev
```

Visit `http://localhost:3000` and check if the match data appears. If the API is working correctly, you should see leagues, teams, and match data populated on the page.

### 2. Using Browser Developer Tools

To inspect API requests and responses:

1. Open your application in Chrome or Firefox
2. Open Developer Tools (F12 or right-click → Inspect)
3. Go to the "Network" tab
4. Filter for "XHR" or "Fetch" requests
5. Reload the page
6. Look for requests to `api-football-v1.p.rapidapi.com`
7. Click on any request to see:
   - Request headers (should include your API key)
   - Response data
   - Status codes

If you see a 401 or 403 error, it typically indicates an authentication issue with your API key.

### 3. Using the API Service Directly

You can test individual API methods by creating a simple test script. Create a file called `test-api.js` in your project:

```javascript
// test-api.js
import { getLiveFixtures, getFixturesByDate } from './src/services/api';

async function testAPI() {
  try {
    console.log('Testing live fixtures...');
    const liveData = await getLiveFixtures();
    console.log('Live fixtures response:', liveData);

    console.log('Testing fixtures by date...');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fixturesData = await getFixturesByDate(today);
    console.log('Fixtures response:', fixturesData);
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
```

Run this with:

```bash
# Using Node.js with ESM support
node --experimental-modules test-api.js
```

## Debugging API Issues

### Common API Issues and Solutions

1. **401 Unauthorized Error**
   - Check if your API key is correct in the `.env.local` file
   - Verify that the environment variables are being loaded correctly
   - Make sure the headers are properly set in the API requests

2. **403 Forbidden Error**
   - Your domain might not be authorized in the RapidAPI dashboard
   - For local testing, add `localhost` to your authorized domains in RapidAPI

3. **429 Too Many Requests**
   - You've exceeded your API quota
   - Check your subscription plan limits in RapidAPI

4. **Data Not Loading**
   - Check the browser console for JavaScript errors
   - Verify that the API response format matches what your app expects
   - Add more detailed logging to your API service

### Adding Debug Logging

To better understand what's happening with your API calls, add enhanced logging to your API service:

```javascript
// Modified example for src/services/api.ts
export async function fetchFromApi({ endpoint, params = {}, cacheDuration = CACHE_DURATION }: ApiOptions) {
  // Construct the URL with query parameters
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  const url = `${API_URL}/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  console.log(`[API Debug] Requesting: ${url}`);
  console.log(`[API Debug] Headers: API_KEY=${API_KEY ? 'Set' : 'Not Set'}, API_HOST=${API_HOST}`);
  
  // Check cache first
  const cacheKey = url;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < cacheDuration) {
    console.log(`[API Debug] Using cached data for: ${url}`);
    return cache[cacheKey].data;
  }
  
  // Make the API request
  try {
    console.log(`[API Debug] Cache miss, fetching from API: ${url}`);
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });
    
    console.log(`[API Debug] Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[API Debug] Response data received, results: ${data.results || 'unknown'}`);
    
    // Cache the response
    cache[cacheKey] = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error('[API Debug] Error fetching data from API:', error);
    throw error;
  }
}
```

## Testing After Deployment to Vercel

### 1. Verifying API Integration in Production

After deploying to Vercel:

1. Visit your deployed application URL
2. Check if data is loading correctly
3. Use browser developer tools to inspect API requests
4. Look for any errors in the console

### 2. Checking Vercel Logs

Vercel provides detailed logs that can help diagnose API issues:

1. Go to your project in the Vercel Dashboard
2. Click on "Runtime Logs"
3. Filter logs for keywords like "API", "error", or "fetch"
4. Look for any API-related errors or warnings

### 3. Testing Different API Endpoints

You can create a simple test page in your app to verify different API endpoints:

```jsx
// src/app/api-test/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getLiveFixtures, getFixturesByDate, getLeagueStandings, LEAGUE_IDS } from '../../services/api';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  async function runTests() {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Live fixtures
      try {
        const liveData = await getLiveFixtures();
        setTestResults(prev => [...prev, { 
          name: 'Live Fixtures', 
          status: 'Success', 
          results: liveData.results,
          sample: liveData.response?.slice(0, 1) 
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, { 
          name: 'Live Fixtures', 
          status: 'Failed', 
          error: error.message 
        }]);
      }
      
      // Test 2: Fixtures by date
      try {
        const today = new Date().toISOString().split('T')[0];
        const fixturesData = await getFixturesByDate(today);
        setTestResults(prev => [...prev, { 
          name: 'Fixtures by Date', 
          status: 'Success', 
          results: fixturesData.results,
          sample: fixturesData.response?.slice(0, 1)
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, { 
          name: 'Fixtures by Date', 
          status: 'Failed', 
          error: error.message 
        }]);
      }
      
      // Test 3: League standings
      try {
        const standingsData = await getLeagueStandings(LEAGUE_IDS.PREMIER_LEAGUE, 2024);
        setTestResults(prev => [...prev, { 
          name: 'League Standings', 
          status: 'Success', 
          results: standingsData.results,
          sample: standingsData.response?.slice(0, 1)
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, { 
          name: 'League Standings', 
          status: 'Failed', 
          error: error.message 
        }]);
      }
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <button 
        onClick={runTests} 
        disabled={loading}
        className="bg-primary-color text-white px-4 py-2 rounded mb-6"
      >
        {loading ? 'Running Tests...' : 'Run API Tests'}
      </button>
      
      <div className="space-y-6">
        {testResults.map((result, index) => (
          <div key={index} className="border rounded p-4">
            <h2 className="text-lg font-semibold">{result.name}</h2>
            <p className={`font-bold ${result.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
              Status: {result.status}
            </p>
            {result.status === 'Success' && (
              <>
                <p>Results: {result.results || 0}</p>
                <details>
                  <summary className="cursor-pointer text-blue-600">View Sample Data</summary>
                  <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto text-xs">
                    {JSON.stringify(result.sample, null, 2)}
                  </pre>
                </details>
              </>
            )}
            {result.status === 'Failed' && (
              <p className="text-red-600">Error: {result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Add this page to your application, and you can access it at `/api-test` to check all API endpoints directly.

## Testing API Quotas and Rate Limits

API-Football has usage limits based on your subscription plan. To monitor your usage:

1. Log in to your RapidAPI account
2. Go to the API-Football subscription
3. Check the "Analytics" section to see:
   - Total calls made
   - Remaining quota
   - Usage over time

Consider adding rate limiting logic to your application if you're concerned about exceeding limits:

```javascript
// Example rate limiting logic
const API_CALLS_PER_HOUR = 100; // Adjust based on your plan
const callsThisHour = new Map();

function canMakeApiCall(endpoint) {
  const hourKey = new Date().toISOString().split(':')[0]; // YYYY-MM-DDThh
  const key = `${hourKey}:${endpoint}`;
  
  const currentCalls = callsThisHour.get(key) || 0;
  if (currentCalls >= API_CALLS_PER_HOUR) {
    console.warn(`[API Rate Limit] Exceeded limit for ${endpoint} this hour`);
    return false;
  }
  
  callsThisHour.set(key, currentCalls + 1);
  return true;
}

// Then use in your API service
if (!canMakeApiCall(endpoint)) {
  // Return cached data or error
}
```

## Next Steps

If you want to enhance your API testing capabilities:

1. Consider adding a proper logging system like Winston or Pino
2. Set up automated tests using Jest or Cypress
3. Implement proper error handling and fallbacks for when the API is unavailable
4. Create a monitoring dashboard for API usage and performance

These enhancements will help ensure your application remains reliable even when facing API-related challenges.
