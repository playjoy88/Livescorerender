'use client';

import React, { useState, useEffect } from 'react';
import { getAllAdvertisements, Advertisement } from '../../services/supabaseAdvertisementService';
import Link from 'next/link';

export default function AdminDashboard() {
  const [adStats, setAdStats] = useState({
    impressions: 0,
    clicks: 0,
    ctr: 0,
    revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingNews, setIsSyncingNews] = useState(false);
  
  // Function to handle news sync
  const handleNewsSync = async () => {
    if (isSyncingNews) return;
    
    setIsSyncingNews(true);
    try {
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
      
      // Show success message
      alert('ซิงค์ข่าวสำเร็จแล้ว');
    } catch (err) {
      console.error('Error syncing news:', err);
      alert('เกิดข้อผิดพลาดในการซิงค์ข้อมูล: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncingNews(false);
    }
  };
  
  // Fetch advertisement data to calculate statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const ads = await getAllAdvertisements();
        
        // Calculate ad statistics
        const totalImpressions = ads.reduce((sum: number, ad: Advertisement) => sum + ad.impressions, 0);
        const totalClicks = ads.reduce((sum: number, ad: Advertisement) => sum + ad.clicks, 0);
        const totalRevenue = ads.reduce((sum: number, ad: Advertisement) => sum + ad.revenue, 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        
        // Update ad stats with real data
        setAdStats({
          impressions: totalImpressions,
          clicks: totalClicks,
          ctr: ctr,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>แดชบอร์ดผู้ดูแลระบบ</h1>
      </div>
      
      {/* Loading indicator */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
          <p className="mt-2 text-gray-500">กำลังโหลดข้อมูลสถิติ...</p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Impressions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">จำนวนการแสดงผล</p>
                  <h3 className="text-2xl font-bold mt-1">{adStats.impressions.toLocaleString()}</h3>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Clicks Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">จำนวนคลิก</p>
                  <h3 className="text-2xl font-bold mt-1">{adStats.clicks.toLocaleString()}</h3>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* CTR Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">อัตราการคลิก (CTR)</p>
                  <h3 className="text-2xl font-bold mt-1">{adStats.ctr.toFixed(2)}%</h3>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">รายได้โฆษณา</p>
                  <h3 className="text-2xl font-bold mt-1">฿{adStats.revenue.toLocaleString()}</h3>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-6">เข้าถึงอย่างรวดเร็ว</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Advertisements Link */}
              <Link href="/admin/advertisements">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="bg-green-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">จัดการโฆษณา</p>
                    <p className="text-sm text-gray-500">จัดการโฆษณาและแคมเปญ</p>
                  </div>
                </div>
              </Link>
              
              {/* Logo Settings Link */}
              <Link href="/admin/logo-settings">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="bg-purple-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">ตั้งค่าโลโก้</p>
                    <p className="text-sm text-gray-500">จัดการโลโก้เว็บไซต์</p>
                  </div>
                </div>
              </Link>
              
              {/* News Link */}
              <Link href="/admin/news">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="bg-blue-600 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">จัดการข่าวสาร</p>
                    <p className="text-sm text-gray-500">ซิงค์และตรวจสอบข่าว</p>
                  </div>
                </div>
              </Link>

              {/* Database Tools Link */}
              <Link href="/admin/database-tools">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="bg-indigo-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">เครื่องมือฐานข้อมูล</p>
                    <p className="text-sm text-gray-500">ตรวจสอบและสร้างตาราง</p>
                  </div>
                </div>
              </Link>
              
              {/* News Sync Button */}
              <div 
                onClick={handleNewsSync}
                className="flex items-center p-3 rounded-lg bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition cursor-pointer"
              >
                <div className="bg-blue-600 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">ซิงค์ข่าวสารตอนนี้</p>
                  <p className="text-sm text-gray-500">อัพเดทข่าวสารล่าสุด</p>
                </div>
                {isSyncingNews && (
                  <div className="ml-3 animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
