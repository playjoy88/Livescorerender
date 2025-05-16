import React, { useState } from 'react';
import { initializeDatabase } from '@/services/vercelDb'; // Changed back to vercelDb

/**
 * Component to initialize the database from the UI
 * This is useful for setting up the database when first deploying
 * or when setting up in development mode
 */
const DbInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setResult(null);
      
      // Use the real database initialization
      const success = await initializeDatabase();
      
      if (success) {
        setResult({
          success: true,
          message: 'Database initialized successfully'
        });
        return;
      } else {
        setResult({
          success: false,
          message: 'Failed to initialize database'
        });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 my-4">
      <h2 className="text-lg font-semibold mb-4">Database Initialization</h2>
      
      <p className="mb-4 text-gray-600">
        This tool initializes the database for advertisements management.
        It creates necessary tables if they don&apos;t exist yet.
      </p>
      
      <div className="flex items-center">
        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInitializing ? 'Initializing...' : 'Initialize Database'}
        </button>
        
        {result && (
          <div className={`ml-4 p-2 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.message}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>This operation will:</p>
        <ul className="list-disc list-inside ml-2">
          <li>Create the advertisements table if it doesn&apos;t exist</li>
          <li>Create other necessary tables for the system</li>
          <li>Not delete or modify existing data</li>
        </ul>
      </div>
    </div>
  );
};

export default DbInitializer;
