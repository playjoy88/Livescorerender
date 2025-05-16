import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabaseClient';

/**
 * Secured API route to perform admin operations on Supabase
 * This route uses the service role key to bypass Row Level Security
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Check if we're authorized (simple check - would use real auth in production)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Extract operation type and parameters
    const { operation, table, data, filters } = body;
    
    // Validate required parameters
    if (!operation || !table) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    let result;
    
    // Perform the requested operation
    switch (operation) {
      case 'insert':
        if (!data) {
          return NextResponse.json(
            { error: 'Missing data for insert operation' },
            { status: 400 }
          );
        }
        result = await supabaseAdmin
          .from(table)
          .insert(data)
          .select();
        break;
          
      case 'update':
        if (!data || !filters) {
          return NextResponse.json(
            { error: 'Missing data or filters for update operation' },
            { status: 400 }
          );
        }
        
        // Apply all filters from the filters object
        let query = supabaseAdmin.from(table).update(data);
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        result = await query.select();
        break;
          
      case 'delete':
        if (!filters) {
          return NextResponse.json(
            { error: 'Missing filters for delete operation' },
            { status: 400 }
          );
        }
        
        // Apply all filters from the filters object
        let deleteQuery = supabaseAdmin.from(table).delete();
        Object.entries(filters).forEach(([key, value]) => {
          deleteQuery = deleteQuery.eq(key, value);
        });
        
        result = await deleteQuery;
        break;
          
      case 'select':
        // Apply filters if provided
        let selectQuery = supabaseAdmin.from(table).select('*');
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            selectQuery = selectQuery.eq(key, value);
          });
        }
        
        result = await selectQuery;
        break;
          
      default:
        return NextResponse.json(
          { error: 'Unsupported operation' },
          { status: 400 }
        );
    }
    
    // Return the result
    return NextResponse.json({
      success: true,
      data: result.data,
      error: result.error
    });
  } catch (error) {
    console.error('Error in admin Supabase API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to perform operation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
