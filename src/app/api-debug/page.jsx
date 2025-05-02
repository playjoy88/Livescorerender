'use client';

import React, { useState, useEffect } from 'react';
import { fetchFromApi } from '../../services/api';
import * as apiEndpoints from '../../services/apiEndpoints';
import Layout from '../../components/Layout';

export default function ApiDebugPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [envVars, setEnvVars] = useState({
    api_url: '',
    api_key_present: false,
    api_host: ''
  });

  useEffect(() => {
    // Get environment variables
    setEnvVars({
      api_url: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      api_key_present: !!process.env.NEXT_PUBLIC_API_KEY,
      api_host: process.env.NEXT_PUBLIC_API_HOST || 'Not set'
    });
  }, []);

  const testAPI = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      let data;
      switch(endpoint) {
        case 'status':
          try {
            // First try using the status endpoint from our standardized endpoints
            data = await fetchFromApi({
              endpoint: apiEndpoints.ENDPOINTS.STATUS,
            });
          } catch (err) {
            console.log('Error with status endpoint, trying alternative paths');
            
            // Try alternative paths (some API providers use different endpoint structures)
            try {
              data = await fetchFromApi({
                endpoint: 'v3/status',
              });
            } catch {
              // If all attempts fail, throw the original error
              throw err;
            }
          }
          break;
        case 'live':
          // Use the helper function from apiEndpoints for live fixtures
          const liveOptions = apiEndpoints.getFixturesEndpoint({ live: 'all' });
          data = await fetchFromApi(liveOptions);
          break;
        case 'leagues':
          data = await fetchFromApi({
            endpoint: apiEndpoints.ENDPOINTS.LEAGUES,
          });
          break;
        case 'today':
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const todayOptions = apiEndpoints.getFixturesEndpoint({ date: today });
          data = await fetchFromApi(todayOptions);
          break;
        default:
          data = await fetchFromApi({
            endpoint: apiEndpoints.ENDPOINTS.STATUS,
          });
      }
      
      setResult(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>API URL:</strong> {envVars.api_url}</p>
            <p><strong>API Key present:</strong> {envVars.api_key_present ? 'Yes' : 'No'}</p>
            <p><strong>API Host:</strong> {envVars.api_host}</p>
            <p><strong>Production:</strong> {process.env.NODE_ENV === 'production' ? 'Yes' : 'No'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side rendering'}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">API Tests</h2>
          <p className="mb-2">Click a button to test different API endpoints:</p>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => testAPI('status')}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test API Status
            </button>
            
            <button 
              onClick={() => testAPI('live')}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Live Matches
            </button>
            
            <button 
              onClick={() => testAPI('leagues')}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Test Leagues
            </button>
            
            <button 
              onClick={() => testAPI('today')}
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Test Today&apos;s Matches
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-2 text-gray-600">Testing API connection...</p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-red-600">Error</h2>
            <div className="p-3 bg-red-100 text-red-700 rounded border border-red-300">
              <p className="font-bold">Error Message:</p>
              <p>{error}</p>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="font-bold">Possible Solutions:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check if your API key is valid in .env.local and in the Vercel dashboard</li>
                <li>Verify that {typeof window !== 'undefined' ? `'${window.location.hostname}'` : 'your domain'} is authorized in API-SPORTS</li>
                <li>Check if you've exceeded your API rate limits</li>
                <li>Try a different endpoint or parameter</li>
              </ul>
            </div>
          </div>
        )}
        
        {result && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-green-600">API Response</h2>
            <div className="bg-gray-100 p-3 rounded border border-gray-300">
              <p><strong>Results:</strong> {result.results || 0}</p>
              <p><strong>Response Type:</strong> {result.response ? Array.isArray(result.response) ? 'Array' : 'Object' : 'None'}</p>
              {result.response !== undefined && Array.isArray(result.response) ? (
                <p><strong>Items in response:</strong> {result.response.length}</p>
              ) : null}
              
              <div className="mt-2">
                <p className="font-bold">Full Response:</p>
                <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs mt-2 overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded mt-6">
          <h3 className="font-bold mb-2">Next Steps</h3>
          <p>If you're experiencing API issues in production:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Make sure your environment variables are set correctly in Vercel</li>
            <li>Check domain authorization in API-SPORTS</li>
            <li>Consider using a different API key</li>
            <li>Check if you're on the correct API plan for your usage needs</li>
            <li>Refer to API_PRODUCTION_FIX.md for more detailed troubleshooting</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
