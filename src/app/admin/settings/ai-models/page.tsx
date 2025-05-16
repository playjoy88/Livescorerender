'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';

// Mock AI model settings data
const initialSettings = {
  models: {
    statsMaster: {
      enabled: true,
      confidence: 75,
      priority: 1,
      description: 'สถิติเชิงคณิตศาสตร์และการวิเคราะห์ข้อมูลโดยละเอียด',
      featureWeights: {
        historicalMatches: 30,
        recentForm: 25,
        headToHead: 20,
        homeAdvantage: 15,
        playerStats: 10
      }
    },
    formGuru: {
      enabled: true,
      confidence: 82,
      priority: 2,
      description: 'วิเคราะห์ฟอร์มการเล่นล่าสุดของทีม',
      featureWeights: {
        lastFiveMatches: 40,
        scoringTrend: 20,
        defensiveTrend: 20,
        awayHomePerformance: 10,
        teamComposition: 10
      }
    },
    thaiExpert: {
      enabled: true,
      confidence: 80,
      priority: 3,
      description: 'ผู้เชี่ยวชาญเฉพาะด้านไทยลีกและการแข่งขันในประเทศไทย',
      featureWeights: {
        localKnowledge: 35,
        stadiumFactors: 20,
        teamHistory: 15,
        playerInjuries: 15,
        weatherConditions: 15
      }
    },
    community: {
      enabled: false,
      confidence: 65,
      priority: 4,
      description: 'รวมการทำนายของผู้ใช้และวิเคราะห์แนวโน้มการทายผล',
      featureWeights: {
        userConsensus: 45,
        expertPredictions: 25,
        historicalAccuracy: 20,
        volumeOfPredictions: 10
      }
    }
  },
  displayMode: 'all',
  refreshFrequency: 12, // hours
  historyLength: 30, // days
  confidenceThreshold: 60, // percentage
  autoPublish: true,
  enableNotifications: true
};

