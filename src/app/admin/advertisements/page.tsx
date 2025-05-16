'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllAdvertisements as getAdvertisements, deleteAdvertisement, Advertisement, blobStorage } from '../../../services/supabaseAdvertisementService';
import BannerWithAnalytics from '../../../components/BannerWithAnalytics';


// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH');
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-gray-100 text-gray-800';
  let label = 'ไม่ทราบสถานะ';
  
  switch (status) {
    case 'active':
      color = 'bg-green-100 text-green-800';
      label = 'ใช้งานอยู่';
      break;
    case 'paused':
      color = 'bg-yellow-100 text-yellow-800';
      label = 'หยุดชั่วคราว';
      break;
    case 'scheduled':
      color = 'bg-blue-100 text-blue-800';
      label = 'กำหนดเวลา';
      break;
    case 'ended':
      color = 'bg-red-100 text-red-800';
      label = 'สิ้นสุดแล้ว';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Position badge component
const PositionBadge = ({ position }: { position: string }) => {
  let color = 'bg-gray-100 text-gray-800';
  let label = position;
  
  switch (position) {
    case 'hero':
      color = 'bg-purple-100 text-purple-800';
      label = 'ส่วนหัว';
      break;
    case 'sidebar':
      color = 'bg-blue-100 text-blue-800';
      label = 'แถบข้าง';
      break;
    case 'in-feed':
      color = 'bg-green-100 text-green-800';
      label = 'ในฟีด';
      break;
    case 'footer':
      color = 'bg-orange-100 text-orange-800';
      label = 'ส่วนท้าย';
      break;
    case 'pre-content':
      color = 'bg-red-100 text-red-800';
      label = 'ก่อนเนื้อหา';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

export default function AdvertisementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handle delete advertisement
  const handleDeleteAd = async (id: string, imageUrl: string) => {
    if (!window.confirm('คุณต้องการลบโฆษณานี้ใช่หรือไม่?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Delete from database
      const success = await deleteAdvertisement(id);
      
      if (success) {
        // If it's a blob storage URL, also delete the image file
        if (blobStorage.isValidBlobUrl(imageUrl)) {
          await blobStorage.deleteFile(imageUrl);
        }
        
        // Update state to remove the deleted ad
        setAdvertisements(prevAds => prevAds.filter(ad => ad.id !== id));
        
        alert('ลบโฆษณาเรียบร้อยแล้ว');
      } else {
        alert('เกิดข้อผิดพลาดในการลบโฆษณา');
      }
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      alert('เกิดข้อผิดพลาดในการลบโฆษณา');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Fetch advertisements on component mount
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const ads = await getAdvertisements();
        // Use the existing revenue data or default to 0
        const adsWithRevenue = ads.map(ad => ({
          ...ad,
          revenue: ad.revenue || 0
        }));
        setAdvertisements(adsWithRevenue);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAds();
  }, []);
  
  // Filter ads based on search and filters
  const filteredAds = advertisements.filter(ad => {
    const matchesSearch = 
      ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || ad.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate total revenue
  const totalRevenue = advertisements.reduce((sum, ad) => sum + (ad.revenue || 0), 0);
  const activeAdsCount = advertisements.filter(ad => ad.status === 'active').length;
  const totalImpressions = advertisements.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = advertisements.reduce((sum, ad) => sum + ad.clicks, 0);
  
  return (
    <div className="space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">รายได้ทั้งหมด</p>
          <h3 className="text-2xl font-bold text-gray-800">฿{totalRevenue.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-2">ยอดรวมทั้งหมด</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">จำนวนโฆษณาที่ใช้งาน</p>
          <h3 className="text-2xl font-bold text-indigo-600">{activeAdsCount}</h3>
          <p className="text-xs text-gray-500 mt-2">จากทั้งหมด {advertisements.length} รายการ</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">การแสดงผล</p>
          <h3 className="text-2xl font-bold text-gray-800">{totalImpressions.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-2">รวมทุกแพลตฟอร์ม</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">จำนวนคลิก</p>
          <h3 className="text-2xl font-bold text-indigo-600">{totalClicks.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-2">อัตราการคลิก {totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(1) : '0.0'}%</p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-prompt)' }}>
            Advertisement Management
          </h1>
          
          <Link href="/admin/advertisements/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มโฆษณาใหม่
            </button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search advertisements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งานอยู่</option>
              <option value="paused">หยุดชั่วคราว</option>
              <option value="scheduled">กำหนดเวลา</option>
              <option value="ended">สิ้นสุดแล้ว</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Advertisements table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  โฆษณา
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่ง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ระยะเวลา
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประสิทธิภาพ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    ไม่พบโฆษณาที่ตรงตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredAds.map(ad => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24 bg-gray-200 rounded overflow-hidden">
                                <img 
                                  src={blobStorage.formatBlobUrl(ad.imageUrl)}
                            alt={ad.name} 
                            className="h-16 w-24 object-contain" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/96x64?text=AD';
                            }} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ad.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{ad.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <PositionBadge position={ad.position} />
                        <span className="text-xs text-gray-500 mt-1">ขนาด: {ad.size}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ad.status === 'scheduled' ? (
                        <div className="text-xs text-gray-500">ยังไม่เริ่ม</div>
                      ) : (
                        <>
                          <div className="text-sm">{ad.impressions.toLocaleString()} การแสดงผล</div>
                          <div className="text-xs text-gray-500">
                            {ad.clicks.toLocaleString()} คลิก ({ad.ctr.toFixed(1)}% CTR)
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/advertisements/${ad.id}`}>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          ดูรายละเอียด
                        </button>
                      </Link>
                      <Link href={`/admin/advertisements/${ad.id}/edit`}>
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          แก้ไข
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteAd(ad.id, ad.imageUrl)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'กำลังลบ...' : 'ลบ'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Banner Preview Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">ตัวอย่างแบนเนอร์โฆษณา</h2>
        <p className="text-sm text-gray-500 mb-6">ตัวอย่างการแสดงผลแบนเนอร์ในตำแหน่งต่างๆ</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium mb-2">แบนเนอร์ส่วนท้าย (Footer)</h3>
            <BannerWithAnalytics position="footer" size="large" />
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">แบนเนอร์แถบข้าง (Sidebar)</h3>
            <BannerWithAnalytics position="sidebar" size="medium" />
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">แบนเนอร์ส่วนหัว (Hero)</h3>
            <BannerWithAnalytics position="hero" size="large" />
          </div>
        </div>
      </div>
      
      {/* Actions panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">การดำเนินการแบบกลุ่ม</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            สร้างรายงานประจำเดือน
          </button>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            นำเข้าโฆษณาจากไฟล์
          </button>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ตั้งค่าระบบโฆษณา
          </button>
        </div>
      </div>
    </div>
  );
}
