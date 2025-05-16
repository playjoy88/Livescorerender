'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { getNewsFromDatabase } from '@/services/newsService';
import { NewsArticle } from '@/types/news';

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const router = useRouter();

  // Fetch news when the component mounts
  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  // Function to fetch news from the database
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let newsData: NewsArticle[] = [];
      
      if (activeCategory === 'all') {
        newsData = await getNewsFromDatabase();
      } else {
        newsData = await getNewsFromDatabase(activeCategory as 'thai' | 'international');
      }
      
      setNews(newsData);
      
      // Get the last sync time from localStorage
      const savedLastSyncTime = localStorage.getItem('lastNewsSync');
      if (savedLastSyncTime) {
        setLastSyncTime(savedLastSyncTime);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger a manual sync
  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      // Call API endpoint directly to ensure server-side sync
      const response = await fetch('/api/news/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync news');
      }
      
      // Set the last sync time
      const now = new Date().toISOString();
      localStorage.setItem('lastNewsSync', now);
      setLastSyncTime(now);
      
      // Show success message
      alert('ซิงค์ข่าวสำเร็จแล้ว');
      
      // Refetch the news to get the updated data
      await fetchNews();
    } catch (err) {
      console.error('Error syncing news:', err);
      setError('เกิดข้อผิดพลาดในการซิงค์ข้อมูล: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  // Format the date to Thai format
  const formatDateToThai = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            จัดการข่าวสาร
          </h1>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-primary-color hover:underline"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            กลับไปหน้าแอดมิน
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-prompt)' }}>
                ซิงค์ข่าวสาร
              </h2>
              <p className="text-sm text-gray-600 mb-3 md:mb-0">
                ระบบจะซิงค์ข่าวสารอัตโนมัติทุก 12 ชั่วโมง (เวลา 00:00 และ 12:00 น.)
                {lastSyncTime && (
                  <>
                    <br />
                    <span className="font-medium">ซิงค์ล่าสุด: {formatDateToThai(lastSyncTime)}</span>
                  </>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังซิงค์ข้อมูล...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    ซิงค์ข้อมูลตอนนี้
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-2 bg-red-100 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="mb-6 bg-bg-light p-3 rounded-lg shadow-sm">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeCategory === 'all' ? 'bg-primary-color text-white' : 'bg-white'
              }`}
              onClick={() => setActiveCategory('all')}
            >
              ทั้งหมด
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeCategory === 'thai' ? 'bg-primary-color text-white' : 'bg-white'
              }`}
              onClick={() => setActiveCategory('thai')}
            >
              ข่าวไทย
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeCategory === 'international' ? 'bg-primary-color text-white' : 'bg-white'
              }`}
              onClick={() => setActiveCategory('international')}
            >
              ข่าวต่างประเทศ
            </button>
          </div>
        </div>

        {/* News list */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข่าวสาร...</p>
            </div>
          ) : news.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อเรื่อง
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่เผยแพร่
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      แหล่งที่มา
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {news.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {article.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img className="h-10 w-10 rounded object-cover" src={article.image} alt={article.title} />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDateToThai(article.publishedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          article.category === 'thai' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {article.category === 'thai' ? 'ข่าวไทย' : 'ข่าวต่างประเทศ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.source || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          ดู
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">ไม่พบข่าวสาร</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
