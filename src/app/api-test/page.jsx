'use client';

import React, { useState, useEffect } from 'react';
import { fetchFromApi } from '../../services/api';
import * as apiEndpoints from '../../services/apiEndpoints';

export default function ApiTestPage() {
  const [status, setStatus] = useState(null);
  const [live, setLive] = useState(null);
  const [leagues, setLeagues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [environment, setEnvironment] = useState({
    isProduction: false,
    apiUrl: '',
    hasApiKey: false,
  });

  useEffect(() => {
    // Always show we're using the proxy in the interface
    setEnvironment({
      isProduction: true, // Always use proxy
      apiUrl: '/api/proxy',
      hasApiKey: true, // API key is managed on server side
    });
  }, []);

  const testStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test API status endpoint
      const data = await fetchFromApi({
        endpoint: apiEndpoints.ENDPOINTS.STATUS,
      });
      setStatus(data);
      console.log('Status API response:', data);
    } catch (err) {
      console.error('API Status Error:', err);
      setError(`Status API error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLive = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test live fixtures endpoint
      const liveOptions = apiEndpoints.getFixturesEndpoint({ live: 'all' });
      const data = await fetchFromApi(liveOptions);
      setLive(data);
      console.log('Live API response:', data);
    } catch (err) {
      console.error('Live API Error:', err);
      setError(`Live API error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLeagues = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test leagues endpoint
      const data = await fetchFromApi({
        endpoint: apiEndpoints.ENDPOINTS.LEAGUES,
      });
      setLeagues(data);
      console.log('Leagues API response:', data);
    } catch (err) {
      console.error('Leagues API Error:', err);
      setError(`Leagues API error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Simple API Test Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Info</h2>
        <p><strong>Production Mode:</strong> {environment.isProduction ? 'Yes' : 'No'}</p>
        <p><strong>API URL:</strong> {environment.isProduction ? '/api/proxy' : environment.apiUrl} {environment.isProduction && <span className="text-red-500">(server-side proxy)</span>}</p>
        <p><strong>API Key Present:</strong> {environment.hasApiKey ? 'Yes' : 'No'}</p>
        <p><strong>Current Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Server'}</p>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={testStatus}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Status API
        </button>
        <button 
          onClick={testLive}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Live Matches
        </button>
        <button 
          onClick={testLeagues}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Leagues
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-300 rounded">
          <h3 className="text-lg font-semibold text-red-700">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {status && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Status API Result</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm mt-2">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
      
      {live && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Live Matches Result</h3>
          <p>Found {live.results || 0} live matches</p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm mt-2">
            {JSON.stringify(live, null, 2)}
          </pre>
        </div>
      )}
      
      {leagues && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Leagues Result</h3>
          <p>Found {leagues.results || 0} leagues</p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm mt-2">
            {JSON.stringify(leagues, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-2">API Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure your environment variables are set correctly in Vercel</li>
          <li>Check if your API key is valid and has enough requests remaining</li>
          <li>Ensure your domain is authorized with API-SPORTS</li>
          <li>For local development, make sure your .env.local file is configured correctly</li>
          <li>Review network requests in your browser's developer tools for more details</li>
        </ul>
      </div>
    </div>
  );
}
