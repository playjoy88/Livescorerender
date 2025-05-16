'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Site settings data
const initialSettings = {
  site: {
    name: 'Playjoy Livescore',
    slogan: 'สนุกกับทุกจังหวะของเกม',
    description: 'เว็บไซต์ดูบอลสดและทำนายผลฟุตบอลที่ทันสมัยที่สุดในประเทศไทย',
    language: 'th',
    timeZone: 'Asia/Bangkok',
    emailContact: 'contact@playjoy.live',
    primaryColor: '#0056b3',
    secondaryColor: '#ff6600',
    fontTitles: 'Prompt',
    fontBody: 'Sarabun'
  },
  social: {
    facebook: 'https://facebook.com/playjoylive',
    twitter: 'https://twitter.com/playjoylive',
    instagram: 'https://instagram.com/playjoylive',
    line: 'https://line.me/ti/p/@playjoylive',
    youtube: 'https://youtube.com/c/playjoylive'
  },
  seo: {
    titleTemplate: '%s | Playjoy Livescore',
    metaDescription: 'ดูบอลสด ทำนายผลบอล ตารางคะแนน อัพเดทข่าวสารวงการฟุตบอลทั่วโลก',
    ogImage: '/images/og-image.jpg',
    googleVerification: 'abcd1234efgh5678ijkl',
    enableOpenGraph: true,
    enableTwitterCards: true,
    enableStructuredData: true
  },
  content: {
    featuredLeagues: [39, 140, 135, 78, 290], // Premier League, La Liga, Serie A, Bundesliga, Thai League
    defaultMatchDisplay: 5,
    matchSortOrder: 'leagueFirst', // 'leagueFirst', 'timeFirst'
    enablePredictions: true,
    enableNews: true,
    enableStandings: true,
    enableNotifications: true,
    pinnedMatchesLimit: 5
  },
  performance: {
    enableCaching: true,
    cacheDuration: 5, // minutes
    lazyLoadImages: true,
    enablePWA: true,
    enableAMP: false
  }
};

const SiteSettingsPage = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();

  useEffect(() => {
    // Simulate settings loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const handleTextChange = (section: keyof typeof settings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNumberChange = (section: keyof typeof settings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: parseInt(value)
      }
    }));
  };

  // Toggle for checkboxes
  const handleToggleChange = (section: keyof typeof settings, field: string, checked: boolean) => {
    // This function will be used when implementing toggle checkboxes in UI
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  // Function to toggle leagues in the featured leagues list
  const handleLeagueToggle = (leagueId: number) => {
    // This function will be used when implementing league selection UI
    setSettings(prev => {
      const currentLeagues = [...prev.content.featuredLeagues];
      const index = currentLeagues.indexOf(leagueId);
      
      if (index === -1) {
        currentLeagues.push(leagueId);
      } else {
        currentLeagues.splice(index, 1);
      }
      
      return {
        ...prev,
        content: {
          ...prev.content,
          featuredLeagues: currentLeagues
        }
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Import here to avoid server component issues
      const { updateSiteSettings } = await import('@/services/adminService');
      
      // Save general settings
      if (activeTab === 'general') {
        const result = await updateSiteSettings('general', { 
          settings: settings.site 
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save general settings');
        }
      }
      
      // Save other settings based on active tab
      else if (activeTab === 'social') {
        await updateSiteSettings('social', { settings: settings.social });
      }
      else if (activeTab === 'seo') {
        await updateSiteSettings('seo', { settings: settings.seo });
      }
      else if (activeTab === 'content') {
        await updateSiteSettings('content', { settings: settings.content });
      }
      else if (activeTab === 'performance') {
        await updateSiteSettings('performance', { settings: settings.performance });
      }
      
      setMessage({ 
        type: 'success', 
        text: 'บันทึกการตั้งค่าเว็บไซต์สำเร็จ การเปลี่ยนแปลงจะปรากฏบนหน้าแรกของเว็บไซต์' 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ 
        type: 'error', 
        text: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate to API settings page
  const handleNavigateToApiSettings = () => {
    router.push('/admin/settings/api');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-color"></div>
          <p className="ml-3 text-gray-600">กำลังโหลดการตั้งค่าเว็บไซต์...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ตั้งค่าเว็บไซต์
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
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`${
                  activeTab === 'general'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                ทั่วไป
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`${
                  activeTab === 'social'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                โซเชียลมีเดีย
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`${
                  activeTab === 'seo'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                SEO และเมต้าข้อมูล
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`${
                  activeTab === 'content'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                เนื้อหา
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`${
                  activeTab === 'performance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                ประสิทธิภาพ
              </button>
              <button
                onClick={() => handleNavigateToApiSettings()}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                API
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSave}>
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">การตั้งค่าทั่วไป</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Site Name */}
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อเว็บไซต์
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      value={settings.site.name}
                      onChange={(e) => handleTextChange('site', 'name', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Site Slogan */}
                  <div>
                    <label htmlFor="siteSlogan" className="block text-sm font-medium text-gray-700 mb-1">
                      สโลแกน
                    </label>
                    <input
                      type="text"
                      id="siteSlogan"
                      value={settings.site.slogan}
                      onChange={(e) => handleTextChange('site', 'slogan', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">โซเชียลมีเดีย</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Facebook */}
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      id="facebook"
                      value={settings.social.facebook}
                      onChange={(e) => handleTextChange('social', 'facebook', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      value={settings.social.twitter}
                      onChange={(e) => handleTextChange('social', 'twitter', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">SEO และเมต้าข้อมูล</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title Template */}
                  <div>
                    <label htmlFor="titleTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                      รูปแบบชื่อหน้า
                    </label>
                    <input
                      type="text"
                      id="titleTemplate"
                      value={settings.seo.titleTemplate}
                      onChange={(e) => handleTextChange('seo', 'titleTemplate', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">การตั้งค่าเนื้อหา</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default Match Display */}
                  <div>
                    <label htmlFor="defaultMatchDisplay" className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนแมตช์ที่แสดงต่อลีก
                    </label>
                    <input
                      type="number"
                      id="defaultMatchDisplay"
                      value={settings.content.defaultMatchDisplay}
                      onChange={(e) => handleNumberChange('content', 'defaultMatchDisplay', e.target.value)}
                      min="1"
                      max="20"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">การตั้งค่าประสิทธิภาพ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cache Duration */}
                  <div>
                    <label htmlFor="cacheDuration" className="block text-sm font-medium text-gray-700 mb-1">
                      ระยะเวลาแคช (นาที)
                    </label>
                    <input
                      type="number"
                      id="cacheDuration"
                      value={settings.performance.cacheDuration}
                      onChange={(e) => handleNumberChange('performance', 'cacheDuration', e.target.value)}
                      min="1"
                      max="60"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
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
      </div>
  );
};

export default SiteSettingsPage;
