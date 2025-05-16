'use client';

import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '@/services/apiEndpoints';
import { fetchFromApi } from '@/services/api';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [apiHeaders, setApiHeaders] = useState<Record<string, string>>({});
  const [apiSettings, setApiSettings] = useState<{
    apiHost: string;
    apiVersion: string;
    debugMode: boolean;
  } | null>(null);

  useEffect(() => {
    async function testApiConnection() {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get status endpoint (simplest endpoint)
        const response = await fetchFromApi({
          endpoint: ENDPOINTS.STATUS
        });
        
        setApiStatus(response);
        
        // Check response headers from Network tab
        const headers: Record<string, string> = {};
        
        // Display API settings from proxy response headers
        if (response && response.headers) {
          headers['Request Limit'] = response.headers['x-ratelimit-requests-limit'] || 'Not available';
          headers['Requests Remaining'] = response.headers['x-ratelimit-requests-remaining'] || 'Not available';
          headers['Rate Limit'] = response.headers['X-RateLimit-Limit'] || 'Not available';
          headers['Rate Remaining'] = response.headers['X-RateLimit-Remaining'] || 'Not available';
        }
        
        setApiHeaders(headers);
        
        // Try to get API settings from proxy endpoint directly
        const settingsResponse = await fetch('/api/proxy-settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setApiSettings(settingsData);
        }
        
      } catch (err) {
        console.error('Error testing API connection:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    
    testApiConnection();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3">Testing API connection...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">API connection successful!</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
              <div className="mt-4 space-y-2">
                {apiSettings ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">API Host</p>
                      <p className="mt-1 text-sm text-gray-900">{apiSettings.apiHost}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">API Version</p>
                      <p className="mt-1 text-sm text-gray-900">{apiSettings.apiVersion}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Debug Mode</p>
                      <p className="mt-1 text-sm text-gray-900">{apiSettings.debugMode ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">API settings not available</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Headers from API</h3>
              <div className="mt-4">
                {Object.keys(apiHeaders).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(apiHeaders).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-500">{key}</p>
                        <p className="mt-1 text-sm text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No headers available</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">API Response</h3>
              <div className="mt-4">
                <div className="bg-gray-100 rounded p-4 overflow-auto max-h-96">
                  <pre className="text-xs">
                    {JSON.stringify(apiStatus, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
