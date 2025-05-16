'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import { getAdvertisementById, deleteAdvertisement, Advertisement, blobStorage } from '../../../../services/supabaseAdvertisementService';

// Status badge component
const StatusBadge = ({ status }: { status?: string }) => {
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

// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function AdvertisementDetailPage({ 
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  // For server components in Next.js 13+, router usage would need to be updated
  // This is a placeholder as we would need to use redirect or Link components instead
  const router = { push: (url: string) => { window.location.href = url; } };
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Fetch advertisement data
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adData = await getAdvertisementById(id);
        if (adData) {
          setAd(adData);
        } else {
          setError('ไม่พบโฆษณาที่ต้องการ');
        }
      } catch (error) {
        console.error('Error fetching advertisement:', error);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลโฆษณา');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAd();
  }, [id]);
  
  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  // Handle delete action
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAdvertisement(id);
      router.push('/admin/advertisements');
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      setError('เกิดข้อผิดพลาดในการลบโฆษณา');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-color"></div>
            <p className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link href="/admin/advertisements" className="text-indigo-600 hover:text-indigo-900">
              กลับไปยังรายการโฆษณา
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Action buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Link href="/admin/advertisements">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับ
              </button>
            </Link>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/admin/advertisements/${id}/edit`}>
              <button className="px-3 py-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                แก้ไข
              </button>
            </Link>
            
            <button
              onClick={handleDeleteClick}
              className="px-3 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              ลบ
            </button>
          </div>
        </div>
        
        {/* Advertisement details */}
        <div className="bg-white shadow-md rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
                รายละเอียดโฆษณา
              </h1>
              <StatusBadge status={ad?.status || 'unknown'} />
            </div>
          </div>
          
          {/* Image preview */}
          {ad?.imageUrl && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-500 mb-2">ตัวอย่างรูปภาพ</h2>
              <div className="bg-gray-100 p-4 rounded flex justify-center">
                <img 
                  src={blobStorage.formatBlobUrl(ad?.imageUrl || '')} 
                  alt={ad?.name || 'Advertisement'} 
                  className="max-h-64 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Basic information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500">ชื่อโฆษณา</h2>
                <p className="mt-1">{ad?.name}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500">ตำแหน่ง / ขนาด</h2>
                <p className="mt-1">
                  {
                    ad?.position === 'hero' ? 'ส่วนหัว' :
                    ad?.position === 'sidebar' ? 'แถบข้าง' :
                    ad?.position === 'in-feed' ? 'ในฟีด' :
                    ad?.position === 'footer' ? 'ส่วนท้าย' :
                    ad?.position === 'pre-content' ? 'ก่อนเนื้อหา' :
                    ad?.position
                  } / {
                    ad?.size === 'small' ? 'เล็ก' :
                    ad?.size === 'medium' ? 'กลาง' :
                    ad?.size === 'large' ? 'ใหญ่' :
                    ad?.size
                  }
                </p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500">URL ปลายทาง</h2>
                <a 
                  href={ad?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-600 hover:underline break-all"
                >
                  {ad?.url}
                </a>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500">ระยะเวลา</h2>
                <p className="mt-1">
                  {ad?.startDate ? formatDate(ad.startDate) : 'N/A'} - {ad?.endDate ? formatDate(ad.endDate) : 'N/A'}
                </p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500">สร้างเมื่อ</h2>
                <p className="mt-1">{ad?.createdAt ? formatDate(ad.createdAt) : 'ไม่มีข้อมูล'}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500">อัปเดตล่าสุดเมื่อ</h2>
                <p className="mt-1">{ad?.updatedAt ? formatDate(ad.updatedAt) : 'ไม่มีข้อมูล'}</p>
              </div>
            </div>
          </div>
          
          {/* Performance metrics */}
          <div className="px-6 py-4">
            <h2 className="text-sm font-medium text-gray-500 mb-4">ประสิทธิภาพ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">การแสดงผล</div>
                <div className="text-2xl font-semibold mt-1">{ad?.impressions ? ad.impressions.toLocaleString() : '0'}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">คลิก</div>
                <div className="text-2xl font-semibold mt-1">{ad?.clicks ? ad.clicks.toLocaleString() : '0'}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">CTR</div>
                <div className="text-2xl font-semibold mt-1">{ad?.ctr ? ad.ctr.toFixed(2) : '0.00'}%</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-3">
                <div className="text-sm text-gray-500">รายได้</div>
                <div className="text-2xl font-semibold mt-1">฿{ad?.revenue ? ad.revenue.toLocaleString() : '0'}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ยืนยันการลบโฆษณา</h3>
              <p className="text-gray-500 mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการลบโฆษณา &quot;{ad?.name}&quot;? การกระทำนี้ไม่สามารถยกเลิกได้
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
                
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังลบ...
                    </span>
                  ) : 'ลบโฆษณา'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
