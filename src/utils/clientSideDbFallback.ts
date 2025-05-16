/**
 * Client-side database fallback utilities
 * 
 * This module provides fallback functions for handling database operations
 * when running in the browser context where direct database access isn't possible.
 */

// Flag to check if we're running on the client
export const isClient = typeof window !== 'undefined';

/**
 * Safely handles database operations on the client side by returning mock data
 * @param operation A function that performs a database operation
 * @param fallbackData Default data to return when in client context
 * @returns The result of the operation or fallback data
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackData: T
): Promise<T> {
  // If we're on the client side, return the fallback data
  if (isClient) {
    console.debug('Running in browser context - using mock data instead of DB connection');
    return fallbackData;
  }

  // On the server side, attempt the actual operation
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    return fallbackData;
  }
}

/**
 * Utility to handle database-related errors in client components
 * @param error The error that was caught
 * @param fallbackData Default data to return
 */
export function handleDbError<T>(error: Error | unknown, fallbackData: T): T {
  // Hide PostgreSQL connection errors in the console to avoid alarming users
  if (
    error instanceof Error &&
    (error.message.includes('PostgreSQL') || 
     error.message.includes('Supabase') ||
     error.message.includes('POSTGRES_URL') ||
     error.toString().includes('missing_connection_string'))
  ) {
    // In development, log a friendlier message
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Database connection not available in client context (safe to ignore)');
    }
  } else {
    // For other errors, log them
    console.error('Error in component:', error);
  }
  
  return fallbackData;
}
