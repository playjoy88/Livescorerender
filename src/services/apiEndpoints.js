/**
 * API Endpoints Reference for API-Football v3
 * Based on official documentation: https://www.api-football.com/documentation-v3
 * 
 * This file contains all endpoints available in the API-SPORTS Football API
 * Used to standardize endpoint access across the application
 */

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

/**
 * Helper function to get endpoint with parameters for fixtures
 * @param {Object} params - Parameters object
 * @returns {Object} Endpoint configuration object
 */
export function getFixturesEndpoint(params) {
    const { live, date, league, season, team, ids, round, status, venue, timezone, from, to } = params || {};

    let queryParams = {};

    // Add parameters if they exist
    if (live) queryParams.live = live;
    if (date) queryParams.date = date;
    if (league) queryParams.league = league;
    if (season) queryParams.season = season;
    if (team) queryParams.team = team;
    if (ids) queryParams.ids = ids;
    if (round) queryParams.round = round;
    if (status) queryParams.status = status;
    if (venue) queryParams.venue = venue;
    if (timezone) queryParams.timezone = timezone;
    if (from) queryParams.from = from;
    if (to) queryParams.to = to;

    return {
        endpoint: ENDPOINTS.FIXTURES,
        params: queryParams
    };
}

/**
 * Helper function to get endpoint for standings
 * @param {number} league - League ID
 * @param {number} season - Season year
 * @returns {Object} Endpoint configuration object
 */
export function getStandingsEndpoint(league, season) {
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
 * @param {string} team - Optional team parameter
 * @returns {Object} Endpoint configuration object
 */
export function getFixtureStatisticsEndpoint(fixtureId, team) {
    const params = { fixture: fixtureId };
    if (team) params.team = team;

    return {
        endpoint: FIXTURE_ENDPOINTS.STATISTICS,
        params
    };
}

/**
 * Helper function for fixture events
 * @param {number} fixtureId - Fixture ID
 * @param {string} team - Optional team parameter
 * @param {string} player - Optional player parameter
 * @param {string} type - Optional event type parameter
 * @returns {Object} Endpoint configuration object
 */
export function getFixtureEventsEndpoint(fixtureId, team, player, type) {
    const params = { fixture: fixtureId };
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
 * @param {string} team - Optional team parameter
 * @returns {Object} Endpoint configuration object
 */
export function getFixtureLineupsEndpoint(fixtureId, team) {
    const params = { fixture: fixtureId };
    if (team) params.team = team;

    return {
        endpoint: FIXTURE_ENDPOINTS.LINEUPS,
        params
    };
}

/**
 * Helper function for fixture players statistics
 * @param {number} fixtureId - Fixture ID
 * @param {string} team - Optional team parameter
 * @returns {Object} Endpoint configuration object
 */
export function getFixturePlayersEndpoint(fixtureId, team) {
    const params = { fixture: fixtureId };
    if (team) params.team = team;

    return {
        endpoint: FIXTURE_ENDPOINTS.PLAYERS,
        params
    };
}

/**
 * Helper function for head-to-head matches
 * @param {number} team1 - First team ID
 * @param {number} team2 - Second team ID
 * @param {number} date - Optional date parameter
 * @param {number} status - Optional status parameter
 * @param {number} league - Optional league parameter
 * @param {number} season - Optional season parameter
 * @returns {Object} Endpoint configuration object
 */
export function getHeadToHeadEndpoint(team1, team2, date, status, league, season) {
    const params = { h2h: `${team1}-${team2}` };

    if (date) params.date = date;
    if (status) params.status = status;
    if (league) params.league = league;
    if (season) params.season = season;

    return {
        endpoint: FIXTURE_ENDPOINTS.HEAD_TO_HEAD,
        params
    };
}

/**
 * Helper function for league data
 * @param {Object} params - Parameters object
 * @returns {Object} Endpoint configuration object
 */
export function getLeaguesEndpoint(params) {
    const { id, name, country, code, season, team, current, search, type } = params || {};

    let queryParams = {};

    if (id) queryParams.id = id;
    if (name) queryParams.name = name;
    if (country) queryParams.country = country;
    if (code) queryParams.code = code;
    if (season) queryParams.season = season;
    if (team) queryParams.team = team;
    if (current !== undefined) queryParams.current = current;
    if (search) queryParams.search = search;
    if (type) queryParams.type = type;

    return {
        endpoint: ENDPOINTS.LEAGUES,
        params: queryParams
    };
}

/**
 * Helper function for team data
 * @param {Object} params - Parameters object
 * @returns {Object} Endpoint configuration object
 */
export function getTeamsEndpoint(params) {
    const { id, name, league, season, country, code, search } = params || {};

    let queryParams = {};

    if (id) queryParams.id = id;
    if (name) queryParams.name = name;
    if (league) queryParams.league = league;
    if (season) queryParams.season = season;
    if (country) queryParams.country = country;
    if (code) queryParams.code = code;
    if (search) queryParams.search = search;

    return {
        endpoint: ENDPOINTS.TEAMS,
        params: queryParams
    };
}

/**
 * Helper function for player data
 * @param {Object} params - Parameters object
 * @returns {Object} Endpoint configuration object
 */
export function getPlayersEndpoint(params) {
    const { id, name, team, league, season, search, page } = params || {};

    let queryParams = {};

    if (id) queryParams.id = id;
    if (name) queryParams.name = name;
    if (team) queryParams.team = team;
    if (league) queryParams.league = league;
    if (season) queryParams.season = season;
    if (search) queryParams.search = search;
    if (page) queryParams.page = page;

    return {
        endpoint: ENDPOINTS.PLAYERS,
        params: queryParams
    };
}

/**
 * Helper function for predictions data
 * @param {number} fixtureId - Fixture ID
 * @returns {Object} Endpoint configuration object
 */
export function getPredictionsEndpoint(fixtureId) {
    return {
        endpoint: ENDPOINTS.PREDICTIONS,
        params: {
            fixture: fixtureId
        }
    };
}

/**
 * Helper function for odds data
 * @param {Object} params - Parameters object
 * @returns {Object} Endpoint configuration object
 */
export function getOddsEndpoint(params) {
    const { fixture, league, season, date, timezone, page, bookmaker, bet } = params || {};

    let queryParams = {};

    if (fixture) queryParams.fixture = fixture;
    if (league) queryParams.league = league;
    if (season) queryParams.season = season;
    if (date) queryParams.date = date;
    if (timezone) queryParams.timezone = timezone;
    if (page) queryParams.page = page;
    if (bookmaker) queryParams.bookmaker = bookmaker;
    if (bet) queryParams.bet = bet;

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