import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../types/supabase';
import { getViaFixie } from '@/utils/fixieProxy';

import { isClient } from '@/utils/clientSideDbFallback';

// Handle Supabase initialization
let supabaseAdmin: SupabaseClient<Database> | null = null;
const skipDatabaseInDev = process.env.NODE_ENV === 'development';

// We use a dynamic import because we need to conditionally load Supabase
// only when the environment variables are properly set
if (!isClient && !skipDatabaseInDev) { // Server-side only and not in development mode
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Dynamic import to avoid require() style import
      import('../../../../services/supabaseClient').then(({ supabaseAdmin: supabaseAdminClient }) => {
        supabaseAdmin = supabaseAdminClient;
      }).catch(error => {
        console.error('Failed to dynamically import Supabase client:', error);
      });
    } else {
      console.log('Supabase environment variables not set, skipping database initialization');
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

/**
 * GET - Retrieve API settings or default from last database
 */
export async function GET() {
  try {
    // Attempt to get data from Supabase if available
    let data = null;
    let error = null;
    
    if (supabaseAdmin) {
      // Create a safer query that won't throw if no results
      const result = await supabaseAdmin
        .from('api_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      data = result.data;
      error = result.error;
      
      // Check if we have data (without using .single() which throws on no results)
      if (data && data.length > 0) {
        // Return existing settings if found
        return NextResponse.json({ data: data[0] });
      }
      
      // If no existing settings found or error, log it
      if (error) {
        console.error('Error fetching API settings:', error);
      } else {
        console.log('No API settings found in database, using defaults');
      }
    } else {
      console.log('Supabase not configured, using default API settings');
    }
    
    // Return hardcoded default settings
    return NextResponse.json({ 
      data: {
        id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        api_key: '311ca0120aa14feefaef14e768723481',
        api_host: 'v3.football.api-sports.io',
        cache_timeout: 5,
        request_limit: 1200,
        endpoints: {
          fixtures: true,
          standings: true,
          teams: true,
          players: true,
          odds: false,
          predictions: true
        },
        proxy_enabled: true,
        debug_mode: false,
        polling_interval: 60,
        api_version: 'v3'
      } 
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/api-settings:', err);
    return NextResponse.json(
      { error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new API settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.api_key || !body.api_host || !body.api_version) {
      return NextResponse.json(
        { error: 'Missing required fields: api_key, api_host, api_version' },
        { status: 400 }
      );
    }

    // Format the data properly
    const settingsData = {
      api_key: body.api_key,
      api_host: body.api_host,
      api_version: body.api_version,
      cache_timeout: Number(body.cache_timeout) || 5,
      request_limit: Number(body.request_limit) || 1000,
      polling_interval: Number(body.polling_interval) || 60,
      proxy_enabled: Boolean(body.proxy_enabled),
      debug_mode: Boolean(body.debug_mode),
      endpoints: body.endpoints || {
        fixtures: true,
        standings: true,
        teams: true,
        players: true,
        odds: false,
        predictions: true
      }
    };

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured. Cannot save settings.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_settings')
      .insert(settingsData)
      .select()
      .single();

    if (error) {
      console.error('Error creating API settings:', error);
      return NextResponse.json(
        { error: `Failed to create API settings: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/api-settings:', err);
    return NextResponse.json(
      { error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update existing API settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Format the data properly, only include fields that are provided
    const settingsData: Record<string, string | number | boolean | Record<string, boolean>> = {};
    if (body.api_key !== undefined) settingsData.api_key = body.api_key;
    if (body.api_host !== undefined) settingsData.api_host = body.api_host;
    if (body.api_version !== undefined) settingsData.api_version = body.api_version;
    if (body.cache_timeout !== undefined) settingsData.cache_timeout = Number(body.cache_timeout);
    if (body.request_limit !== undefined) settingsData.request_limit = Number(body.request_limit);
    if (body.polling_interval !== undefined) settingsData.polling_interval = Number(body.polling_interval);
    if (body.proxy_enabled !== undefined) settingsData.proxy_enabled = Boolean(body.proxy_enabled);
    if (body.debug_mode !== undefined) settingsData.debug_mode = Boolean(body.debug_mode);
    if (body.endpoints !== undefined) settingsData.endpoints = body.endpoints;

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured. Cannot update settings.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_settings')
      .update(settingsData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating API settings:', error);
      return NextResponse.json(
        { error: `Failed to update API settings: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error in PUT /api/admin/api-settings:', err);
    return NextResponse.json(
      { error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}

/**
 * Test API connectivity
 */
export async function OPTIONS() {
  try {
    // Default values if Supabase is not available
    let data = null;
    let error = null;
    
    // First check if we can access our own API settings
    if (supabaseAdmin) {
      const result = await supabaseAdmin
        .from('api_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      data = result.data;
      error = result.error;
    } else {
      console.log('Supabase not configured, using default API settings for test');
    }

    // Log API settings status
    if (error) {
      console.error('Error accessing API settings during test:', error);
    } else if (data && data.length > 0) {
      console.log('Using API settings from database for proxy test');
    } else {
      console.log('No API settings found in database, proxy will use defaults');
    }

    // Get server IP address for diagnostics
    let serverIp = 'unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      serverIp = ipData.ip;
      console.log('Server IP address:', serverIp);
    } catch (ipError) {
      console.error('Could not determine server IP address:', ipError);
    }

    // Now make a test request to the API
    try {
      // Get settings from previous step (or use defaults)
      const apiKey = data && data.length > 0 ? data[0].api_key : '311ca0120aa14feefaef14e768723481';
      const apiHost = data && data.length > 0 ? data[0].api_host : 'v3.football.api-sports.io';
      
      const apiUrl = `https://v3.football.api-sports.io/status`;
      
      console.log('Testing API connection (via Fixie proxy):', apiUrl);
      
      // Headers for the API request
      const apiHeaders = {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        'x-apisports-key': apiKey  // Alternative header format also accepted
      };
      
      // We now use the direct Fixie proxy implementation which doesn't rely on environment variables
      // This forces all requests through the proxy with explicit connection handling
      
      // Use our direct Fixie proxy implementation that forces requests through the proxy
      console.log(`[API Settings] Making direct Fixie proxy request to: ${apiUrl}`);
      const result = await getViaFixie(apiUrl, apiHeaders);
      
      // Create a Response-like object from the result
      const response = {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        statusText: result.status === 200 ? 'OK' : `Status: ${result.status}`,
        headers: result.headers,
        json: async () => result.data
      };
    
      const responseData = await response.json();
      
      if (!response.ok) {
        // Check for IP restriction error
        if (responseData.errors && responseData.errors.Ip) {
          return NextResponse.json({
            success: false, 
            message: `IP restriction error: ${responseData.errors.Ip}`,
            details: {
              status: response.status,
              serverIp: serverIp,
              error: 'This server IP needs to be whitelisted in the API-Football dashboard.',
              resolution: 'Please add this IP address to your allowed IPs in the API dashboard: ' + serverIp,
              data: responseData
            }
          });
        }
        
        return NextResponse.json({
          success: false, 
          message: `API test failed with status ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            serverIp: serverIp,
            data: responseData
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Connection successful. API is operational.',
        details: {
          status: response.status,
          endpoint: 'status',
          serverIp: serverIp,
          data: responseData
        }
      });
    } catch (apiError) {
      console.error('Error making test request to football API:', apiError);
      return NextResponse.json({
        success: false, 
        message: `Failed to connect to API: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
        details: {
          serverIp: serverIp,
          error: apiError instanceof Error ? apiError.stack : null
        }
      });
    }
  } catch (err) {
    console.error('Unexpected error in OPTIONS /api/admin/api-settings:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: `Connection test failed: ${err instanceof Error ? err.message : String(err)}` 
      },
      { status: 500 }
    );
  }
}
