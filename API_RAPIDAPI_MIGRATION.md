# API Migration: Direct API-SPORTS to RapidAPI

This document explains the migration from direct API-SPORTS access to RapidAPI for the Football API in the LiveScore project.

## Changes Made

1. **Updated API Proxy Implementation**
   - Changed API endpoint from `https://v3.football.api-sports.io` to `https://api-football-v1.p.rapidapi.com/v3`
   - Updated authentication headers from `x-apisports-key` to RapidAPI format (`x-rapidapi-key` and `x-rapidapi-host`)
   - Added support for `API_HOST` environment variable

2. **Environment Variables Changes**
   - Added `NEXT_PUBLIC_API_HOST` and `API_HOST` variables 
   - Updated URLs in environment configurations
   - Maintained backward compatibility with existing key variables

## Why RapidAPI?

RapidAPI provides several advantages over direct API-SPORTS access:

1. **Single Account Management**: Manage multiple APIs under one account
2. **Improved Analytics**: Better usage monitoring and analytics
3. **Flexible Plans**: More subscription options
4. **Enhanced Documentation**: Comprehensive and interactive API documentation

## Required Vercel Environment Variables

To make this work in your Vercel deployment, set these environment variables:

```
API_KEY=your_rapidapi_key
API_HOST=api-football-v1.p.rapidapi.com
```

## Testing the Migration

The static and Next.js API test pages have been updated to work with both APIs. You can use them to verify the migration was successful:

- Static HTML Test Page: `/api-test.html`
- Next.js Test Page: `/api-test`

Both will show "Error/Missing application key" if the environment variables are not properly set in Vercel.

## Fixing the "Error/Missing application key" Issue

If you're still seeing this error after the migration:

1. **Verify Environment Variables**:
   - Ensure `API_KEY` is set correctly in Vercel
   - Ensure `API_HOST` is set to `api-football-v1.p.rapidapi.com`

2. **RapidAPI Subscription**:
   - Confirm your RapidAPI subscription to the Football API is active
   - Make sure your account has remaining API calls

3. **Domain Authorization**:
   - Add your Vercel deployment domain to the list of authorized domains in your RapidAPI dashboard

## Reverting to Direct API (If Needed)

If you need to revert back to direct API-SPORTS access:

1. Update the proxy URL in `playjoy-livescore/src/app/api/proxy/route.js`:
   ```javascript
   const API_BASE_URL = 'https://v3.football.api-sports.io';
   ```

2. Change the header format back to API-SPORTS style:
   ```javascript
   const headers = {
     'x-apisports-key': API_KEY
   };
   ```

However, we recommend using the RapidAPI version as it provides more features and better management tools.
