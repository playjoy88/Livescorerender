'use client';

import React from 'react';
import Layout from '../../../../../components/Layout';
import AdForm from '../../../../../components/AdForm';

export default function EditAdvertisementPage({ 
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            แก้ไขโฆษณา
          </h1>
          <p className="text-text-light mt-2">
            แก้ไขและอัปเดตโฆษณาที่มีอยู่
          </p>
        </div>
        
        <AdForm id={id} />
      </div>
    </Layout>
  );
}
