'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Mock AI model data
const mockAiModels = [
  {
    id: 'model-001',
    name: 'Playjoy Stats Master',
    type: 'statistics',
    description: 'ใช้สถิติการแข่งขันและผลการแข่งขันในอดีตเพื่อคาดการณ์ผลการแข่งขัน',
    version: '2.3.1',
    accuracy: 64.8,
    lastUpdated: '2025-04-10T00:00:00Z',
    totalPredictions: 18429,
    correctPredictions: 11942,
    status: 'active',
    parameters: {
      historyWeight: 0.6,
      recentFormWeight: 0.8,
      homeAdvantageWeight: 0.7,
      playerInjuryWeight: 0.5,
      weatherWeight: 0.3
    }
  },
  {
    id: 'model-003',
    name: 'Playjoy Thai Expert',
    type: 'specialized',
    description: 'โมเดลเฉพาะทางสำหรับการแข่งขันฟุตบอลไทย ที่เข้าใจบริบทของฟุตบอลไทยอย่างลึกซึ้ง',
    version: '2.0.0',
    accuracy: 68.5,
    lastUpdated: '2025-04-20T00:00:00Z',
    totalPredictions: 6248,
    correctPredictions: 4280,
    status: 'active',
    parameters: {
      thaiLeagueSpecificFactors: 0.9,
      localWeatherEffects: 0.7,
      fanBaseInfluence: 0.6,
      thaiPlayerInvolvementWeight: 0.8,
      venueSpecificHistory: 0.65
    }
  },
  {
    id: 'model-004',
    name: 'Playjoy Community',
    type: 'crowdsourced',
    description: 'รวบรวมการคาดการณ์จากผู้ใช้งานและนำมาวิเคราะห์ร่วมกับอัลกอริทึม',
    version: '1.5.2',
    accuracy: 59.7,
    lastUpdated: '2025-04-18T00:00:00Z',
    totalPredictions: 21053,
    correctPredictions: 12568,
    status: 'active',
    parameters: {
      userReputationWeight: 0.75,
      consensusThreshold: 0.6,
      expertUserBoost: 0.7,
      recentAccuracyWeight: 0.8,
      participationVolume: 0.5
    }
  }
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-gray-100 text-gray-800';
  let label = status;
  
  switch (status) {
    case 'active':
      color = 'bg-green-100 text-green-800';
      label = 'ใช้งานอยู่';
      break;
    case 'beta':
      color = 'bg-blue-100 text-blue-800';
      label = 'ทดสอบ (Beta)';
      break;
    case 'maintenance':
      color = 'bg-yellow-100 text-yellow-800';
      label = 'ปรับปรุง';
      break;
    case 'inactive':
      color = 'bg-red-100 text-red-800';
      label = 'ไม่ใช้งาน';
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
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Main component
export default function AiModelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  
  // Filter models based on search and status filter
  const filteredModels = mockAiModels.filter(model => {
    const matchesSearch = 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || model.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate average accuracy
  const averageAccuracy = mockAiModels.reduce((sum, model) => sum + model.accuracy, 0) / mockAiModels.length;
  const activeModels = mockAiModels.filter(model => model.status === 'active').length;
  const totalPredictions = mockAiModels.reduce((sum, model) => sum + model.totalPredictions, 0);
  
  return (
    <div className="space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-text-light mb-1">โมเดล AI ทั้งหมด</p>
          <h3 className="text-2xl font-bold text-gray-800">{mockAiModels.length}</h3>
          <p className="text-xs text-text-light mt-2">ใช้งานอยู่ {activeModels} โมเดล</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-text-light mb-1">ความแม่นยำเฉลี่ย</p>
          <h3 className="text-2xl font-bold text-indigo-600">{averageAccuracy.toFixed(1)}%</h3>
          <p className="text-xs text-text-light mt-2">จากการทำนายทั้งหมด</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-text-light mb-1">การทำนายทั้งหมด</p>
          <h3 className="text-2xl font-bold text-gray-800">{totalPredictions.toLocaleString()}</h3>
          <p className="text-xs text-text-light mt-2">จากทุกโมเดล</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-text-light mb-1">โมเดลแม่นยำที่สุด</p>
          <h3 className="text-2xl font-bold text-indigo-600">
            {mockAiModels.reduce((best, model) => (model.accuracy > best.accuracy ? model : best), mockAiModels[0]).name.split(' ').slice(1).join(' ')}
          </h3>
          <p className="text-xs text-text-light mt-2">ความแม่นยำ {Math.max(...mockAiModels.map(model => model.accuracy)).toFixed(1)}%</p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-prompt)' }}>
            AI Models Management
          </h1>
          
          <Link href="/admin/ai-models/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มโมเดลใหม่
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
              placeholder="Search models..."
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
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="beta">Beta</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* AI Models listing */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  โมเดล
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  ประเภท
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  เวอร์ชั่น
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  ความแม่นยำ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-light">
                    No AI models found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredModels.map(model => (
                  <React.Fragment key={model.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-color text-white rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{model.name}</div>
                            <div className="text-xs text-text-light truncate max-w-xs">{model.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {model.type === 'statistics' && 'สถิติวิเคราะห์'}
                          {model.type === 'specialized' && 'เฉพาะทาง'}
                          {model.type === 'crowdsourced' && 'รวมความคิดเห็น'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">v{model.version}</div>
                        <div className="text-xs text-text-light">
                          อัพเดท {formatDate(model.lastUpdated)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {model.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-xs text-text-light">
                          {model.correctPredictions.toLocaleString()} / {model.totalPredictions.toLocaleString()} คำทำนาย
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={model.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setExpandedModelId(expandedModelId === model.id ? null : model.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {expandedModelId === model.id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                        </button>
                        <Link href={`/admin/ai-models/${model.id}/edit`}>
                          <button className="text-blue-600 hover:text-blue-900">
                            แก้ไข
                          </button>
                        </Link>
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedModelId === model.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-bold text-gray-900 mb-4">Model Details</h3>
                              <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                              
                              <h4 className="font-medium text-sm mb-2">Model Parameters</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {Object.entries(model.parameters).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-sm">{key}</span>
                                  <span className="text-sm font-medium">{(value as number).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                              <Link href={`/admin/ai-models/${model.id}/analytics`}>
                                <button className="text-indigo-600 hover:text-indigo-900">
                                  View Detailed Analytics
                                </button>
                              </Link>
                              <Link href={`/admin/ai-models/${model.id}/edit`}>
                                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                  Edit Model
                                </button>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Actions panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">การจัดการโมเดล</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            รายงานประสิทธิภาพ
          </button>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            อัพเดทข้อมูลเทรนนิ่ง
          </button>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            การตั้งค่าระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
