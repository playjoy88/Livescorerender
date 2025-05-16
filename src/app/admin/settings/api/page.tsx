'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';
import apiSettingsService, { ApiSettings, ApiTestResult } from '../../../../services/apiSettingsService';

// Default API settings data
const defaultSettings = {
  api_key: '311ca0120aa14feefaef14e768723481',
  api_host: 'v3.football.api-sports.io',
  cache_timeout: 5,
  request_limit: 1000,
  endpoints: {
    fixtures: true,
    standings: true,
    teams: true,
    players: true,
    odds: false,
    predictions: true
  },
  debug_mode: false,
  polling_interval: 60, // seconds
  api_version: 'v3'
};

// Define proper types
type EndpointConfig = {
  fixtures: boolean;
  standings: boolean;
  teams: boolean;
  players: boolean;
  odds: boolean;
  predictions: boolean;
};

type FormattedSettings = {
  apiKey: string;
  apiHost: string;
  apiVersion: string;
  cacheTimeout: number;
  requestLimit: number;
  pollingInterval: number;
  debugMode: boolean;
  endpoints: EndpointConfig;
};

const APIsettingsPage = () => {
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [formattedSettings, setFormattedSettings] = useState<FormattedSettings>({
    apiKey: '',
    apiHost: '',
    apiVersion: 'v3',
    cacheTimeout: 5,
    requestLimit: 1000,
    pollingInterval: 60,
    debugMode: false,
    endpoints: {
      fixtures: true,
      standings: true,
      teams: true,
      players: true,
      odds: false,
      predictions: true
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await apiSettingsService.getSettings();
        
        if (data) {
          setSettings(data);
          
          // Format settings for the form
          const endpoints = data.endpoints as Record<string, boolean> | null;
          
          setFormattedSettings({
            apiKey: data.api_key,
            apiHost: data.api_host,
            apiVersion: data.api_version,
            cacheTimeout: data.cache_timeout,
            requestLimit: data.request_limit,
            pollingInterval: data.polling_interval,
            debugMode: data.debug_mode,
            endpoints: typeof endpoints === 'object' && endpoints !== null
              ? {
                  fixtures: !!endpoints.fixtures,
                  standings: !!endpoints.standings,
                  teams: !!endpoints.teams,
                  players: !!endpoints.players,
                  odds: !!endpoints.odds,
                  predictions: !!endpoints.predictions
                }
              : {
                  fixtures: true,
                  standings: true,
                  teams: true,
                  players: true,
                  odds: false,
                  predictions: true
                }
          });
        } else {
          // If no settings exist, use defaults
          setFormattedSettings({
            apiKey: defaultSettings.api_key,
            apiHost: defaultSettings.api_host,
            apiVersion: defaultSettings.api_version,
            cacheTimeout: defaultSettings.cache_timeout,
            requestLimit: defaultSettings.request_limit,
            pollingInterval: defaultSettings.polling_interval,
            debugMode: defaultSettings.debug_mode,
            endpoints: defaultSettings.endpoints
          });
        }
      } catch (error) {
        console.error('Failed to fetch API settings:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load API settings from the database' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('endpoints.')) {
        const endpoint = name.split('.')[1] as keyof EndpointConfig;
        setFormattedSettings(prev => ({
          ...prev,
          endpoints: {
            ...prev.endpoints,
            [endpoint]: checked
          }
        }));
      } else {
        setFormattedSettings(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormattedSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Convert form values back to database schema
      const updateData = {
        api_key: formattedSettings.apiKey,
        api_host: formattedSettings.apiHost,
        api_version: formattedSettings.apiVersion,
        cache_timeout: Number(formattedSettings.cacheTimeout),
        request_limit: Number(formattedSettings.requestLimit),
        polling_interval: Number(formattedSettings.pollingInterval),
        debug_mode: formattedSettings.debugMode,
        endpoints: formattedSettings.endpoints
      };

      let result;
      if (settings?.id) {
        // Update existing settings
        result = await apiSettingsService.updateSettings(settings.id, updateData);
      } else {
        // Create new settings if none exist
        result = await apiSettingsService.createSettings(updateData);
      }

      if (result) {
        setSettings(result);
        setMessage({ 
          type: 'success', 
          text: 'บันทึกการตั้งค่า API สำเร็จ' 
        });
      } else {
        throw new Error('Failed to save settings');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ 
        type: 'error', 
        text: `เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ${err instanceof Error ? err.message : JSON.stringify(err)}` 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setMessage({ type: 'info', text: 'กำลังทดสอบการเชื่อมต่อ API...' });
    setShowTestResults(false);
    setIsTestingApi(true);
    
    try {
      const result = await apiSettingsService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message
        });
      }
      
      // Show test results
      setShowTestResults(true);
    } catch (err) {
      console.error('Error testing API connection:', err);
      setMessage({ 
        type: 'error', 
        text: 'ไม่สามารถเชื่อมต่อกับ API ได้ โปรดตรวจสอบการตั้งค่า' 
      });
      setTestResult(null);
      setShowTestResults(false);
    } finally {
      setIsTestingApi(false);
    }
  };

  const toggleApiKeyVisibility = () => {
    setApiKeyVisible(!apiKeyVisible);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-color"></div>
            <p className="ml-3 text-gray-600">กำลังโหลดการตั้งค่า API...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Main component rendering
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ตั้งค่า API
          </h1>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-primary-color hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปหน้าแอดมิน
          </button>
        </div>

        {message.text && (
          <div 
            className={`mb-4 p-4 rounded ${
              message.type === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
                : message.type === 'error'
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700'
                : 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSave}>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">การตั้งค่า API</h2>
              
              {/* API Settings Form Fields */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* API Key */}
                  <div className="col-span-2">
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="flex">
                      <input
                        type={apiKeyVisible ? "text" : "password"}
                        id="apiKey"
                        name="apiKey"
                        value={formattedSettings.apiKey || ''}
                        onChange={handleChange}
                        className="flex-grow block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your API key"
                      />
                      <button
                        type="button"
                        onClick={toggleApiKeyVisibility}
                        className="ml-2 px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                      >
                        {apiKeyVisible ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">คีย์สำหรับเข้าถึง API (ไม่ควรเปิดเผยในโค้ดฝั่งลูกค้า)</p>
                  </div>

                  {/* API Host */}
                  <div>
                    <label htmlFor="apiHost" className="block text-sm font-medium text-gray-700 mb-1">
                      API Host
                    </label>
                    <input
                      type="text"
                      id="apiHost"
                      name="apiHost"
                      value={formattedSettings.apiHost || ''}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">โฮสต์สำหรับการเรียก API</p>
                  </div>

                  {/* API Version */}
                  <div>
                    <label htmlFor="apiVersion" className="block text-sm font-medium text-gray-700 mb-1">
                      เวอร์ชัน API
                    </label>
                    <select
                      id="apiVersion"
                      name="apiVersion"
                      value={formattedSettings.apiVersion || 'v3'}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="v2">v2 (Legacy)</option>
                      <option value="v3">v3 (Current)</option>
                      <option value="v4">v4 (Beta)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">เวอร์ชันของ API ที่ใช้</p>
                  </div>
                </div>

                {/* Performance & Caching Settings Section */}
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium mb-4">ประสิทธิภาพและการแคช</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cache Timeout */}
                    <div>
                      <label htmlFor="cacheTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                        ระยะเวลาแคช (นาที)
                      </label>
                      <input
                        type="number"
                        id="cacheTimeout"
                        name="cacheTimeout"
                        value={formattedSettings.cacheTimeout}
                        onChange={handleChange}
                        min="1"
                        max="60"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">เวลาที่ข้อมูลจะถูกเก็บในแคชก่อนการร้องขอใหม่</p>
                    </div>

                    {/* Polling Interval */}
                    <div>
                      <label htmlFor="pollingInterval" className="block text-sm font-medium text-gray-700 mb-1">
                        ช่วงเวลาการอัปเดต (วินาที)
                      </label>
                      <input
                        type="number"
                        id="pollingInterval"
                        name="pollingInterval"
                        value={formattedSettings.pollingInterval}
                        onChange={handleChange}
                        min="30"
                        max="300"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">ความถี่ในการอัปเดตข้อมูลสดจาก API</p>
                    </div>

                    {/* Request Limit */}
                    <div>
                      <label htmlFor="requestLimit" className="block text-sm font-medium text-gray-700 mb-1">
                        จำนวนคำขอต่อวัน
                      </label>
                      <input
                        type="number"
                        id="requestLimit"
                        name="requestLimit"
                        value={formattedSettings.requestLimit}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">จำนวนคำขอสูงสุดต่อวันตามแผนการใช้งาน API</p>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings Section */}
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium mb-4">การตั้งค่าขั้นสูง</h3>
                  <div className="space-y-4">                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="debugMode"
                        name="debugMode"
                        checked={formattedSettings.debugMode}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700">
                        เปิดใช้งานโหมดดีบัก
                      </label>
                      <span className="ml-2 text-xs text-gray-500">(บันทึกรายละเอียดการเรียก API ทั้งหมด)</span>
                    </div>
                  </div>
                </div>

                {/* Endpoints Section */}
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium mb-4">Endpoints ที่เปิดใช้งาน</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="endpoints.fixtures"
                        name="endpoints.fixtures"
                        checked={formattedSettings.endpoints.fixtures}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="endpoints.fixtures" className="ml-2 block text-sm text-gray-700">
                        แมตช์การแข่งขัน (Fixtures)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="endpoints.standings"
                        name="endpoints.standings"
                        checked={formattedSettings.endpoints.standings}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="endpoints.standings" className="ml-2 block text-sm text-gray-700">
                        ตารางคะแนน (Standings)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="endpoints.teams"
                        name="endpoints.teams"
                        checked={formattedSettings.endpoints.teams}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="endpoints.teams" className="ml-2 block text-sm text-gray-700">
                        ทีม (Teams)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="endpoints.players"
                        name="endpoints.players"
                        checked={formattedSettings.endpoints.players}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="endpoints.players" className="ml-2 block text-sm text-gray-700">
                        ผู้เล่น (Players)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="endpoints.odds"
                        name="endpoints.odds"
                        checked={formattedSettings.endpoints.odds}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="endpoints.odds" className="ml-2 block text-sm text-gray-700">
                        อัตราต่อรอง (Odds)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="endpoints.predictions"
                        name="endpoints.predictions"
                        checked={formattedSettings.endpoints.predictions}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="endpoints.predictions" className="ml-2 block text-sm text-gray-700">
                        การทำนาย (Predictions)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Test Results Section */}
              {showTestResults && testResult && (
                <div className="mt-8 border rounded-md p-4">
                  <h3 className="text-md font-semibold mb-2">ผลการทดสอบการเชื่อมต่อ API</h3>
                  <div className={`p-3 rounded-md ${
                    testResult.success ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center mb-3">
                      <div className={`inline-block mr-3 p-2 rounded-full ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        {testResult.success ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                            {testResult.success ? 'การเชื่อมต่อสำเร็จ' : 'การเชื่อมต่อล้มเหลว'}
                          </span>
                        </p>
                        <p className="text-gray-600">{testResult.message}</p>
                      </div>
                    </div>
                    
                    {testResult.details && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2 text-gray-700">รายละเอียดการตอบกลับจาก API</h4>
                        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {/* IP Address information - important for API whitelist */}
                            {testResult.details.serverIp && (
                              <div className="bg-white p-3 rounded shadow-sm col-span-2">
                                <p className="text-sm text-gray-500 mb-1">Server IP Address</p>
                                <div className="flex items-center justify-between">
                                  <p className="font-mono font-medium text-lg">{testResult.details.serverIp}</p>
                                  {!testResult.success && testResult.details.error && testResult.details.error.includes("IP") && (
                                    <span className="text-red-500 text-sm font-medium px-2 py-1 bg-red-50 rounded-full">
                                      ต้องเพิ่ม IP นี้ในรายการที่อนุญาต
                                    </span>
                                  )}
                                </div>
                                
                                {/* IP Restriction Information */}
                                <div className="mt-2 p-2 border border-blue-200 bg-blue-50 rounded text-sm">
                                  <p className="font-medium text-blue-700">🔒 ข้อมูลการจำกัด IP Address</p>
                                  <p className="text-gray-600 mt-1">
                                    API-Football จำกัดการเข้าถึงตาม IP address ของเซิร์ฟเวอร์ที่ส่งคำขอ
                                  </p>
                                  {!testResult.success && testResult.details.error && testResult.details.error.includes("IP") && (
                                    <>
                                      <p className="text-red-600 mt-1">
                                        <strong>หมายเหตุ:</strong> IP address ของคุณยังไม่ได้รับอนุญาตในการเข้าถึง API
                                      </p>
                                      <p className="text-gray-600 mt-1">
                                        เมื่อทดสอบในเครื่องพัฒนา (localhost) จะเห็นข้อผิดพลาดนี้เสมอ เนื่องจาก IP ของคุณยังไม่ได้อยู่ในรายการที่อนุญาต
                                      </p>
                                    </>
                                  )}
                                  <p className="text-gray-600 mt-1">
                                    <strong>การแก้ไขปัญหา:</strong> คุณต้องเพิ่ม IP address ของ Vercel (หรือเซิร์ฟเวอร์ที่ใช้ host) ในรายการ whitelist ของ API-Football
                                  </p>
                                  <p className="text-gray-600 mt-1">
                                    ดูรายละเอียดเพิ่มเติมได้ที่ <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); router.push('/admin'); }}>API_IP_RESTRICTION_GUIDE.md</a>
                                  </p>
                                </div>
                                
                                {!testResult.success && testResult.details.resolution && (
                                  <p className="mt-2 text-sm text-gray-600">{testResult.details.resolution}</p>
                                )}
                              </div>
                            )}
                            {testResult.details.status && (
                              <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">Status Code</p>
                                <p className={`font-mono font-medium text-lg ${testResult.details.status >= 200 && testResult.details.status < 300 ? 'text-green-600' : 'text-red-600'}`}>
                                  {testResult.details.status}
                                  {testResult.details.statusText && ` (${testResult.details.statusText})`}
                                </p>
                              </div>
                            )}
                            
                            {testResult.details.endpoint && (
                              <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">API Endpoint</p>
                                <p className="font-mono font-medium">{testResult.details.endpoint}</p>
                              </div>
                            )}
                          </div>
                          
                          {testResult.details.data && (
                            <div>
                              <h5 className="text-sm text-gray-500 mb-1">ข้อมูลตอบกลับแบบเต็ม</h5>
                              <div className="relative">
                                <pre className="mt-2 text-xs font-mono bg-gray-800 p-4 rounded text-white overflow-auto max-h-64 whitespace-pre-wrap">
                                  {JSON.stringify(testResult.details.data, null, 2)}
                                </pre>
                                {testResult.success && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                    ข้อมูลถูกต้อง
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">คำแนะนำ:</span> {testResult.success 
                          ? 'API พร้อมใช้งาน คุณสามารถบันทึกการตั้งค่าและเริ่มใช้งานคุณสมบัติตามที่คุณต้องการ' 
                          : 'โปรดตรวจสอบ API Key และการตั้งค่า Host หากไม่แน่ใจให้ติดต่อผู้ให้บริการ API'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTestingApi}
                className="px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingApi ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ"}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                ยกเลิก
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default APIsettingsPage;
