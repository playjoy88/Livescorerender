/**
 * API Service for Playjoy Livescore
 * Handles all requests to the football API
 */

// Always use the server-side proxy to avoid IP whitelisting issues
// The proxy handles the API key and host headers and routes requests through Fixie proxy
// This ensures all API requests come from whitelisted Fixie IPs, not the server's actual IP
const API_URL = '/api/proxy'; // Server-side proxy handles API keys and proxy routing

import apiSettingsService from './apiSettingsService';

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
// Default cache duration (will be overridden by settings from API if available)
let CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Load cache settings from API
(async () => {
  try {
    const settings = await apiSettingsService.getSettings();
    if (settings) {
      // Convert cache timeout from minutes to milliseconds
      CACHE_DURATION = (settings.cache_timeout || 5) * 60 * 1000;
      console.log(`API cache timeout set to ${settings.cache_timeout} minutes`);
    }
  } catch (error) {
    console.error('Failed to load API settings for cache:', error);
  }
})();

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
  
  // Pass endpoint as a query parameter to the proxy
  queryParams.append('endpoint', endpoint);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  // Build the full URL - use our proxy endpoint
  const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  // Check cache first
  const cacheKey = url;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < cacheDuration) {
    console.log(`Using cached data for: ${url}`);
    return cache[cacheKey].data;
  }
  
  // Make the API request through our proxy
  try {
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
    endpoint: 'fixtures/statistics',
    params: { fixture: fixtureId }
  });
}

/**
 * Gets fixture events (goals, cards, etc)
 */
export async function getFixtureEvents(fixtureId: number) {
  return fetchFromApi({
    endpoint: 'fixtures/events',
    params: { fixture: fixtureId },
    cacheDuration: 60 * 1000 // 1 minute for events
  });
}

/**
 * Gets fixture lineups
 */
export async function getFixtureLineups(fixtureId: number) {
  return fetchFromApi({
    endpoint: 'fixtures/lineups',
    params: { fixture: fixtureId }
  });
}

/**
 * Gets fixture predictions
 */
export async function getFixturePredictions(fixtureId: number) {
  return fetchFromApi({
    endpoint: 'predictions',
    params: { fixture: fixtureId }
  });
}

/**
 * Gets head-to-head fixtures between two teams
 */
export async function getHeadToHead(teamId1: number, teamId2: number) {
  return fetchFromApi({
    endpoint: 'fixtures/headtohead',
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
