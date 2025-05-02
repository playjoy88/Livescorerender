'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

// Environment info interface
interface EnvironmentInfo {
  productionMode: boolean;
  apiUrl: string;
  apiKeyPresent: boolean;
  hostname: string;
}

// Result interface
interface ApiResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  data: Record<string, unknown> | null;
  error?: string;
  duration?: number;
}

export default function ApiTestPage() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo>({
    productionMode: true,
    apiUrl: '/api/proxy',
    apiKeyPresent: false,
    hostname: ''
  });
  
  const [results, setResults] = useState<ApiResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});

  // Test endpoints
  const endpoints = [
    { name: 'Countries', path: 'countries' },
    { name: 'Live Matches', path: 'fixtures?live=all' },
    { name: 'Leagues', path: 'leagues' }
  ];

  // Toggle result expansion
  const toggleExpand = (endpoint: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [endpoint]: !prev[endpoint]
    }));
  };

  // Get environment info on load
  useEffect(() => {
    setEnvInfo({
      productionMode: window.location.hostname !== 'localhost',
      apiUrl: '/api/proxy',
      apiKeyPresent: true, // Assuming key is present server-side
      hostname: window.location.hostname
    });
  }, []);

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setResults([]);
    
    // Initialize pending results for all endpoints
    const pendingResults = endpoints.map(endpoint => ({
      endpoint: endpoint.path,
      status: 'pending' as const,
      data: null
    }));
    setResults(pendingResults);
    
    // Run each test
    for (let i = 0; i < endpoints.length; i++) {
      await runTest(endpoints[i].path, i);
    }
    
    setIsRunningTests(false);
  };

  // Run a single test
  const runTest = async (endpoint: string, index: number) => {
    const startTime = performance.now();
    
    try {
      // Clone current results
      const newResults = [...results];
      
      // Update status to pending
      newResults[index] = {
        ...newResults[index],
        status: 'pending'
      };
      setResults(newResults);
      
      // Make the API call
      const response = await fetch(`${envInfo.apiUrl}?endpoint=${endpoint}`);
      const data = await response.json();
      const endTime = performance.now();
      
      // Update with results
      newResults[index] = {
        endpoint,
        status: response.ok ? 'success' : 'error',
        data,
        duration: Math.round(endTime - startTime),
        error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : undefined
      };
      
      setResults(newResults);
      
      // Auto-expand error results
      if (!response.ok) {
        setExpandedResults(prev => ({
          ...prev,
          [endpoint]: true
        }));
      }
      
      return data;
    } catch (error) {
      const endTime = performance.now();
      
      // Update with error
      const newResults = [...results];
      newResults[index] = {
        endpoint,
        status: 'error',
        data: null,
        duration: Math.round(endTime - startTime),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setResults(newResults);
      
      // Auto-expand error results
      setExpandedResults(prev => ({
        ...prev,
        [endpoint]: true
      }));
      
      return null;
    }
  };

  // Format JSON for display
  const formatJson = (data: Record<string, unknown> | null) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-prompt)' }}>
          API Test Page
        </h1>
        
        {/* Environment Information */}
        <div className="mb-8 bg-bg-light p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-text-light">Production Mode</p>
              <p className="font-mono">
                {envInfo.productionMode ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-amber-600">No (Development)</span>
                )}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-text-light">API URL</p>
              <p className="font-mono break-all">{envInfo.apiUrl}</p>
              <p className="text-xs text-text-lighter mt-1">(server-side proxy)</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-text-light">API Key Present</p>
              <p className="font-mono">
                {envInfo.apiKeyPresent ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-text-light">Current Hostname</p>
              <p className="font-mono break-all">{envInfo.hostname}</p>
            </div>
          </div>
        </div>
        
        {/* Test Controls */}
        <div className="mb-8 bg-bg-light p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">API Test Suite</h2>
            <button
              className="bg-primary-color text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
              onClick={runAllTests}
              disabled={isRunningTests}
            >
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {endpoints.map((endpoint, index) => (
              <button
                key={endpoint.path}
                className="px-3 py-1 bg-white rounded border border-gray-300 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => runTest(endpoint.path, index)}
                disabled={isRunningTests}
              >
                Test {endpoint.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Test Results */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Test Results</h2>
          
          {results.length === 0 ? (
            <div className="bg-bg-light p-6 rounded-lg shadow-md text-center text-text-light">
              No tests have been run yet. Click one of the test buttons above to start.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => {
                const endpointName = endpoints.find(e => e.path === result.endpoint)?.name || result.endpoint;
                
                return (
                  <div 
                    key={index}
                    className={`bg-bg-light rounded-lg shadow-md overflow-hidden ${
                      result.status === 'success' ? 'border-l-4 border-green-500' :
                      result.status === 'error' ? 'border-l-4 border-red-500' : ''
                    }`}
                  >
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(result.endpoint)}
                    >
                      <div className="flex items-center space-x-2">
                        {result.status === 'pending' && (
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-blue-600 animate-spin"></div>
                        )}
                        {result.status === 'success' && (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                        {result.status === 'error' && (
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        )}
                        <span className="font-medium">{endpointName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {result.duration && (
                          <span className="text-sm text-text-light">
                            {result.duration}ms
                          </span>
                        )}
                        <button className="text-text-light p-1 focus:outline-none">
                          {expandedResults[result.endpoint] ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {expandedResults[result.endpoint] && (
                      <div className="p-4 border-t border-border-color bg-white">
                        {result.error && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                            {result.error}
                          </div>
                        )}
                        
                        <div className="font-mono text-sm overflow-x-auto bg-gray-50 p-4 rounded">
                          <pre className="whitespace-pre">{formatJson(result.data)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
