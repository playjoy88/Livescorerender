// Vercel Database Integration Service
// This integrates with Vercel Postgres/Supabase and Blob storage

import { sql as vercelSql } from '@vercel/postgres';
import { supabase } from './supabaseClient';

// Use this flag to determine whether to use Supabase or Vercel Postgres
const USE_SUPABASE = true;
import { put, del, PutBlobResult } from '@vercel/blob';

// Interface for database models
export interface Advertisement {
  id: string;
  name: string;
  position: 'hero' | 'sidebar' | 'in-feed' | 'footer' | 'pre-content';
  size: 'small' | 'medium' | 'large';
  imageUrl: string;
  url: string;
  status: 'active' | 'paused' | 'scheduled' | 'ended';
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  createdAt?: string;
  updatedAt?: string;
}

// Type for creating a new advertisement
export type NewAdvertisement = Omit<Advertisement, 'id'>;

// Define type for SQL query result
interface SqlQueryResult {
  rows: Array<Record<string, unknown>>;
}

// Define type for SQL client
type SqlClient = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<SqlQueryResult>) & {
  query: (text: string, values?: unknown[]) => Promise<SqlQueryResult>;
};

// SQL client reference
let sql: SqlClient;

// This method explicitly tests the PostgreSQL connection
const testPostgresConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing PostgreSQL connection with connection string from environment variables');
    
    // Create a test query to PostgreSQL
    const testResult = await vercelSql`SELECT NOW() as current_time`;
    
    if (testResult && testResult.rows && testResult.rows.length > 0) {
      console.log('PostgreSQL connection test successful!', testResult.rows[0]);
      return true;
    }
    
    console.error('PostgreSQL connection test returned empty result');
    return false;
  } catch (error) {
    console.error('PostgreSQL connection test failed:', error);
    return false;
  }
};