const AIModelSettingsPage = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('general');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Simulate settings loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const handleModelToggle = (modelKey: string) => {
    setSettings(prev => ({
      ...prev,
      models: {
        ...prev.models,
        [modelKey]: {
          ...prev.models[modelKey as keyof typeof prev.models],
          enabled: !prev.models[modelKey as keyof typeof prev.models].enabled
        }
      }
    }));
  };

  const handleModelChange = (modelKey: string, field: string, value: number | string) => {
    setSettings(prev => ({
      ...prev,
      models: {
        ...prev.models,
        [modelKey]: {
          ...prev.models[modelKey as keyof typeof prev.models],
          [field]: value
        }
      }
    }));
  };

  const handleWeightChange = (modelKey: string, featureKey: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      models: {
        ...prev.models,
        [modelKey]: {
          ...prev.models[modelKey as keyof typeof prev.models],
          featureWeights: {
            ...prev.models[modelKey as keyof typeof prev.models].featureWeights,
            [featureKey]: value
          }
        }
      }
    }));
  };

  const handleGeneralSettingChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleModelExpansion = (modelKey: string) => {
    if (expandedModel === modelKey) {
      setExpandedModel(null);
    } else {
      setExpandedModel(modelKey);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ 
        type: 'success', 
        text: 'บันทึกการตั้งค่าโมเดล AI สำเร็จ' 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-color"></div>
            <p className="ml-3 text-gray-600">กำลังโหลดการตั้งค่าโมเดล AI...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const modelKeys = Object.keys(settings.models);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ตั้งค่าโมเดล AI
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
                : 'bg-red-50 border-l-4 border-red-500 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`${
                  activeTab === 'general'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                การตั้งค่าทั่วไป
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`${
                  activeTab === 'models'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                โมเดล AI
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSave}>
            {activeTab === 'general' ? (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">การตั้งค่าทั่วไปของระบบทำนายผล</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Mode */}
                  <div>
                    <label htmlFor="displayMode" className="block text-sm font-medium text-gray-700 mb-1">
                      โหมดการแสดงผลการทำนาย
                    </label>
                    <select
                      id="displayMode"
                      value={settings.displayMode}
                      onChange={(e) => handleGeneralSettingChange('displayMode', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">แสดงทุกโมเดล</option>
                      <option value="best">แสดงเฉพาะโมเดลที่ดีที่สุด</option>
                      <option value="top3">แสดง 3 โมเดลที่ดีที่สุด</option>
                      <option value="combined">แสดงผลรวมจากทุกโมเดล</option>
                    </select>
                  </div>

                  {/* Refresh Frequency */}
                  <div>
                    <label htmlFor="refreshFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                      ความถี่ในการอัปเดตการทำนายผล (ชั่วโมง)
                    </label>
                    <input
                      type="number"
                      id="refreshFrequency"
                      value={settings.refreshFrequency}
                      onChange={(e) => handleGeneralSettingChange('refreshFrequency', parseInt(e.target.value))}
                      min="1"
                      max="48"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* History Length */}
                  <div>
                    <label htmlFor="historyLength" className="block text-sm font-medium text-gray-700 mb-1">
                      ระยะเวลาในการเก็บประวัติการทำนายผล (วัน)
                    </label>
                    <input
                      type="number"
                      id="historyLength"
                      value={settings.historyLength}
                      onChange={(e) => handleGeneralSettingChange('historyLength', parseInt(e.target.value))}
                      min="7"
                      max="90"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Confidence Threshold */}
                  <div>
                    <label htmlFor="confidenceThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับความเชื่อมั่นขั้นต่ำที่จะแสดงผล (%)
                    </label>
                    <input
                      type="number"
                      id="confidenceThreshold"
                      value={settings.confidenceThreshold}
                      onChange={(e) => handleGeneralSettingChange('confidenceThreshold', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Auto Publish */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoPublish"
                      checked={settings.autoPublish}
                      onChange={(e) => handleGeneralSettingChange('autoPublish', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoPublish" className="ml-2 block text-sm text-gray-700">
                      เผยแพร่การทำนายผลโดยอัตโนมัติ
                    </label>
                  </div>

                  {/* Enable Notifications */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableNotifications"
                      checked={settings.enableNotifications}
                      onChange={(e) => handleGeneralSettingChange('enableNotifications', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-700">
                      เปิดใช้งานการแจ้งเตือนเมื่อมีการทำนายผลใหม่
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">การตั้งค่าโมเดล AI</h2>
                <div className="space-y-4">
                  {modelKeys.map((modelKey) => {
                    const model = settings.models[modelKey as keyof typeof settings.models];
                    const isExpanded = expandedModel === modelKey;
                    
                    return (
                      <div key={modelKey} className="border rounded-lg overflow-hidden">
                        <div 
                          className={`p-4 cursor-pointer flex justify-between items-center ${model.enabled ? 'bg-white' : 'bg-gray-50'}`}
                          onClick={() => toggleModelExpansion(modelKey)}
                        >
                          <div className="flex items-center">
                            <div className="mr-4">
                              <input
                                type="checkbox"
                                checked={model.enabled}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleModelToggle(modelKey);
                                }}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {modelKey === 'statsMaster' && 'Playjoy Stats Master'}
                                {modelKey === 'formGuru' && 'Playjoy Form Guru'}
                                {modelKey === 'thaiExpert' && 'Playjoy Thai Expert'}
                                {modelKey === 'community' && 'Playjoy Community'}
                              </h3>
                              <p className="text-sm text-gray-500">{model.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-3">ความแม่นยำ: {model.confidence}%</span>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ระดับความแม่นยำ (%)
                                </label>
                                <input
                                  type="number"
                                  value={model.confidence}
                                  onChange={(e) => handleModelChange(modelKey, 'confidence', parseInt(e.target.value))}
                                  min="0"
                                  max="100"
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ลำดับความสำคัญ
                                </label>
                                <input
                                  type="number"
                                  value={model.priority}
                                  onChange={(e) => handleModelChange(modelKey, 'priority', parseInt(e.target.value))}
                                  min="1"
                                  max="10"
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  คำอธิบาย
                                </label>
                                <input
                                  type="text"
                                  value={model.description}
                                  onChange={(e) => handleModelChange(modelKey, 'description', e.target.value)}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-3">น้ำหนักของปัจจัยต่าง ๆ</h4>
                              <div className="space-y-3">
                                {Object.entries(model.featureWeights).map(([featureKey, weight]) => (
                                  <div key={featureKey} className="flex flex-col">
                                    <div className="flex justify-between mb-1">
                                      <label className="text-sm text-gray-700">
                                        {featureKey === 'historicalMatches' && 'ประวัติการแข่งขันย้อนหลัง'}
                                        {featureKey === 'recentForm' && 'ฟอร์มการเล่นล่าสุด'}
                                        {featureKey === 'headToHead' && 'สถิติการพบกัน'}
                                        {featureKey === 'homeAdvantage' && 'ความได้เปรียบเจ้าบ้าน'}
                                        {featureKey === 'playerStats' && 'สถิติผู้เล่น'}
                                        {featureKey === 'lastFiveMatches' && '5 นัดล่าสุด'}
                                        {featureKey === 'scoringTrend' && 'แนวโน้มการทำประตู'}
                                        {featureKey === 'defensiveTrend' && 'แนวโน้มการป้องกัน'}
                                        {featureKey === 'awayHomePerformance' && 'ผลงานเหย้า-เยือน'}
                                        {featureKey === 'teamComposition' && 'องค์ประกอบของทีม'}
                                        {featureKey === 'localKnowledge' && 'ความรู้ท้องถิ่น'}
                                        {featureKey === 'stadiumFactors' && 'ปัจจัยสนาม'}
                                        {featureKey === 'teamHistory' && 'ประวัติทีม'}
                                        {featureKey === 'playerInjuries' && 'การบาดเจ็บของผู้เล่น'}
                                        {featureKey === 'weatherConditions' && 'สภาพอากาศ'}
                                        {featureKey === 'userConsensus' && 'ความเห็นผู้ใช้'}
                                        {featureKey === 'expertPredictions' && 'ทำนายจากผู้เชี่ยวชาญ'}
                                        {featureKey === 'historicalAccuracy' && 'ความแม่นยำในอดีต'}
                                        {featureKey === 'volumeOfPredictions' && 'ปริมาณการทำนาย'}
                                      </label>
                                      <span className="text-sm font-medium">{weight}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={weight}
                                      onChange={(e) => handleWeightChange(modelKey, featureKey, parseInt(e.target.value))}
                                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-3">
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
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังบันทึก...
                  </span>
                ) : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">เกี่ยวกับระบบทำนายผล</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  โมเดล AI ทำนายผลของ Playjoy ใช้การวิเคราะห์ข้อมูลขั้นสูงเพื่อคาดการณ์ผลการแข่งขันฟุตบอล 
                  โดยมีหลากหลายโมเดลที่เชี่ยวชาญในแง่มุมต่าง ๆ ของเกม ความแม่นยำจะปรับปรุงอย่างต่อเนื่องตามผลการแข่งขันจริง
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIModelSettingsPage;
