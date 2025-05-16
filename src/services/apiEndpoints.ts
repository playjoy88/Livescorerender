/**
 * API Endpoints Reference for API-Football v3
 * Based on official documentation: https://www.api-football.com/documentation-v3
 * 
 * This file contains all endpoints available in the API-SPORTS Football API
 * Used to standardize endpoint access across the application
 */

// Export the ApiOptions interface explicitly to match what's expected in api.ts
export interface ApiOptions {
    endpoint: string;
    params?: Record<string, string | number>;
    cacheDuration?: number;
}

// Base and status endpoints
export const ENDPOINTS = {
    // Status & Core endpoints
    STATUS: 'status',
    TIMEZONE: 'timezone',

    // Countries, Leagues & Seasons
    COUNTRIES: 'countries',
    LEAGUES: 'leagues',
    SEASONS: 'leagues/seasons',

    // Teams
    TEAMS: 'teams',
    TEAM_STATISTICS: 'teams/statistics',
    TEAM_SEASONS: 'teams/seasons',
    TEAM_COUNTRIES: 'teams/countries',

    // Venues
    VENUES: 'venues',

    // Fixtures & Events
    FIXTURES: 'fixtures',
    FIXTURES_ROUNDS: 'fixtures/rounds',
    HEAD_TO_HEAD: 'fixtures/headtohead',

    // Standings
    STANDINGS: 'standings',

    // Players
    PLAYERS: 'players',
    PLAYERS_SEASONS: 'players/seasons',
    PLAYERS_SQUADS: 'players/squads',
    TOP_SCORERS: 'players/topscorers',
    TOP_ASSISTS: 'players/topassists',
    TOP_YELLOW_CARDS: 'players/topyellowcards',
    TOP_RED_CARDS: 'players/topredcards',

    // Transfers
    TRANSFERS: 'transfers',

    // Trophies
    TROPHIES: 'trophies',

    // Sidelined
    SIDELINED: 'sidelined',

    // Predictions
    PREDICTIONS: 'predictions',

    // Odds
    ODDS: 'odds',
    ODDS_LIVE: 'odds/live',
    ODDS_MAPPING: 'odds/mapping',
    ODDS_BOOKMAKERS: 'odds/bookmakers',
    ODDS_BETS: 'odds/bets',

    // Injuries
    INJURIES: 'injuries',

    // Coach
    COACH: 'coachs',
    COACH_TROPHIES: 'coachs/trophies',
    COACH_SIDELINES: 'coachs/sidelines',
};

// Fixture-related endpoints
export const FIXTURE_ENDPOINTS = {
    STATISTICS: 'fixtures/statistics',
    EVENTS: 'fixtures/events',
    LINEUPS: 'fixtures/lineups',
    PLAYERS: 'fixtures/players',
    HEAD_TO_HEAD: 'fixtures/headtohead',
};

// Types for parameters
export interface FixturesParams {
    live?: string | number;
    date?: string;
    league?: number;
    season?: number;
    team?: number;
    ids?: string;
    round?: string;
    status?: string;
    venue?: number;
    timezone?: string;
    from?: string;
    to?: string;
}

