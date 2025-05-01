/**
 * API Service for Playjoy Livescore
 * Handles all requests to the football API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-football-v1.p.rapidapi.com/v3';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'api-football-v1.p.rapidapi.com';

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
  
  const url = `${API_URL}/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  // Check cache first
  const cacheKey = url;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < cacheDuration) {
    console.log(`Using cached data for: ${url}`);
    return cache[cacheKey].data;
  }
  
  // Make the API request
  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });
    
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
