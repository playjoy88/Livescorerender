import { NextRequest, NextResponse } from 'next/server';
import { syncAllNews } from '@/services/newsService';

/**
 * API route for syncing news from external sources
 * This can be called by a CRON job every 12 hours
 * 
 * Example cron configuration in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/news/sync",
 *       "schedule": "0 0,12 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Starting news sync via API endpoint');
    
    // Check for authorization (a simple key check for demonstration)
    const authHeader = request.headers.get('Authorization');
    const secretKey = process.env.CRON_SECRET_KEY || 'your-cron-secret-key';
    
    // Optional: Only allow calls with a valid API key
    if (process.env.NODE_ENV === 'production') {
      if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // Perform the news sync
    await syncAllNews();
    
    return NextResponse.json({
      success: true,
      message: 'News articles synced successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in news sync API route:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to sync news articles',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
