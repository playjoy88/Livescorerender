# API Settings Table Guide

This guide explains how to implement the API settings table in your Supabase database for the Playjoy LiveScore application. This table stores configuration for the football data API used by the application.

## Overview

The `api_settings` table stores configuration settings for the football data API used by the application, including:

- API key and host information
- Configuration for caching and request limits
- API version settings
- Enabled/disabled endpoints
- Debug and proxy settings

This allows administrators to manage API configuration through the admin interface rather than hardcoding values.

## Table Schema

The table has the following structure:

| Column             | Type                      | Description                                           |
|--------------------|---------------------------|-------------------------------------------------------|
| id                 | UUID                      | Primary key                                           |
| api_key            | TEXT                      | API key for authentication                            |
| api_host           | VARCHAR(255)              | API host domain                                       |
| api_version        | VARCHAR(10)               | API version (e.g., 'v3')                              |
| cache_timeout      | INTEGER                   | Cache timeout in minutes                              |
| request_limit      | INTEGER                   | Daily request limit                                   |
| polling_interval   | INTEGER                   | Polling interval in seconds                           |
| proxy_enabled      | BOOLEAN                   | Whether API proxy is enabled                          |
| debug_mode         | BOOLEAN                   | Whether debug mode is enabled                         |
| endpoints          | JSONB                     | Configuration for enabled/disabled endpoints          |
| created_at         | TIMESTAMP WITH TIME ZONE  | Creation timestamp                                    |
| updated_at         | TIMESTAMP WITH TIME ZONE  | Last update timestamp                                 |

## Implementation Steps

### 1. Create the Table in Supabase

Run the SQL script in the Supabase SQL Editor:

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the `api_settings_table.sql` file
4. Run the SQL script

The script will:
- Create the table if it doesn't exist
- Set up appropriate indexes and triggers
- Configure Row-Level Security (RLS) policies
- Insert default settings

### 2. Update TypeScript Types

The TypeScript types in `src/types/supabase.ts` have already been updated to include the `api_settings` table definition. This allows TypeScript to provide type safety when interacting with the table.

### 3. Using the API Settings Service

The application includes an `apiSettingsService` that provides methods for interacting with the API settings table:

```typescript
import apiSettingsService from '../services/apiSettingsService';

// Get current settings
const settings = await apiSettingsService.getSettings();

// Update settings
await apiSettingsService.updateSettings(id, {
  api_key: 'new-api-key',
  cache_timeout: 10
});

// Test connection
const result = await apiSettingsService.testConnection();
```

## Security Considerations

- The API key is sensitive information. The table is protected by Row-Level Security (RLS).
- Only authenticated users can read the API settings.
- Only users with the 'admin' role can update the API settings.
- The API key should never be exposed to client-side code. Always use the server-side proxy for API calls.

## Admin Interface

The admin interface at `/admin/settings/api` provides a user-friendly way to manage the API settings. It allows administrators to:

- View and update API credentials
- Configure caching and polling intervals
- Enable/disable specific API endpoints
- Configure proxy and debug settings
- Test the API connection

## Troubleshooting

If you encounter issues with the API settings:

1. Check the browser console for error messages
2. Verify that the Supabase connection is properly configured in `.env.local`
3. Ensure that the RLS policies are correctly set up
4. Try testing the API connection through the admin interface
5. Check the Supabase logs for any database errors

## Extending the API Settings

To add new settings to the `api_settings` table:

1. Modify the SQL schema in `api_settings_table.sql`
2. Update the TypeScript types in `src/types/supabase.ts`
3. Update the service methods in `src/services/apiSettingsService.ts`
4. Update the admin interface in `src/app/admin/settings/api/page.tsx`
