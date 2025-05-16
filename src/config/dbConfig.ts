// Database Configuration
// This file controls database initialization behavior

// Control whether to attempt database connections
// Setting this to false will prevent connection attempts during build
export const ENABLE_DB_CONNECTIONS = process.env.NODE_ENV === 'production'; // Only enable database connections in production

// Control whether to throw errors if database connections fail
// Setting this to false will allow the application to run without a database
export const REQUIRE_DB_CONNECTION = false; // Don't require database connection in any environment

// Database feature flags
export const DB_CONFIG = {
  // Enable/disable specific database features
  enableAdvertisements: true,
  enableMatches: false,
  enableUsers: false,
  enableApiCache: false,
  
  // Control logging verbosity
  verboseLogging: process.env.NODE_ENV !== 'production',
  
  // Control whether to use mock data when database is unavailable
  useMockDataWhenUnavailable: false, // Never use mock data, always use real database
  
  // Default connection retry settings
  connectionRetries: 3,
  connectionRetryDelay: 1000, // milliseconds
};
