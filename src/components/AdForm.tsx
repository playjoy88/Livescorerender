import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { NewAdvertisement, createAd, updateAd, getAdvertisementById as getAdById, blobStorage } from '../services/supabaseAdvertisementService';

interface AdFormProps {
  id?: string; // If provided, we're editing an existing ad
}

const AdForm: React.FC<AdFormProps> = ({ id }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<NewAdvertisement>({
    name: '',
    position: 'sidebar',
    size: 'medium',
    imageUrl: '',
    url: '',
    status: 'scheduled',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    impressions: 0,
    clicks: 0,
    ctr: 0,
    revenue: 0
  });

  // Get size dimensions based on the selected size
  const getSizeDimensions = (size: string): { width: number, height: number, label: string } => {
    switch(size) {
      case 'small':
        return { width: 300, height: 250, label: '300x250 px' };
      case 'medium':
        return { width: 728, height: 90, label: '728x90 px' };
      case 'large':
        return { width: 970, height: 250, label: '970x250 px' };
      default:
        return { width: 300, height: 250, label: '300x250 px' };
    }
  };

  // Get position-specific dimensions
  const getPositionSizeDimensions = (position: string, size: string): { width: number, height: number, label: string } => {
    if (position === 'hero') {
      return { width: 1200, height: 400, label: '1200x400 px' };
    }
    if (position === 'sidebar') {
      return { width: 300, height: 600, label: '300x600 px' };
    }
    return getSizeDimensions(size);
  };

  // Fetch advertisement data if in edit mode
  useEffect(() => {
    const fetchAd = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const ad = await getAdById(id);
        if (ad) {
          // Format dates for input fields
          const formattedAd = {
            ...ad,
            startDate: new Date(ad.startDate).toISOString().split('T')[0],
            endDate: new Date(ad.endDate).toISOString().split('T')[0]
          };
          setFormData(formattedAd as NewAdvertisement);
        } else {
          setError('ไม่พบโฆษณาที่ต้องการแก้ไข');
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

  // Handle image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Display upload progress to improve user experience
      const progressTimer1 = setTimeout(() => setUploadProgress(30), 300);
      const progressTimer2 = setTimeout(() => setUploadProgress(60), 600);
      const progressTimer3 = setTimeout(() => setUploadProgress(90), 900);
      
      // Use Vercel Blob Storage service to upload the file
      console.log('Uploading file to Vercel Blob Storage:', file.name);
      const downloadUrl = await blobStorage.uploadFile(file);
      
      // Clear the timers if the upload finishes quickly
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);
      
      setUploadProgress(100);
      console.log('File uploaded successfully, URL:', downloadUrl);
      
      // When using a local file or fallback during development
      if (downloadUrl.startsWith('/ads/')) {
        // Use a relative path for local development
        setFormData((prev: NewAdvertisement) => ({ ...prev, imageUrl: downloadUrl }));
      } else {
        // Use the full URL for Vercel Blob Storage
        setFormData((prev: NewAdvertisement) => ({ ...prev, imageUrl: downloadUrl }));
      }
      
      // Display a temporary success message
      const successTimer = setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
      
      return () => clearTimeout(successTimer);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError('ไม่สามารถอัปโหลดไฟล์ได้ โปรดลองอีกครั้ง: ' + (error instanceof Error ? error.message : String(error)));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Validate the form data
      if (!formData.imageUrl.trim()) {
        throw new Error('กรุณาอัปโหลดรูปภาพหรือใส่ URL รูปภาพ');
      }
      
      // Check and fix image URL if needed
      if (!formData.imageUrl.startsWith('http') && !formData.imageUrl.startsWith('/')) {
        console.log('Fixing image URL format:', formData.imageUrl);
        formData.imageUrl = `/ads/${formData.imageUrl}`;
      }
      
      let result;
      if (id) {
        // Update existing advertisement
        result = await updateAd(id, formData);
      } else {
        // Create new advertisement
        result = await createAd(formData);
      }
      
      if (!result) {
        throw new Error('ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อกับฐานข้อมูล');
      }
      
      console.log('Advertisement saved successfully:', result);
      
      // Navigate back to ads management page
      router.push('/admin/advertisements');
    } catch (error) {
      console.error('Error saving advertisement:', error);
      setError(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error instanceof Error ? error.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: NewAdvertisement) => ({ ...prev, [name]: value }));
  };

  // Handle cancel button
  const handleCancel = () => {
    router.back();
  };

  // Get size dimensions for the current ad
  const currentDimensions = getPositionSizeDimensions(formData.position, formData.size);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-color"></div>
        <p className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-prompt)' }}>
        {id ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณาใหม่'}
      </h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Advertisement Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อโฆษณา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              ตำแหน่ง <span className="text-red-500">*</span>
            </label>
            <select
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="hero">ส่วนหัว (Hero)</option>
              <option value="sidebar">แถบข้าง (Sidebar)</option>
              <option value="in-feed">ในฟีด (In-feed)</option>
              <option value="footer">ส่วนท้าย (Footer)</option>
              <option value="pre-content">ก่อนเนื้อหา (Pre-content)</option>
            </select>
          </div>
          
          {/* Size */}
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              ขนาด <span className="text-red-500">*</span>
            </label>
            <select
              id="size"
              name="size"
              required
              value={formData.size}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="small">เล็ก (Small)</option>
              <option value="medium">กลาง (Medium)</option>
              <option value="large">ใหญ่ (Large)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">ขนาดที่แนะนำ: {currentDimensions.label}</p>
          </div>
          
          {/* Image Upload and URL */}
          <div className="col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อัปโหลดรูปภาพโฆษณา
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  เลือกไฟล์รูปภาพ
                </label>
                <span className="ml-2 text-sm text-gray-500">
                  {isUploading ? `กำลังอัปโหลด... ${uploadProgress}%` : 'รองรับไฟล์ JPG, PNG, GIF'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">ขนาดที่แนะนำ: {currentDimensions.label}</p>
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL รูปภาพ <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                required
                value={formData.imageUrl}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">พรีวิว:</p>
                <div className={`mt-2 relative border border-gray-200 rounded p-2 bg-gray-50 flex items-center justify-center`}
                     style={{width: `${Math.min(currentDimensions.width, 600)}px`, 
                             height: `${Math.min(currentDimensions.height, 300)}px`,
                             maxWidth: '100%'}}>
                  <img 
                    src={blobStorage.formatBlobUrl(formData.imageUrl)} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                    }}
                  />
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl">
                    {currentDimensions.label}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Destination URL */}
          <div className="col-span-2">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL ปลายทาง <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              name="url"
              required
              value={formData.url}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/landing-page"
            />
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="active">ใช้งานอยู่ (Active)</option>
              <option value="paused">หยุดชั่วคราว (Paused)</option>
              <option value="scheduled">กำหนดเวลา (Scheduled)</option>
              <option value="ended">สิ้นสุดแล้ว (Ended)</option>
            </select>
          </div>
          
          {/* Revenue */}
          <div>
            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-1">
              รายได้ (บาท)
            </label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              min="0"
              step="0.01"
              value={formData.revenue}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่เริ่มต้น <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่สิ้นสุด <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {/* Form actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
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
            ) : id ? 'บันทึกการแก้ไข' : 'สร้างโฆษณา'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdForm;