/**
 * Helper function to get endpoint with parameters for fixtures
 * @param {FixturesParams} params - Parameters object
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getFixturesEndpoint(params?: FixturesParams): ApiOptions {
    const queryParams: Record<string, string | number> = {};

    // Add parameters if they exist
    if (params) {
        if (params.live) queryParams.live = params.live;
        if (params.date) queryParams.date = params.date;
        if (params.league) queryParams.league = params.league;
        if (params.season) queryParams.season = params.season;
        if (params.team) queryParams.team = params.team;
        if (params.ids) queryParams.ids = params.ids;
        if (params.round) queryParams.round = params.round;
        if (params.status) queryParams.status = params.status;
        if (params.venue) queryParams.venue = params.venue;
        if (params.timezone) queryParams.timezone = params.timezone;
        if (params.from) queryParams.from = params.from;
        if (params.to) queryParams.to = params.to;
    }

    return {
        endpoint: ENDPOINTS.FIXTURES,
        params: queryParams
    };
}

/**
 * Helper function to get endpoint for standings
 * @param {number} league - League ID
 * @param {number} season - Season year
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getStandingsEndpoint(league: number, season: number): ApiOptions {
    return {
        endpoint: ENDPOINTS.STANDINGS,
        params: {
            league,
            season
        }
    };
}

/**
 * Helper function for fixture statistics
 * @param {number} fixtureId - Fixture ID
 * @param {string|number} team - Optional team parameter
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getFixtureStatisticsEndpoint(fixtureId: number, team?: string | number): ApiOptions {
    const params: Record<string, string | number> = { fixture: fixtureId };
    if (team) params.team = team;

    return {
        endpoint: FIXTURE_ENDPOINTS.STATISTICS,
        params
    };
}

/**
 * Helper function for fixture events
 * @param {number} fixtureId - Fixture ID
 * @param {string|number} team - Optional team parameter
 * @param {string|number} player - Optional player parameter
 * @param {string} type - Optional event type parameter
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getFixtureEventsEndpoint(
    fixtureId: number, 
    team?: string | number, 
    player?: string | number, 
    type?: string
): ApiOptions {
    const params: Record<string, string | number> = { fixture: fixtureId };
    if (team) params.team = team;
    if (player) params.player = player;
    if (type) params.type = type;

    return {
        endpoint: FIXTURE_ENDPOINTS.EVENTS,
        params
    };
}

/**
 * Helper function for fixture lineups
 * @param {number} fixtureId - Fixture ID
 * @param {string|number} team - Optional team parameter
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getFixtureLineupsEndpoint(fixtureId: number, team?: string | number): ApiOptions {
    const params: Record<string, string | number> = { fixture: fixtureId };
    if (team) params.team = team;

    return {
        endpoint: FIXTURE_ENDPOINTS.LINEUPS,
        params
    };
}

/**
 * Helper function for fixture players statistics
 * @param {number} fixtureId - Fixture ID
 * @param {string|number} team - Optional team parameter
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getFixturePlayersEndpoint(fixtureId: number, team?: string | number): ApiOptions {
    const params: Record<string, string | number> = { fixture: fixtureId };
    if (team) params.team = team;

    return {
        endpoint: FIXTURE_ENDPOINTS.PLAYERS,
        params
    };
}

export interface HeadToHeadParams {
    team1: number;
    team2: number;
    date?: string;
    status?: string;
    league?: number;
    season?: number;
}

/**
 * Helper function for head-to-head matches
 * @param {number} team1 - First team ID
 * @param {number} team2 - Second team ID
 * @param {string} date - Optional date parameter
 * @param {string} status - Optional status parameter
 * @param {number} league - Optional league parameter
 * @param {number} season - Optional season parameter
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getHeadToHeadEndpoint(
    team1: number, 
    team2: number, 
    date?: string, 
    status?: string, 
    league?: number, 
    season?: number
): ApiOptions {
    const params: Record<string, string | number> = { h2h: `${team1}-${team2}` };

    if (date) params.date = date;
    if (status) params.status = status;
    if (league) params.league = league;
    if (season) params.season = season;

    return {
        endpoint: FIXTURE_ENDPOINTS.HEAD_TO_HEAD,
        params
    };
}

export interface LeaguesParams {
    id?: number;
    name?: string;
    country?: string;
    code?: string;
    season?: number;
    team?: number;
    current?: boolean;
    search?: string;
    type?: string;
}

/**
 * Helper function for league data
 * @param {LeaguesParams} params - Parameters object
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getLeaguesEndpoint(params?: LeaguesParams): ApiOptions {
    const queryParams: Record<string, string | number> = {};

    if (params) {
        if (params.id) queryParams.id = params.id;
        if (params.name) queryParams.name = params.name;
        if (params.country) queryParams.country = params.country;
        if (params.code) queryParams.code = params.code;
        if (params.season) queryParams.season = params.season;
        if (params.team) queryParams.team = params.team;
        if (params.current !== undefined) queryParams.current = params.current ? 1 : 0;
        if (params.search) queryParams.search = params.search;
        if (params.type) queryParams.type = params.type;
    }

    return {
        endpoint: ENDPOINTS.LEAGUES,
        params: queryParams
    };
}

export interface TeamsParams {
    id?: number;
    name?: string;
    league?: number;
    season?: number;
    country?: string;
    code?: string;
    search?: string;
}

/**
 * Helper function for team data
 * @param {TeamsParams} params - Parameters object
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getTeamsEndpoint(params?: TeamsParams): ApiOptions {
    const queryParams: Record<string, string | number> = {};

    if (params) {
        if (params.id) queryParams.id = params.id;
        if (params.name) queryParams.name = params.name;
        if (params.league) queryParams.league = params.league;
        if (params.season) queryParams.season = params.season;
        if (params.country) queryParams.country = params.country;
        if (params.code) queryParams.code = params.code;
        if (params.search) queryParams.search = params.search;
    }

    return {
        endpoint: ENDPOINTS.TEAMS,
        params: queryParams
    };
}

export interface PlayersParams {
    id?: number;
    name?: string;
    team?: number;
    league?: number;
    season?: number;
    search?: string;
    page?: number;
}

/**
 * Helper function for player data
 * @param {PlayersParams} params - Parameters object
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getPlayersEndpoint(params?: PlayersParams): ApiOptions {
    const queryParams: Record<string, string | number> = {};

    if (params) {
        if (params.id) queryParams.id = params.id;
        if (params.name) queryParams.name = params.name;
        if (params.team) queryParams.team = params.team;
        if (params.league) queryParams.league = params.league;
        if (params.season) queryParams.season = params.season;
        if (params.search) queryParams.search = params.search;
        if (params.page) queryParams.page = params.page;
    }

    return {
        endpoint: ENDPOINTS.PLAYERS,
        params: queryParams
    };
}

/**
 * Helper function for predictions data
 * @param {number} fixtureId - Fixture ID
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getPredictionsEndpoint(fixtureId: number): ApiOptions {
    return {
        endpoint: ENDPOINTS.PREDICTIONS,
        params: {
            fixture: fixtureId
        }
    };
}

export interface OddsParams {
    fixture?: number;
    league?: number;
    season?: number;
    date?: string;
    timezone?: string;
    page?: number;
    bookmaker?: number;
    bet?: number;
}

/**
 * Helper function for odds data
 * @param {OddsParams} params - Parameters object
 * @returns {ApiOptions} Endpoint configuration object
 */
