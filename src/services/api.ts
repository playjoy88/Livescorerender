/**
 * API Service for Playjoy Livescore
 * Handles all requests to the football API
 */

// Always use the server-side proxy for production
// In development, we still offer flexibility with environment variables
const isProduction = process.env.NODE_ENV === 'production';

// Always use proxy endpoint in production for security
const API_URL = isProduction 
  ? '/api/proxy' // Server-side proxy (secure - keeps API key on server)
  : process.env.NEXT_PUBLIC_API_URL || '/api/proxy'; // Default to proxy even in development

// Cache storage for API responses
interface ApiResponse {
  response: unknown;
  errors: Record<string, unknown>;
  results: number;
  paging?: {
    current: number;
    total: number;
  };
  parameters?: Record<string, unknown>;
}

const cache: Record<string, { data: ApiResponse; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface ApiOptions {
  endpoint: string;
  params?: Record<string, string | number>;
  cacheDuration?: number;
}

/**
 * Makes a request to the football API
 */
export async function fetchFromApi({ endpoint, params = {}, cacheDuration = CACHE_DURATION }: ApiOptions) {
  // Construct the URL with query parameters
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  // For production, use the proxy differently with endpoint as a parameter
  let url;
  if (isProduction) {
    // Pass endpoint as a query parameter to the proxy
    queryParams.append('endpoint', endpoint);
    url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  } else {
    // For direct API access, append the endpoint to the URL
    url = `${API_URL}/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  }
  
  // Check cache first
  const cacheKey = url;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < cacheDuration) {
    console.log(`Using cached data for: ${url}`);
    return cache[cacheKey].data;
  }
  
  // Make the API request
  try {
    // No need to pass API key in headers - proxy handles this securely
    console.log('Fetching URL:', url); // Debug log
    
    const response = await fetch(url);
    
    // Log rate limit headers for debugging
    if (response.headers) {
      console.log('Daily limit:', response.headers.get('x-ratelimit-requests-limit'));
      console.log('Daily remaining:', response.headers.get('x-ratelimit-requests-remaining'));
      console.log('Minute limit:', response.headers.get('X-RateLimit-Limit'));
      console.log('Minute remaining:', response.headers.get('X-RateLimit-Remaining'));
    }
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    cache[cacheKey] = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
}

/**
 * Gets live fixtures
 */
export async function getLiveFixtures() {
  return fetchFromApi({
    endpoint: 'fixtures',
    params: { live: 'all' },
    cacheDuration: 30 * 1000 // 30 seconds for live data
  });
}

/**
 * Gets fixtures for a specific date
 */
export async function getFixturesByDate(date: string) {
  return fetchFromApi({
    endpoint: 'fixtures',
    params: { date }
  });
}

/**
 * Gets league standings
 */
export async function getLeagueStandings(league: number, season: number) {
  return fetchFromApi({
    endpoint: 'standings',
    params: { league, season },
    cacheDuration: 60 * 60 * 1000 // 1 hour for standings
  });
}

/**
 * Gets fixture statistics
 */
export async function getFixtureStatistics(fixtureId: number) {
  return fetchFromApi({
    endpoint: `fixtures/statistics`,
    params: { fixture: fixtureId }
  });
}

/**
 * Gets fixture events (goals, cards, etc)
 */
export async function getFixtureEvents(fixtureId: number) {
  return fetchFromApi({
    endpoint: `fixtures/events`,
    params: { fixture: fixtureId },
    cacheDuration: 60 * 1000 // 1 minute for events
  });
}

/**
 * Gets fixture lineups
 */
export async function getFixtureLineups(fixtureId: number) {
  return fetchFromApi({
    endpoint: `fixtures/lineups`,
    params: { fixture: fixtureId }
  });
}

/**
 * Gets fixture predictions
 */
export async function getFixturePredictions(fixtureId: number) {
  return fetchFromApi({
    endpoint: `predictions`,
    params: { fixture: fixtureId }
  });
}

/**
 * Gets head-to-head fixtures between two teams
 */
export async function getHeadToHead(teamId1: number, teamId2: number) {
  return fetchFromApi({
    endpoint: `fixtures/headtohead`,
    params: { h2h: `${teamId1}-${teamId2}` }
  });
}

/**
 * League IDs for popular leagues
 */
export const LEAGUE_IDS = {
  THAI_LEAGUE: 290,
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2
};

/**
 * Current season
 */
export const CURRENT_SEASON = 2024;
