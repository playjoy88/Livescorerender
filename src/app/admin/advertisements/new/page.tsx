'use client';

import React from 'react';
import Layout from '../../../../components/Layout';
import AdForm from '../../../../components/AdForm';

export default function NewAdvertisementPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            เพิ่มโฆษณาใหม่
          </h1>
          <p className="text-text-light mt-2">
            เพิ่มและกำหนดค่าโฆษณาใหม่สำหรับแสดงบนเว็บไซต์
          </p>
        </div>
        
        <AdForm />
      </div>
    </Layout>
  );
}