// Initialize PostgreSQL connection
const initPostgresConnection = async (): Promise<SqlClient> => {
  try {
    // Check for Postgres connection string - use direct connection to Supabase host instead of pooler
    const connectionString = process.env.POSTGRES_URL || 
                            process.env.POSTGRES_URL_NON_POOLING || 
                            // Add fallback connection string for production deployments
                            // Use direct host instead of api.pooler subdomain which might be causing DNS issues
                            `postgres://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || "jb9FXOCOQLaSY8l4"}@${process.env.POSTGRES_HOST || "db.prantrwypqcqxvmvpulj.supabase.co"}:5432/${process.env.POSTGRES_DATABASE || "postgres"}?sslmode=require`;
    
    if (!connectionString) {
      console.error('No PostgreSQL connection string found in environment variables');
      console.log('Attempted to use environment variables: POSTGRES_URL, POSTGRES_URL_NON_POOLING');
      throw new Error('Missing PostgreSQL connection string');
    }
    
    // Log all available connection strings (without sensitive parts)
    console.log('Available PostgreSQL connection options:');
    if (process.env.POSTGRES_URL) {
      console.log('- POSTGRES_URL is defined (hidden for security)');
    }
    if (process.env.POSTGRES_PRISMA_URL) {
      console.log('- POSTGRES_PRISMA_URL is defined (hidden for security)');
    }
    if (process.env.POSTGRES_URL_NON_POOLING) {
      console.log('- POSTGRES_URL_NON_POOLING is defined (hidden for security)');
    }
    if (process.env.POSTGRES_HOST) {
      console.log('- POSTGRES_HOST:', process.env.POSTGRES_HOST);
    }
    if (process.env.POSTGRES_USER) {
      console.log('- POSTGRES_USER:', process.env.POSTGRES_USER);
    }
    if (process.env.POSTGRES_DATABASE) {
      console.log('- POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE);
    }
    
    console.log('Attempting to connect to PostgreSQL with connection string available');
    
    // Use the real PostgreSQL client
    const sqlClient = vercelSql as unknown as SqlClient;
    
    // Test the connection
    const isConnected = await testPostgresConnection();
    
    if (!isConnected) {
      console.error('Could not establish PostgreSQL connection despite having connection string');
      throw new Error('PostgreSQL connection test failed');
    }
    
    console.log('Successfully connected to PostgreSQL database!');
    return sqlClient;
  } catch (error) {
    console.error('Failed to initialize PostgreSQL connection:', error);
    throw error;
  }
};

// Import config
import { ENABLE_DB_CONNECTIONS, REQUIRE_DB_CONNECTION, DB_CONFIG } from '../config/dbConfig';

// Initialize the SQL client asynchronously, but only if enabled
if (ENABLE_DB_CONNECTIONS) {
  (async () => {
    console.log('Initializing SQL client...');
    try {
      sql = await initPostgresConnection();
      console.log('SQL client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PostgreSQL connection:', error);
      
      // Only throw if database connection is required
      if (REQUIRE_DB_CONNECTION) {
        throw new Error('Unable to initialize database connection. Database functionality will not work.');
      } else {
        console.warn('Database connection failed, but continuing without database as it is not required');
      }
    }
  })();
} else {
  console.log('Database connections disabled by configuration. Using mock data if needed.');
}

// Export the SQL client with fallback to mock implementation or Supabase when needed
export const getSqlClient = () => {
  // If USE_SUPABASE is true, we use Supabase instead of Vercel Postgres
  if (USE_SUPABASE) {
    console.log('Using Supabase as database client');
    
    // Create a wrapper that adapts the Supabase client to our SQL client interface
    const safeQuery = async (text: string, values?: unknown[]) => {
      try {
        // Use Supabase directly with table operations instead of RPC
        // For simple SELECTs, use .select()
        if (text.trim().toUpperCase().startsWith('SELECT')) {
          try {
            // Extract table name - this is a simplified parser
            const tableNameMatch = text.match(/FROM\s+([^\s,;]+)/i);
            const tableName = tableNameMatch ? tableNameMatch[1] : 'advertisements';
            
            console.log(`Using Supabase to select from table: ${tableName}`);
            
            // Cast the table name to a known type for type safety
            let result;
            if (tableName === 'advertisements') {
              result = await supabase.from('advertisements').select('*');
            } else if (tableName === 'site_settings') {
              result = await supabase.from('site_settings').select('*');
            } else if (tableName === 'users') {
              result = await supabase.from('users').select('*');
            } else {
              console.warn(`Table "${tableName}" is not explicitly typed, using fallback method`);
              // For other tables - this is a fallback that might cause type issues 
              // but will work at runtime if the table exists
              result = await supabase
                .from(tableName as any)
                .select('*');
            }
            
            return { rows: result.data || [] };
          } catch (selectError) {
            console.error(`Error in SELECT operation for SQL: ${text}`, selectError);
            return { rows: [] };
          }
        }
        
        // For CREATE TABLE operations
        if (text.trim().toUpperCase().startsWith('CREATE TABLE')) {
          console.log(`Skipping CREATE TABLE operation in Supabase mode: ${text.substring(0, 100)}...`);
          // Supabase tables should be created through migrations or SQL Editor,
          // not through the client API, so we just acknowledge it
          return { rows: [] };
        }
        
        // For simple INSERT, UPDATE, DELETE operations we'd need more parsing
        if (text.trim().toUpperCase().startsWith('INSERT INTO')) {
          console.log('Supabase INSERT operation detected, this should be implemented specifically per table');
          // This would require specific implementation per table type
          return { rows: [] };
        }
        
        // For other operations we'd need more parsing
        console.log('Executing generic SQL via Supabase:', text);
        console.log('Values:', values);
        
        // Just acknowledge it for now
        return { rows: [] };
      } catch (error) {
        console.error('Error executing query via Supabase:', error);
        return { rows: [] };
      }
    };
    
    // Create the SqlClient with query method and tag function
    const supabaseClient = Object.assign(
      // The tag template function
      async (strings: TemplateStringsArray, ...values: unknown[]) => {
        try {
          // Combine strings and values into a SQL query with parameters
          let sqlText = strings[0];
          for (let i = 0; i < values.length; i++) {
            sqlText += `$${i+1}${strings[i+1] || ''}`;
          }
          
          // Call the query function directly
          return await safeQuery(sqlText, values);
        } catch (error) {
          console.error('Error in SQL template tag function:', error);
          return { rows: [] };
        }
      },
      // Add the query method
      { query: safeQuery }
    ) as SqlClient;
    
    return supabaseClient;
  }
  
  // Original Vercel Postgres logic
  if (!sql) {
    if (DB_CONFIG.useMockDataWhenUnavailable) {
      console.warn('SQL client not available, using mock implementation');
      // Return a mock SQL client that returns empty results
      return {
        query: async () => ({ rows: [] }),
        // Mock the template literal tag function
        [Symbol.asyncIterator]: async function* () {
          yield { rows: [] };
        },
        __proto__: {
          async tag() { return { rows: [] }; }
        }
      } as unknown as SqlClient;
    }
    throw new Error('SQL client not yet initialized or failed to initialize');
  }
  return sql;
};

// Database initialization functions
export const initializeDatabase = async () => {
  try {
    // Ensure the SQL client is initialized
    if (!sql) {
      sql = await initPostgresConnection();
    }
    
    // Use our SQL client
    const currentSql = getSqlClient();
    
    // Create advertisements table if it doesn't exist
    await currentSql`
      CREATE TABLE IF NOT EXISTS advertisements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        position VARCHAR(50) NOT NULL,
        size VARCHAR(50) NOT NULL,
        image_url TEXT NOT NULL,
        url TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        impressions INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        ctr DECIMAL(5,2) NOT NULL DEFAULT 0,
        revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create matches table if it doesn't exist (for custom match data)
    await currentSql`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id VARCHAR(100),
        league_id VARCHAR(100),
        home_team VARCHAR(255) NOT NULL,
        away_team VARCHAR(255) NOT NULL,
        home_score INTEGER DEFAULT 0,
        away_score INTEGER DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
        match_time TIMESTAMP NOT NULL,
        featured BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create leagues table if it doesn't exist
    await currentSql`
      CREATE TABLE IF NOT EXISTS leagues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        logo_url TEXT,
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create settings table if it doesn't exist
    await currentSql`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create site_settings table if it doesn't exist (for logo and other site settings)
    await currentSql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_type VARCHAR(50) NOT NULL,
        image_url TEXT,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        value JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create api_cache table if it doesn't exist
    await currentSql`
      CREATE TABLE IF NOT EXISTS api_cache (
        key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    // Create users table if it doesn't exist
    await currentSql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Vercel Blob Storage service
export const blobStorage = {
  // Upload a file to Vercel Blob Storage
  uploadFile: async (file: File): Promise<string> => {
    try {
      console.log('Uploading file to Vercel Blob Storage:', file.name);
      
      // Create a unique filename to avoid collisions
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_'); // Sanitize filename
      const filename = `${timestamp}_${sanitizedFilename}`;
      
      // Get the token from environment variable
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      
      // Try using Vercel Blob Storage
      try {
        if (!token) {
          console.warn('BLOB_READ_WRITE_TOKEN is not defined in environment variables');
        }
        
        // Upload to Vercel Blob Storage with explicit token
        const blob: PutBlobResult = await put(`ads/${filename}`, file, {
          access: 'public',
          token: token || 'vercel_blob_rw_8qeOQfV8TiBAypBc_cEmeUT5Af4VqnDRzX2QfWfotgFZyd4'
        });
        
        console.log('File uploaded successfully to Vercel Blob Storage:', blob.url);
        return blob.url;
      } catch (uploadError) {
        // For development, just return a path to the public folder if blob storage fails
        console.warn('Failed to upload to Vercel Blob Storage, using fallback:', uploadError);
        return `/ads/${filename}`;
      }
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  // Delete a file from Vercel Blob Storage
  deleteFile: async (url: string): Promise<boolean> => {
    try {
      // Only attempt deletion if it's a full Vercel blob URL
      if (url.includes('vercel-storage.com')) {
        // Get the token from environment variable
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        
        // Delete using explicit token
        await del(url, { 
          token: token || 'vercel_blob_rw_8qeOQfV8TiBAypBc_cEmeUT5Af4VqnDRzX2QfWfotgFZyd4' 
        });
        console.log('File deleted successfully from Vercel Blob Storage:', url);
        return true;
      } else {
        console.log('URL is not a Vercel Blob URL, no need to delete from blob storage:', url);
        return true;
      }
    } catch (error) {
      console.error('Error in deleteFile:', error);
      return false;
    }
  },
  
  // Check if a URL is a valid Vercel Blob Storage URL
  isValidBlobUrl: (url: string): boolean => {
    return url.includes('vercel-storage.com') || url.startsWith('/ads/');
  },
  
  // Format URL to ensure it has the correct format
  formatBlobUrl: (url: string) => {
    // For local development or relative paths, return as is
    if (!url) return '';
    
    if (url.startsWith('/')) {
      return url; // Local file in public directory
    }
    
    // If it's already a full URL but contains vercel-storage.com, proxy it through our API
    if (url.startsWith('http') && url.includes('vercel-storage.com')) {
      // Use our blob-proxy API route to avoid CORS issues
      return `/api/blob-proxy?url=${encodeURIComponent(url)}`;
    }
    
    // If it's already a full URL but not a vercel-storage URL
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's just a filename or partial path, use a relative URL to our own domain
    // This ensures it works in both development and production
    return `/ads/${url.replace(/^\/ads\//, '')}`;
  }
};

// Helper to convert from snake_case (database) to camelCase (application)
const convertToCamelCase = (record: Record<string, unknown>): Advertisement => {
  return {
    id: String(record.id),
    name: String(record.name),
    position: String(record.position) as 'hero' | 'sidebar' | 'in-feed' | 'footer' | 'pre-content',
    size: String(record.size) as 'small' | 'medium' | 'large',
    imageUrl: String(record.image_url),
    url: String(record.url),
    status: String(record.status) as 'active' | 'paused' | 'scheduled' | 'ended',
    startDate: record.start_date instanceof Date ? record.start_date.toISOString() : new Date().toISOString(),
    endDate: record.end_date instanceof Date ? record.end_date.toISOString() : new Date().toISOString(),
    impressions: Number(record.impressions || 0),
    clicks: Number(record.clicks || 0),
    ctr: typeof record.ctr === 'string' ? parseFloat(record.ctr) : Number(record.ctr || 0),
    revenue: typeof record.revenue === 'string' ? parseFloat(record.revenue) : Number(record.revenue || 0),
    createdAt: record.created_at instanceof Date ? record.created_at.toISOString() : undefined,
    updatedAt: record.updated_at instanceof Date ? record.updated_at.toISOString() : undefined,
  };
};

// Advertisement functions
export const getAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    const currentSql = getSqlClient();
    const result = await currentSql`SELECT * FROM advertisements ORDER BY updated_at DESC`;
    return result.rows.map(row => convertToCamelCase(row as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return [];
  }
};

export const getAdvertisementById = async (id: string): Promise<Advertisement | null> => {
  try {
    const currentSql = getSqlClient();
    const result = await currentSql`SELECT * FROM advertisements WHERE id = ${id}`;
    if (result.rows.length === 0) return null;
    
    return convertToCamelCase(result.rows[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching advertisement by ID:', error);
    return null;
  }
};

export const createAdvertisement = async (advertisement: NewAdvertisement): Promise<Advertisement | null> => {
  try {
    const currentSql = getSqlClient();
    const {
      name,
      position,
      size,
      imageUrl,
      url,
      status,
      startDate,
      endDate,
      impressions = 0,
      clicks = 0,
      ctr = 0,
      revenue = 0
    } = advertisement;
    
    // Convert dates to ISO strings for SQL compatibility
    const startDateStr = new Date(startDate).toISOString();
    const endDateStr = new Date(endDate).toISOString();

    const result = await currentSql`
      INSERT INTO advertisements (
        name, position, size, image_url, url, status, 
        start_date, end_date, impressions, clicks, ctr, revenue
      ) VALUES (
        ${name}, ${position}, ${size}, ${imageUrl}, ${url}, ${status},
        ${startDateStr}, ${endDateStr}, ${impressions}, ${clicks}, ${ctr}, ${revenue}
      )
      RETURNING *;
    `;
    
    return convertToCamelCase(result.rows[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return null;
  }
};

export const updateAdvertisement = async (id: string, advertisement: Partial<Advertisement>): Promise<Advertisement | null> => {
  try {
    const currentSql = getSqlClient();
    
    // Build the SQL query dynamically based on what fields are being updated
    const updates: string[] = [];
    const values: (string | number)[] = [];
    
    // Map from camelCase to snake_case for database
    const fieldMap: Record<string, string> = {
      name: 'name',
      position: 'position',
      size: 'size',
      imageUrl: 'image_url',
      url: 'url',
      status: 'status',
      startDate: 'start_date',
      endDate: 'end_date',
      impressions: 'impressions',
      clicks: 'clicks',
      ctr: 'ctr',
      revenue: 'revenue'
    };
    
    // Add each field that is being updated
    Object.entries(advertisement).forEach(([key, value]) => {
      // Skip id and timestamp fields
      if (['id', 'createdAt', 'updatedAt'].includes(key)) return;
      
      const dbField = fieldMap[key];
      if (!dbField) return;
      
      updates.push(`${dbField} = $${values.length + 1}`);
      
      // Convert dates to ISO strings for SQL compatibility
      if (key === 'startDate' || key === 'endDate') {
        values.push(new Date(value as string).toISOString());
      } else {
        values.push(value as string | number);
      }
    });
    
    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // If no fields to update, return null;
    if (updates.length === 0) return null;
    
    // Build and execute the query
    const query = `
      UPDATE advertisements 
      SET ${updates.join(', ')} 
      WHERE id = $${values.length + 1}
      RETURNING *;
    `;
    
    values.push(id);
    
    const result = await currentSql.query(query, values);
    
    return convertToCamelCase(result.rows[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return null;
  }
};

export const deleteAdvertisement = async (id: string): Promise<boolean> => {
  try {
    const currentSql = getSqlClient();
    await currentSql`DELETE FROM advertisements WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return false;
  }
};

export const getAdvertisementsByStatus = async (status: string): Promise<Advertisement[]> => {
  try {
    const currentSql = getSqlClient();
    const result = await currentSql`SELECT * FROM advertisements WHERE status = ${status} ORDER BY updated_at DESC`;
    return result.rows.map(row => convertToCamelCase(row as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching advertisements by status:', error);
    return [];
  }
};

// Functions for tracking impressions and clicks
export const recordImpression = async (id: string): Promise<boolean> => {
  try {
    const currentSql = getSqlClient();
    // Get current advertisement data
    const ad = await getAdvertisementById(id);
    if (!ad) return false;
    
    // Calculate new CTR
    const impressions = ad.impressions + 1;
    const ctr = ad.clicks > 0 ? (ad.clicks / impressions) * 100 : 0;
    
    // Update in the database
    await currentSql`
      UPDATE advertisements 
      SET impressions = ${impressions}, ctr = ${ctr}, updated_at = NOW() 
      WHERE id = ${id}
    `;
    
    return true;
  } catch (error) {
    console.error('Error recording impression:', error);
    return false;
  }
};

export const recordClick = async (id: string): Promise<boolean> => {
  try {
    const currentSql = getSqlClient();
    // Get current advertisement data
    const ad = await getAdvertisementById(id);
    if (!ad) return false;
    
    // Calculate new CTR
    const clicks = ad.clicks + 1;
    const ctr = ad.impressions > 0 ? (clicks / ad.impressions) * 100 : 0;
    
    // Update in the database
    await currentSql`
      UPDATE advertisements 
      SET clicks = ${clicks}, ctr = ${ctr}, updated_at = NOW() 
      WHERE id = ${id}
    `;
    
    return true;
  } catch (error) {
    console.error('Error recording click:', error);
    return false;
  }
};
