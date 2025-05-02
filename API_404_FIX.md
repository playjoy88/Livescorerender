# Fixing 404 Errors with API-SPORTS Football API

This guide addresses the 404 (Not Found) errors that you're encountering with the API-SPORTS Football API.

## Understanding 404 Errors with API-SPORTS

A 404 error means that the server couldn't find the requested resource. In the context of API-SPORTS, this typically occurs when:

1. The endpoint path is incorrect
2. API version mismatch
3. Parameters are formatted incorrectly

## Immediate Fixes Implemented

I've implemented several fixes to address the 404 errors:

### 1. Enhanced Debugging in the Server-Side Proxy

Updated `src/app/api/football-proxy/route.ts` to:
- Show more detailed logs of API requests
- Display partial API key information for verification
- Improved error handling for API responses

### 2. API Endpoint Reference

Here are the correct endpoints for API-SPORTS Football API v3:

```
GET /status                  - Get API status and account information
GET /timezone                - Get list of available timezones
GET /countries               - Get list of available countries
GET /leagues                 - Get list of available leagues/cups
GET /fixtures                - Get fixtures (matches)
GET /fixtures/statistics     - Get statistics for a fixture
GET /fixtures/events         - Get events for a fixture (goals, cards, etc.)
GET /fixtures/lineups        - Get lineups for a fixture
GET /fixtures/players        - Get players statistics for a fixture
GET /standings               - Get standings for a league
GET /teams                   - Get team information
GET /teams/statistics        - Get statistics for a team
GET /players                 - Get player information
GET /transfers               - Get transfer information
GET /trophies                - Get trophy information
GET /predictions             - Get predictions for a fixture
GET /odds                    - Get odds for a fixture
GET /bets                    - Get available bet types
GET /injuries                - Get injuries for a fixture
```

### 3. Common Parameters Format

Make sure parameters are formatted correctly:

- `date`: YYYY-MM-DD format (e.g., 2025-05-01)
- `league`: Integer ID (e.g., 39 for Premier League)
- `season`: Integer year (e.g., 2024)
- `team`: Integer ID
- `player`: Integer ID
- `fixture`: Integer ID

## Testing API Connectivity

To diagnose API issues systematically:

1. **Check API Status First**: The `/status` endpoint is the most basic - if this works, your key and authentication are valid
2. **Test Simple Endpoints**: Try `/leagues` and `/countries` before more complex endpoints
3. **Verify Parameters**: Make sure all parameters are properly formatted

## If You Continue to See 404 Errors

1. **Verify Your API Key**: 
   - Check if your API key is valid in your [API-SPORTS dashboard](https://dashboard.api-sports.io/)
   - Make sure it's properly set in environment variables

2. **Check Your Subscription Plan**:
   - Some endpoints might be restricted based on your subscription level
   - Verify which endpoints are available to you in the API-SPORTS documentation

3. **Try the New API Debug Page**:
   - Go to `/api-debug` on your site
   - Test different endpoints to isolate which ones are failing
   - Check for specific error messages

4. **Update Your Environment Variables**:
   - Make sure both development and production have correct environment variables
   - In Vercel, set both `NEXT_PUBLIC_API_KEY` and `API_KEY` to your API-SPORTS key

## Using Hard-Coded Testing Values

If you're developing locally and want to test with hard-coded parameters:

```javascript
// Example for testing fixtures with known parameters
const testFixture = await fetchFromApi({
  endpoint: 'fixtures',
  params: { date: '2025-05-01' }
});
```

By following these steps, you should be able to resolve the 404 errors and connect successfully to the API-SPORTS Football API.
