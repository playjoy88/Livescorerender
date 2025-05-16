# Fixie Proxy Integration Summary

This document provides a comprehensive overview of how the Fixie proxy is integrated throughout the LiveScore application to bypass IP restrictions with API-Football.

## Proxy Implementation Architecture

The LiveScore application uses a multilayer approach to ensure all API requests go through the Fixie proxy:

### 1. API Proxy Route (`/api/proxy/route.ts`)

This is the central component of the proxy architecture:

- Acts as a server-side proxy between the client and the API-Football service
- Automatically configures the Fixie proxy for all outgoing API requests
- Sets the `HTTP_PROXY` and `HTTPS_PROXY` environment variables to route traffic through Fixie
- Handles API authentication by adding the required API keys to requests
- Maintains a clean interface for client-side code (hides implementation details)

```javascript
// Proxy configuration from /api/proxy/route.ts
// Get Fixie proxy URL from environment variables
const fixieUrl = process.env.FIXIE_URL || 'http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80';

// Parse the Fixie URL for proxy configuration
const fixieUrlParts = new URL(fixieUrl);
const fixieAuth = fixieUrlParts.username && fixieUrlParts.password 
    ? `${fixieUrlParts.username}:${fixieUrlParts.password}`
    : 'fixie:L56rcsBn8mulaUC';

// Set proxy environment variables
process.env.HTTP_PROXY = `http://${fixieAuth}@${fixieUrlParts.host}:${fixieUrlParts.port || '80'}`;
process.env.HTTPS_PROXY = process.env.HTTP_PROXY;
```

### 2. API Client (`/services/api.ts`)

- Uses the `/api/proxy` endpoint for all API requests
- Provides a clean API for other components
- Manages caching and additional request parameters
- Ensures all API calls go through the proxy without client code needing to know

### 3. API Settings (`/app/api/admin/api-settings/route.ts`)

- Provides admin functionality to test and configure API settings
- Uses the same Fixie proxy configuration as the main API proxy
- Enables administrators to test API connections directly from the admin panel

### 4. Database Configuration

- Database is configured to always use Supabase connections with `ENABLE_DB_CONNECTIONS=true`
- Mock data is explicitly disabled with `useMockDataWhenUnavailable=false`
- All API settings are stored in Supabase and retrieved for API requests

## Testing the Fixie Proxy Integration

The system includes several ways to test the Fixie proxy integration:

### 1. Fixie Test Page (`/public/fixie-test.html`)

A dedicated page that:
- Tests the API connection through the Fixie proxy
- Shows proxy connection status
- Provides detailed information about how the proxy works
- Helps diagnose any potential issues with the proxy

### 2. Admin API Test Page (`/admin/settings/api`)

- Admin interface to test API connection
- Shows detailed connection information
- Uses the "ทดสอบการเชื่อมต่อ" (Test Connection) button to verify API settings

### 3. API Debug Page (`/api-debug`)

- Tests specific API endpoints through the Fixie proxy
- Shows detailed API responses
- Useful for developers to verify endpoint functionality

## Deployment Configuration

For successful deployment to Vercel, the following environment variables are required:

### Fixie Configuration

```
FIXIE_URL=http://fixie:L56rcsBn8mulaUC@criterium.usefixie.com:80
```

### API Football Configuration

```
API_KEY=311ca0120aa14feefaef14e768723481
API_HOST=v3.football.api-sports.io
API_VERSION=v3
```

### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://prantrwypqcqxvmvpulj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYW50cnd5cHFjcXh2bXZwdWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTg0MTUsImV4cCI6MjA2MTg3NDQxNX0.M8YmCjr6NKUGJcpbmNJHp4gG_1jpZfWnRQTGOsDhqh0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYW50cnd5cHFjcXh2bXZwdWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI5ODQxNSwiZXhwIjoyMDYxODc0NDE1fQ.3utsTV8srvZhSXsWF4-d9Q753Wc5gcZKvTggA91T5dw
```

### Database Configuration

```
NEXT_PUBLIC_ENABLE_DB=true
NEXT_PUBLIC_REQUIRE_DB=true
```

## Request Flow Diagram

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐      ┌───────────────┐      ┌───────────────┐
│             │      │             │      │              │      │               │      │               │
│  Client     │──1──▶│  Next.js    │──2──▶│  API Proxy   │──3──▶│  Fixie Proxy  │──4──▶│  API-Football │
│  Browser    │      │  Server     │      │  Route       │      │  Service      │      │  API Service  │
│             │      │             │      │              │      │               │      │               │
└─────────────┘      └─────────────┘      └──────────────┘      └───────────────┘      └───────────────┘
                            │                     ▲
                            │                     │
                            ▼                     │
                     ┌─────────────┐      ┌──────────────┐
                     │             │      │              │
                     │  Supabase   │──5──▶│ API Settings │
                     │  Database   │      │ Service      │
                     │             │      │              │
                     └─────────────┘      └──────────────┘
```

**Flow Explanation:**
1. Client makes a request to the Next.js server
2. Next.js routes the request to the API Proxy
3. API Proxy configures and routes the request through Fixie Proxy
4. Fixie Proxy forwards the request to API-Football from a whitelisted IP
5. API settings are retrieved from Supabase to configure the request

## Troubleshooting

If API requests are failing:

1. Check if the Fixie proxy is properly configured in environment variables
2. Verify that the API keys are correct and not expired
3. Use the `/fixie-test.html` page to test the proxy connection
4. Check the admin settings page to verify the API configuration
5. Ensure the Supabase database connection is working

With this implementation, all API requests from the LiveScore application will be routed through the Fixie proxy, allowing the application to bypass IP restrictions with the API-Football service.