export function getOddsEndpoint(params?: OddsParams): ApiOptions {
    const queryParams: Record<string, string | number> = {};

    if (params) {
        if (params.fixture) queryParams.fixture = params.fixture;
        if (params.league) queryParams.league = params.league;
        if (params.season) queryParams.season = params.season;
        if (params.date) queryParams.date = params.date;
        if (params.timezone) queryParams.timezone = params.timezone;
        if (params.page) queryParams.page = params.page;
        if (params.bookmaker) queryParams.bookmaker = params.bookmaker;
        if (params.bet) queryParams.bet = params.bet;
    }

    return {
        endpoint: ENDPOINTS.ODDS,
        params: queryParams
    };
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

/**
 * Fixture statuses
 */
export const FIXTURE_STATUSES = {
    SCHEDULED: 'TBD',
    NOT_STARTED: 'NS',
    FIRST_HALF: '1H',
    HALFTIME: 'HT',
    SECOND_HALF: '2H',
    EXTRA_TIME: 'ET',
    BREAK_TIME: 'BT',
    PENALTY: 'P',
    SUSPENDED: 'SUSP',
    INTERRUPTED: 'INT',
    FINISHED: 'FT',
    FINISHED_AFTER_EXTRA_TIME: 'AET',
    FINISHED_AFTER_PENALTIES: 'PEN',
    POSTPONED: 'PST',
    CANCELLED: 'CANC',
    ABANDONED: 'ABD',
    TECHNICAL_LOSS: 'AWD',
    WALKOVER: 'WO',
    LIVE: 'LIVE'
};
