'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../../components/Layout';
import { supabase } from '../../../services/supabaseClient';
import { blobStorage } from '../../../services/vercelDb';

const LogoSettingsPage = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [logoWidth, setLogoWidth] = useState(150);
  const [logoHeight, setLogoHeight] = useState(40);
  const [altText, setAltText] = useState('PlayJoy Live');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    // Fetch logo settings from Supabase
    const fetchLogoSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('setting_type', 'logo')
          .single();
          
        if (error) {
          console.error('Error fetching logo settings:', error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setLogoUrl(data.image_url || '/images/logo.png');
          setLogoWidth(data.width || 150);
          setLogoHeight(data.height || 40);
          setAltText(data.alt_text || 'PlayJoy Live');
        }
      } catch (error) {
        console.error('Error in fetchLogoSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogoSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsSaving(true);
      setMessage({ type: 'info', text: 'กำลังอัปโหลดไฟล์...' });
      
      // Upload to Vercel Blob Storage using the correct method
      const uploadedUrl = await blobStorage.uploadFile(file);
      setLogoUrl(uploadedUrl);
      
      // Show success message
      setMessage({ type: 'success', text: 'ไฟล์อัปโหลดสำเร็จ' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Import supabaseAdmin from supabaseClient
      const { supabaseAdmin } = await import('../../../services/supabaseClient');
      
      // Check if logo settings already exist
      const { data: existingData, error: checkError } = await supabaseAdmin
        .from('site_settings')
        .select('id')
        .eq('setting_type', 'logo')
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = Not found
        throw checkError;
      }
      
      const logoSettings = {
        setting_type: 'logo',
        image_url: logoUrl,
        width: logoWidth,
        height: logoHeight,
        alt_text: altText,
        updated_at: new Date().toISOString()
      };
      
      let saveError;
      
      console.log('Saving logo settings using admin client to bypass RLS');
      
      if (existingData?.id) {
        // Update existing record using admin client
        const { error } = await supabaseAdmin
          .from('site_settings')
          .update(logoSettings)
          .eq('id', existingData.id);
          
        saveError = error;
      } else {
        // Insert new record using admin client
        const { error } = await supabaseAdmin
          .from('site_settings')
          .insert([{ ...logoSettings, created_at: new Date().toISOString() }]);
          
        saveError = error;
      }
      
      if (saveError) {
        throw saveError;
      }
      
      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าโลโก้สำเร็จ' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving logo settings:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ตั้งค่าโลโก้
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Logo Preview */}
              <div className="col-span-2 flex justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="relative">
                  <Image 
                    src={logoUrl || '/images/logo.png'}
                    alt={altText}
                    width={logoWidth}
                    height={logoHeight}
                    className="max-w-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150x40?text=Logo+Preview';
                    }}
                  />
                </div>
              </div>

              {/* Logo File Upload */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อัปโหลดโลโก้ใหม่
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    เลือกไฟล์รูปภาพ
                  </label>
                  <span className="ml-2 text-sm text-gray-500">
                    รองรับไฟล์ PNG, JPG, SVG
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">ขนาดที่แนะนำ: 150 x 40 pixels</p>
              </div>

              {/* Logo Width */}
              <div>
                <label htmlFor="logoWidth" className="block text-sm font-medium text-gray-700 mb-1">
                  ความกว้าง (pixels)
                </label>
                <input
                  type="number"
                  id="logoWidth"
                  value={logoWidth}
                  onChange={(e) => setLogoWidth(parseInt(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                  min="50"
                  max="300"
                />
              </div>

              {/* Logo Height */}
              <div>
                <label htmlFor="logoHeight" className="block text-sm font-medium text-gray-700 mb-1">
                  ความสูง (pixels)
                </label>
                <input
                  type="number"
                  id="logoHeight"
                  value={logoHeight}
                  onChange={(e) => setLogoHeight(parseInt(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                  min="20"
                  max="150"
                />
              </div>

              {/* Alt Text */}
              <div className="col-span-2">
                <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-1">
                  ข้อความอธิบายภาพ (Alt Text)
                </label>
                <input
                  type="text"
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">ใช้สำหรับผู้มีปัญหาด้านการมองเห็น และการทำ SEO</p>
              </div>
            </div>

            {/* Form Actions */}
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
                ) : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
          <h2 className="font-bold">คำแนะนำ</h2>
          <p className="text-sm mt-1">
            การตั้งค่าโลโก้นี้จะทำการอัปโหลดไฟล์ไปยัง Blob Storage และบันทึกข้อมูลการตั้งค่าลงฐานข้อมูล Supabase โดยอัตโนมัติ
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LogoSettingsPage;
