# API Setup Guide for LiveScore Application

This guide will help you properly set up the API for your LiveScore application, addressing the "Failed to load match data" error and mockup data issues.

## Understanding the Current Issue

The application is currently showing an error message because:

1. The API key in your `.env.local` file (`311ca0120aa14feefaef14e768723481`) is likely a placeholder or an invalid key
2. The RapidAPI service requires proper authentication and domain authorization
3. The environment variables need to be set up in Vercel for production deployments

## Step 1: Get a Valid API Key

1. Visit [RapidAPI](https://rapidapi.com/api-sports/api/api-football/)
2. Sign up or log in to your account
3. Subscribe to the API-Football service (they have free tiers available)
4. After subscribing, you'll get your API key from the dashboard

## Step 2: Update Your Local Environment Variables

Update your `.env.local` file with your real API key:

```
NEXT_PUBLIC_API_URL=https://api-football-v1.p.rapidapi.com/v3
NEXT_PUBLIC_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_API_HOST=api-football-v1.p.rapidapi.com
```

## Step 3: Set Up Environment Variables in Vercel

For your production site at `https://live-score-7e6cdtnro-playjoy88s-projects.vercel.app/`:

1. Go to your [Vercel Dashboard](https://vercel.com/)
2. Select your LiveScore project
3. Go to "Settings" > "Environment Variables"
4. Add the following variables:
   - `NEXT_PUBLIC_API_URL`: `https://api-football-v1.p.rapidapi.com/v3`
   - `NEXT_PUBLIC_API_KEY`: Your actual API key
   - `NEXT_PUBLIC_API_HOST`: `api-football-v1.p.rapidapi.com`
5. Click "Save" and then redeploy your application

## Step 4: Authorize Your Domain in RapidAPI

RapidAPI requires you to whitelist the domains that can use your API key:

1. Go to your RapidAPI dashboard
2. Find the API-Football subscription
3. Go to Security/Settings
4. Add these domains to your whitelist:
   - `localhost` (for local testing)
   - `live-score-7e6cdtnro-playjoy88s-projects.vercel.app` (your production domain)
   - Any other domains you may use

## Step 5: Test Your Configuration

1. After updating your API key locally, run:
   ```bash
   npm run dev
   ```
   
2. If configured correctly, you should see real data instead of the error message or mockup data

## Understanding the Fallback Mechanism

The application is designed to use sample mockup data in two scenarios:

1. When the API request fails (like when using an invalid API key)
2. When the API returns no results

In `src/app/page.tsx`, this logic is implemented in the `fetchMatchData` function:

```javascript
// If API didn't return matches or failed, use sample data for demonstration
if (fetchedMatches.length === 0) {
  console.log('No matches from API, using sample data');
  fetchedMatches = [...sampleMatches];
}
```

If you're still seeing mockup data even with a valid API key, it might be because:
- There are no live matches at the moment
- Your API subscription level doesn't provide access to the requested data
- The API host or endpoints have changed

## Additional Troubleshooting

If you're still experiencing issues:

1. **Check browser console for detailed errors**:
   - Open your browser's developer tools (F12)
   - Look for network errors or JavaScript errors in the console

2. **Add more debugging in the API service**:
   ```javascript
   // In src/services/api.ts, modify the fetchFromApi function
   console.log('API URL:', url);
   console.log('API Key present:', !!API_KEY);
   console.log('API Host:', API_HOST);
   ```

3. **Verify API response format**:
   The API data structure might have changed. Compare the actual response with what your code expects.

4. **Check API limits**:
   Free tiers often have request limits. You might have exceeded your quota.

## Ensuring Sample Data Display

If you want to always ensure some data displays (even during API issues):

1. In your error handling code, make sure you're properly falling back to sample data
2. Consider adding a delay before showing error messages to give the API time to respond
3. Implement a more sophisticated caching mechanism to store the last successful API response
