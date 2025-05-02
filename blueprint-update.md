# Playjoy Livescore API Integration Updates

This document provides updates to the Playjoy Livescore blueprint, focusing on the API integration improvements implemented to fix the 403 Forbidden and 404 Not Found errors previously encountered.

## New API Architecture Components

The following updates should be incorporated into the "Core Architecture Components" section of the blueprint:

### API Integration Framework

- **Standardized Endpoint Structure**:
  - Central `apiEndpoints.js` module with comprehensive endpoint definitions
  - Standard helper functions for all API interactions
  - Consistent parameter naming and validation

- **Server-Side API Proxy**:
  - Secure server-side proxy for all API requests in production
  - API key protection (no client-side exposure)
  - Rate limit tracking and monitoring
  - Detailed error logging and reporting

- **Smart Environment Detection**:
  - Environment-aware configuration (development vs. production)
  - Direct API access in development for easier debugging
  - Server-side proxy in production for security
  - Automatic configuration based on NODE_ENV

- **Enhanced Error Handling**:
  - Multiple fallback mechanisms for problematic endpoints
  - Graceful degradation for API outages
  - Standardized error reporting
  - Informative user feedback on API failures

- **API Debugging Tools**:
  - Interactive API testing page (`/api-debug`)
  - Visual response inspection
  - Endpoint testing utilities
  - Environment variable verification

## Updated Technical Considerations

Add these points to the "Key Technical Considerations" section:

### API Integration Strategy

- **Standardized Endpoint Access**:
  - All API interactions must use the `apiEndpoints.js` helper functions
  - No hardcoded endpoint paths to prevent endpoint errors
  - Comprehensive validation for all parameters
  - Consistent error handling across all API requests

- **Server-Side API Security**:
  - API keys must never be exposed in client-side code
  - All production API requests routed through server-side proxy
  - JWT or similar authentication for authenticated endpoints
  - Rate limit monitoring and throttling

- **API Data Caching**:
  - Intelligent caching based on data type and freshness requirements
  - Multi-level cache strategy (memory, localStorage, IndexedDB)
  - Cache invalidation on match events
  - Background refresh for critical data

- **API Documentation**:
  - Comprehensive endpoint documentation
  - Parameter specifications and examples
  - Response structure documentation
  - Error handling guidelines

## Implementation Details

Add this section to the "Development Roadmap" under Phase 1:

### API Integration Framework (Added to Phase 1)

- [x] **API Endpoint Standardization**
  - [x] Create `apiEndpoints.js` module with all endpoint definitions
  - [x] Implement helper functions for all common API calls
  - [x] Document parameter requirements and validation
  - [x] Create comprehensive endpoint reference guide

- [x] **Server-Side API Proxy Development**
  - [x] Implement Next.js API route for proxy
  - [x] Add security measures to protect API key
  - [x] Implement error handling and logging
  - [x] Add rate limit tracking

- [x] **API Debugging Tools**
  - [x] Create interactive API testing page
  - [x] Add environment variable inspection
  - [x] Implement response visualization
  - [x] Add testing buttons for common endpoints

## API Documentation

Add a new section to the blueprint:

### API Documentation

All API interactions in Playjoy Livescore follow these guidelines:

1. **Standardized Access Pattern**:
   ```javascript
   // Example: Getting fixtures for today
   import { fetchFromApi } from '../services/api';
   import * as apiEndpoints from '../services/apiEndpoints';

   const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
   const todayOptions = apiEndpoints.getFixturesEndpoint({ date: today });
   const matchData = await fetchFromApi(todayOptions);
   ```

2. **Error Handling Pattern**:
   ```javascript
   try {
     const leagueOptions = apiEndpoints.getLeaguesEndpoint({ 
       country: 'Thailand', 
       current: true 
     });
     const leagueData = await fetchFromApi(leagueOptions);
     // Process data
   } catch (error) {
     // Handle error appropriately
     console.error('League data error:', error);
     // Show user-friendly message
     // Fall back to cached data if available
   }
   ```

3. **Production vs. Development**:
   - Development: Direct API access with visible errors for debugging
   - Production: Server-side proxy with secure API key handling
   - Common codebase works in both environments automatically

4. **API Reference Documentation**:
   - Comprehensive endpoint listing in `API_ENDPOINTS_GUIDE.md`
   - Parameter specifications and examples
   - Common error types and handling strategies
   - Best practices for API integration

## League IDs Reference

Add this table to the "Appendix" section:

### Appendix: League IDs

The following league IDs are standardized throughout the application:

| League | ID |
|--------|-----|
| Thai League | 290 |
| Premier League | 39 |
| La Liga | 140 |
| Bundesliga | 78 |
| Serie A | 135 |
| Ligue 1 | 61 |
| Champions League | 2 |

These IDs should be accessed via the `LEAGUE_IDS` constant in the `apiEndpoints.js` module.
