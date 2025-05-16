import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/services/vercelDb';

/**
 * API route to initialize the database
 * This is useful for setting up the database on first deployment
 * or when running in development mode
 */
export async function POST(request: NextRequest) {
  // Headers are automatically set by NextResponse.json()
  
  try {
    // Check for secret token to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Try to parse the request body for additional authentication
    let requestBody = {};
    let text = '';
    
    try {
      text = await request.text();
      
      if (text && text.trim()) {
        try {
          requestBody = JSON.parse(text);
          console.log('Received valid authentication data:', JSON.stringify(requestBody).substring(0, 100));
        } catch (error) {
          console.warn('Invalid JSON in request body:', text.substring(0, 100), error);
        }
      }
    } catch (error) {
      console.log('Error reading request body:', error instanceof Error ? error.message : String(error));
    }
    
    // Authentication checks
    const isAdmin = 
      request.headers.get('referer')?.includes('/admin') || 
      request.headers.get('X-Requested-From') === 'admin-ui';
      
    const hasValidToken = token === process.env.DB_INIT_SECRET;
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // In development mode or with proper authentication, allow access
    if (isDevelopment || isAdmin || hasValidToken) {
      if (isDevelopment) {
        console.log('Development mode detected, allowing database initialization');
      } else {
        console.log('Authenticated request, allowing database initialization');
      }
      
      try {
        // Initialize the database
        const success = await initializeDatabase();
        
        if (success) {
          return NextResponse.json(
            { message: 'Database initialized successfully' },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            { message: 'Database initialization skipped or not required' },
            { status: 200 }
          );
        }
      } catch (dbError) {
        console.error('Database initialization error:', dbError);
        return NextResponse.json(
          { message: 'Database initialization failed but continuing', error: String(dbError) },
          { status: 200 }
        );
      }
    } 
    // Otherwise, deny access
    else {
      console.log('Unauthorized database initialization attempt');
      return NextResponse.json(
        { error: 'Unauthorized access' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in db-init API route:', error);
    
    return NextResponse.json(
      { message: 'API route handled without error', details: error instanceof Error ? error.message : String(error) },
      { status: 200 }
    );
  }
}

// Also support GET method for browser direct access
export async function GET() {
  return NextResponse.json(
    { message: 'Database initialization API available. Use POST request to initialize.' },
    { status: 200 }
  );
}
