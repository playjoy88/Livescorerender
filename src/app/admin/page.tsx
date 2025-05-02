'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Mock data for the dashboard
const mockStats = {
  totalUsers: 78542,
  activeUsers: 12389,
  totalMatches: 1452,
  totalPredictions: 236981,
  totalNotifications: 598742,
  adImpressions: 1245789,
  adClicks: 34567,
  pinnedMatches: 48921,
  newUsersToday: 134,
  accuracyRates: {
    statsMaster: 68.2,
    formGuru: 72.4,
    thaiExpert: 74.8,
    community: 65.7,
  },
  userEngagement: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 78],
  adRevenue: [12500, 14000, 16500, 18000, 17500, 19000, 20500, 21000, 22500, 23000, 24500, 26000]
};

// Card component for statistics
const StatCard = ({ title, value, icon, change, color = 'blue' }: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-light text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {change && (
            <div className={`flex items-center mt-2 ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-sm font-medium">
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-1 ${!change.isPositive && 'transform rotate-180'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          )}
        </div>
        
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Chart component for user engagement
const EngagementChart = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="h-48 flex items-end space-x-2">
      {data.map((value, index) => (
        <div 
          key={index} 
          className="flex-1 flex flex-col items-center"
        >
          <div 
            className="bg-primary-color w-full rounded-t-sm" 
            style={{ height: `${(value / maxValue) * 100}%` }}
          ></div>
          <div className="text-xs mt-1 text-text-light">{index + 1}</div>
        </div>
      ))}
    </div>
  );
};

// Revenue Chart
const RevenueChart = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="h-48 relative">
      <div className="absolute inset-0 flex items-end space-x-2">
        {data.map((value, index) => (
          <div 
            key={index} 
            className="flex-1 flex flex-col items-center"
          >
            <div 
              className="bg-green-500 w-full rounded-t-sm" 
              style={{ height: `${(value / maxValue) * 100}%` }}
            ></div>
            <div className="text-xs mt-1 text-text-light">{index + 1}</div>
          </div>
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-text-light">
        <span>฿{maxValue.toLocaleString()}</span>
        <span>฿{Math.round(maxValue * 0.75).toLocaleString()}</span>
        <span>฿{Math.round(maxValue * 0.5).toLocaleString()}</span>
        <span>฿{Math.round(maxValue * 0.25).toLocaleString()}</span>
        <span>฿0</span>
      </div>
    </div>
  );
};

// AI Model Accuracy component
const AIModelAccuracy = ({ models }: { models: Record<string, number> }) => {
  return (
    <div className="space-y-4">
      {Object.entries(models).map(([key, value]) => {
        let title = '';
        let description = '';
        
        switch(key) {
          case 'statsMaster':
            title = 'Playjoy Stats Master';
            description = 'สถิติเชิงคณิตศาสตร์';
            break;
          case 'formGuru':
            title = 'Playjoy Form Guru';
            description = 'ฟอร์มการเล่นล่าสุด';
            break;
          case 'thaiExpert':
            title = 'Playjoy Thai Expert';
            description = 'ผู้เชี่ยวชาญไทยลีก';
            break;
          case 'community':
            title = 'Playjoy Community';
            description = 'คำทำนายของผู้ใช้';
            break;
        }
        
        return (
          <div key={key} className="bg-white rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <div>
                <h4 className="font-bold">{title}</h4>
                <div className="text-xs text-text-light">{description}</div>
              </div>
              <div className="text-lg font-bold">{value}%</div>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    value > 70 ? 'bg-green-500' : value > 60 ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  
  return (
    <div className="space-y-6">
      {/* Page title and date range selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>แดชบอร์ดผู้ดูแลระบบ</h1>
        
        <div className="inline-flex bg-white rounded-md shadow-sm">
          <button
            className={`px-4 py-2 text-sm font-medium ${dateRange === '1d' ? 'text-primary-color' : 'text-text-light'}`}
            onClick={() => setDateRange('1d')}
          >
            1 วัน
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${dateRange === '7d' ? 'text-primary-color' : 'text-text-light'}`}
            onClick={() => setDateRange('7d')}
          >
            7 วัน
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${dateRange === '30d' ? 'text-primary-color' : 'text-text-light'}`}
            onClick={() => setDateRange('30d')}
          >
            30 วัน
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${dateRange === '1y' ? 'text-primary-color' : 'text-text-light'}`}
            onClick={() => setDateRange('1y')}
          >
            1 ปี
          </button>
        </div>
      </div>
      
      {/* Key stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="ผู้ใช้งาน" 
          value={mockStats.totalUsers.toLocaleString()} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          change={{ value: 3.2, isPositive: true }}
          color="blue"
        />
        
        <StatCard 
          title="การทำนายทั้งหมด" 
          value={mockStats.totalPredictions.toLocaleString()} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          change={{ value: 5.7, isPositive: true }}
          color="green"
        />
        
        <StatCard 
          title="การแจ้งเตือน" 
          value={mockStats.totalNotifications.toLocaleString()} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          change={{ value: 8.3, isPositive: true }}
          color="orange"
        />
        
        <StatCard 
          title="รายได้โฆษณา" 
          value={`฿${Math.floor(mockStats.adImpressions * 0.02).toLocaleString()}`} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          change={{ value: 6.8, isPositive: true }}
          color="green"
        />
      </div>
      
      {/* Engagement and revenue charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">การมีส่วนร่วมของผู้ใช้</h2>
            <div className="text-sm text-text-light">ผู้ใช้งานรายเดือน</div>
          </div>
          <div className="pl-8">
            <EngagementChart data={mockStats.userEngagement} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">รายได้จากโฆษณา</h2>
            <div className="text-sm text-text-light">รายเดือน (บาท)</div>
          </div>
          <div className="pl-12">
            <RevenueChart data={mockStats.adRevenue} />
          </div>
        </div>
      </div>
      
      {/* AI model accuracy and quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">ความแม่นยำของระบบ AI</h2>
            <div className="text-sm text-primary-color font-medium cursor-pointer">ดูรายละเอียด</div>
          </div>
          
          <AIModelAccuracy models={mockStats.accuracyRates} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-6">เข้าถึงอย่างรวดเร็ว</h2>
          
          <div className="space-y-4">
            <Link href="/admin/predictions/contests">
              <div className="flex items-center p-3 rounded-lg hover:bg-bg-light transition">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">จัดการการแข่งขันทายผล</p>
                  <p className="text-sm text-text-light">จัดการกติกา และรางวัล</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/advertisements/new">
              <div className="flex items-center p-3 rounded-lg hover:bg-bg-light transition">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">เพิ่มโฆษณาใหม่</p>
                  <p className="text-sm text-text-light">สร้างแคมเปญโฆษณา</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/matches/featured">
              <div className="flex items-center p-3 rounded-lg hover:bg-bg-light transition">
                <div className="bg-orange-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">แก้ไขแมตช์แนะนำ</p>
                  <p className="text-sm text-text-light">เลือกแมตช์สำคัญ</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/settings/api">
              <div className="flex items-center p-3 rounded-lg hover:bg-bg-light transition">
                <div className="bg-red-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">ตั้งค่า API</p>
                  <p className="text-sm text-text-light">จัดการการเชื่อมต่อ API</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">กิจกรรมล่าสุด</h2>
          <div className="text-sm text-primary-color font-medium cursor-pointer">ดูทั้งหมด</div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start p-3 border-b border-border-color pb-4">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">มีผู้ใช้ใหม่ลงทะเบียน {mockStats.newUsersToday} คน</p>
              <p className="text-sm text-text-light">วันนี้</p>
            </div>
          </div>
          
          <div className="flex items-start p-3 border-b border-border-color pb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <p className="font-medium">มีการทายผลการแข่งขันทั้งหมด 1,245 ครั้ง</p>
              <p className="text-sm text-text-light">วันนี้</p>
            </div>
          </div>
          
          <div className="flex items-start p-3 border-b border-border-color pb-4">
            <div className="bg-orange-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">มีการแข่งขันที่กำลังถ่ายทอดสด 12 แมตช์</p>
              <p className="text-sm text-text-light">ขณะนี้</p>
            </div>
          </div>
          
          <div className="flex items-start p-3">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="font-medium">ส่งการแจ้งเตือนผลการแข่งขันไปแล้ว 3,567 ครั้ง</p>
              <p className="text-sm text-text-light">วันนี้</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
