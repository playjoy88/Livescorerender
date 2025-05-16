'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Link from 'next/link';
import { initializeDatabase } from '../../../services/vercelDb';

// Component to display database table structure
const TableStructure = ({ tableName, columns }: { tableName: string; columns: any[] }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-medium mb-2 text-blue-600">{tableName}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คอลัมน์</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทข้อมูล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คีย์หลัก</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอมรับค่าว่าง</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ค่าเริ่มต้น</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {columns.map((column, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{column.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.data_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.is_primary_key ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Yes
                    </span>
                  ) : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.is_nullable ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.column_default || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function DatabaseToolsPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [tableStructures, setTableStructures] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Fetch database tables
  useEffect(() => {
    async function fetchDatabaseInfo() {
      try {
        setIsLoading(true);
        
        // Fetch all tables in the public schema
        const { data: tableData, error: tableError } = await supabase
          .from('pg_tables')
          .select('*')
          .eq('schemaname', 'public');
        
        if (tableError) throw tableError;
        
        if (tableData) {
          setTables(tableData);
          
          // Fetch column information for each table
          const structuresPromises = tableData.map(async (table) => {
            const { data: columnData, error: columnError } = await supabase
              .rpc('get_table_columns', { table_name: table.tablename });
            
            if (columnError) throw columnError;
            
            return { tableName: table.tablename, columns: columnData || [] };
          });
          
          const structures = await Promise.all(structuresPromises);
          
          // Convert array of { tableName, columns } objects to Record<tableName, columns[]>
          const tableStructuresRecord: Record<string, any[]> = {};
          structures.forEach(item => {
            tableStructuresRecord[item.tableName] = item.columns;
          });
          
          setTableStructures(tableStructuresRecord);
        }
      } catch (error) {
        console.error('Error fetching database info:', error);
        setMessage({
          text: 'ไม่สามารถโหลดข้อมูลฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDatabaseInfo();
  }, []);

  // Handle database initialization
  const handleInitializeDatabase = async () => {
    try {
      setIsInitializing(true);
      setMessage(null);
      
      const result = await initializeDatabase();
      
      if (result) {
        setMessage({
          text: 'ฐานข้อมูลถูกเริ่มต้นสำเร็จแล้ว กำลังรีเฟรชข้อมูล...',
          type: 'success'
        });
        
        // Refresh the page after successful initialization
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          text: 'ไม่สามารถเริ่มต้นฐานข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setMessage({
        text: 'เกิดข้อผิดพลาดในการเริ่มต้นฐานข้อมูล: ' + (error instanceof Error ? error.message : String(error)),
        type: 'error'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>เครื่องมือจัดการฐานข้อมูล</h1>
        
        <div className="flex space-x-4">
          <Link href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            ย้อนกลับไปหน้าแดชบอร์ด
          </Link>
          
          <button
            onClick={handleInitializeDatabase}
            disabled={isInitializing}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializing ? 'กำลังเริ่มต้นฐานข้อมูล...' : 'เริ่มต้นฐานข้อมูล / สร้างตาราง'}
          </button>
        </div>
      </div>
      
      {/* Message display */}
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูลฐานข้อมูล...</span>
        </div>
      ) : (
        <>
          {/* Database dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">ตารางในฐานข้อมูล</h3>
              <p className="text-3xl font-bold">{tables.length}</p>
              <p className="mt-1 text-blue-100">ตารางทั้งหมดในฐานข้อมูล</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">คอลัมน์ทั้งหมด</h3>
              <p className="text-3xl font-bold">
                {Object.values(tableStructures).reduce((sum, columns) => sum + columns.length, 0)}
              </p>
              <p className="mt-1 text-green-100">คอลัมน์ทั้งหมดในฐานข้อมูล</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">คีย์หลัก</h3>
              <p className="text-3xl font-bold">
                {Object.values(tableStructures).reduce((sum, columns) => {
                  return sum + columns.filter(col => col.is_primary_key).length;
                }, 0)}
              </p>
              <p className="mt-1 text-purple-100">คีย์หลักทั้งหมดในฐานข้อมูล</p>
            </div>
          </div>
          
          {/* Database tables accordion */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-4">โครงสร้างฐานข้อมูล</h2>
            
            {tables.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">ไม่พบตารางในฐานข้อมูล</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        กรุณาคลิกปุ่ม "เริ่มต้นฐานข้อมูล / สร้างตาราง" เพื่อสร้างโครงสร้างฐานข้อมูลเริ่มต้น
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {tables.map((table) => (
                  <TableStructure
                    key={table.tablename}
                    tableName={table.tablename}
                    columns={tableStructures[table.tablename] || []}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
