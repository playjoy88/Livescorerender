# API Endpoints Guide for Playjoy Livescore

This document provides a comprehensive guide to the football API endpoints used in Playjoy Livescore, based on the official [API-Football documentation](https://www.api-football.com/documentation-v3).

## Overview

Playjoy Livescore integrates with the API-SPORTS Football API to provide real-time match data, statistics, and other football information. All API interactions have been standardized through the `apiEndpoints.js` module, which provides consistent endpoint definitions and helper functions.

## Core Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Status** | `status` | Check API status and account information |
| **Timezone** | `timezone` | Get list of available timezones |
| **Countries** | `countries` | Get list of available countries |
| **Leagues** | `leagues` | Get list of available leagues/cups |
| **Seasons** | `leagues/seasons` | Get available seasons |

## Fixtures & Matches

| Endpoint | Description | Key Parameters |
|----------|-------------|----------------|
| `fixtures` | Get fixtures (matches) | `date`, `league`, `season`, `team`, `live` |
| `fixtures/rounds` | Get all rounds for a league | `league`, `season` |
| `fixtures/headtohead` | Get head to head matches | `h2h` (format: `teamId1-teamId2`) |
| `fixtures/statistics` | Get statistics for a fixture | `fixture`, `team` |
| `fixtures/events` | Get events for a fixture | `fixture`, `team`, `player`, `type` |
| `fixtures/lineups` | Get lineups for a fixture | `fixture`, `team` |
| `fixtures/players` | Get players statistics | `fixture`, `team` |

## Teams & Players

| Endpoint | Description | Key Parameters |
|----------|-------------|----------------|
| `teams` | Get team information | `id`, `name`, `league`, `season` |
| `teams/statistics` | Get statistics for a team | `team`, `league`, `season` |
| `teams/seasons` | Get available seasons for a team | `team` |
| `players` | Get player information | `id`, `team`, `league`, `season` |
| `players/squads` | Get player squads | `team` |
| `players/topscorers` | Get top scorers | `league`, `season` |
| `players/topassists` | Get top assists | `league`, `season` |

## Standings & Results

| Endpoint | Description | Key Parameters |
|----------|-------------|----------------|
| `standings` | Get standings for a league | `league`, `season` |
| `predictions` | Get predictions for a fixture | `fixture` |

## Advanced Features

| Endpoint | Description | Key Parameters |
|----------|-------------|----------------|
| `odds` | Get odds for fixtures | `fixture`, `league`, `date` |
| `odds/live` | Get live odds | `fixture` |
| `transfers` | Get transfer information | `player`, `team` |
| `trophies` | Get trophy information | `player`, `coach` |
| `injuries` | Get injuries for fixtures | `fixture`, `league`, `season` |

## Using the Helper Functions

The `apiEndpoints.js` module provides helper functions that simplify API calls:

```javascript
// Example 1: Get fixtures for today
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const todayOptions = apiEndpoints.getFixturesEndpoint({ date: today });
const todayMatches = await fetchFromApi(todayOptions);

// Example 2: Get standings for a league
const standingsOptions = apiEndpoints.getStandingsEndpoint(
  apiEndpoints.LEAGUE_IDS.THAI_LEAGUE, 
  apiEndpoints.CURRENT_SEASON
);
const standings = await fetchFromApi(standingsOptions);

// Example 3: Get head-to-head matches
const h2hOptions = apiEndpoints.getHeadToHeadEndpoint(33, 42); // team IDs
const h2hMatches = await fetchFromApi(h2hOptions);
```

## Common Parameters

Most API endpoints support these common parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `league` | League ID | `39` (Premier League) |
| `season` | Season year | `2024` |
| `team` | Team ID | `33` (Manchester United) |
| `fixture` | Fixture/match ID | `1234567` |
| `date` | Date in YYYY-MM-DD format | `2025-05-01` |
| `timezone` | Timezone string | `Asia/Bangkok` |

## Important League IDs

The `LEAGUE_IDS` constant provides IDs for popular leagues:

| League | ID |
|--------|-----|
| Thai League | 290 |
| Premier League | 39 |
| La Liga | 140 |
| Bundesliga | 78 |
| Serie A | 135 |
| Ligue 1 | 61 |
| Champions League | 2 |

## Match Status Codes

The `FIXTURE_STATUSES` object contains all possible match status codes:

| Status | Code | Description |
|--------|------|-------------|
| Scheduled | `TBD` | Match is scheduled but time is TBD |
| Not Started | `NS` | Match not started yet |
| First Half | `1H` | Match in first half |
| Halftime | `HT` | Halftime break |
| Second Half | `2H` | Match in second half |
| Finished | `FT` | Match finished |
| Extra Time | `ET` | Extra time |
| Penalties | `P` | Penalty shootout |
| Postponed | `PST` | Match postponed |
| Cancelled | `CANC` | Match cancelled |
| Live | `LIVE` | Match is currently live |

## Implemented API Improvements

To ensure reliable API communication, the following improvements have been made:

1. **Server-Side API Proxy**:
   - Created a secure proxy that handles API requests server-side in production
   - Keeps API key secure and not exposed in client-side code
   - Provides detailed logging and error handling

2. **Standardized Endpoint Definitions**:
   - Created a central `apiEndpoints.js` module with all endpoint definitions
   - Implemented helper functions for common API requests
   - Added comprehensive parameter validation

3. **Smart Error Handling**:
   - Implemented fallback mechanisms when endpoints return errors
   - Added detailed error logging for debugging
   - Created graceful degradation for API outages

4. **API Debug Tools**:
   - Added an API debug page at `/api-debug` for testing API connections
   - Implemented interactive testing for different endpoints
   - Provides detailed error reporting and suggestions

## Best Practices

1. **Always use the helper functions** from `apiEndpoints.js` instead of hardcoding endpoint paths
2. **Cache API responses** when appropriate to reduce API calls
3. **Handle errors gracefully** with appropriate user feedback
4. **Use the debug page** when troubleshooting API issues
5. **Include proper error messages** in your UI for API failures

---

For more detailed information about the API, refer to the [official API-Football documentation](https://www.api-football.com/documentation-v3).
