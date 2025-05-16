# PostgreSQL Connection Guide

This guide explains how the application connects to Supabase PostgreSQL for database operations in both development and production environments.

## Connection Flow

1. **Environment Variables**: The connection is established using environment variables defined in `.env.local` or set in Vercel's environment configuration.

2. **Database Connection Initialization**: When the application starts, `src/services/vercelDb.ts` initializes the connection using `@vercel/postgres`.

3. **Connection Verification**: A test query is executed to verify the connection is working properly.

## Environment Variables

The following environment variables in `.env.local` are used for PostgreSQL connectivity:

```env
# Database URLs for Supabase PostgreSQL
POSTGRES_URL="postgres://[username]:[password]@[host]:[port]/[database]?sslmode=require&supa=base-pooler.x"
POSTGRES_PRISMA_URL="postgres://[username]:[password]@[host]:[port]/[database]?sslmode=require&supa=base-pooler.x"
POSTGRES_URL_NON_POOLING="postgres://[username]:[password]@[host]:[port]/[database]?sslmode=require"
POSTGRES_HOST="[hostname]"
POSTGRES_USER="[username]"
POSTGRES_PASSWORD="[password]"
POSTGRES_DATABASE="[database]"

# Force production mode to ensure the real database is used
NODE_ENV="production"
```

## How Vercel Uses These Variables

1. **Loading Environment Variables**: When deployed to Vercel, the platform loads these environment variables from your project settings. In development, they're loaded from `.env.local`.

2. **@vercel/postgres Integration**: The `@vercel/postgres` package automatically uses `POSTGRES_URL` or falls back to `POSTGRES_URL_NON_POOLING`.

3. **Connection Pooling**: In production, Vercel uses connection pooling for better performance. This is configured via the connection string with `pooler.supabase.com` endpoints.

## Manual Testing Connection

You can test the database connection by running:

```javascript
import { sql } from '@vercel/postgres';

async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}
```

## Troubleshooting Connection Issues

If you encounter connection issues:

1. **Verify Environment Variables**: Ensure all PostgreSQL environment variables are correctly set. On Vercel, check your project's environment variables in Settings.

2. **Check Network Access**: Ensure your Supabase database allows connections from:
   - Your local IP during development
   - Vercel's IP ranges in production (Supabase usually allows this by default)

3. **SSL Requirements**: The connection strings include `sslmode=require` which requires SSL. Make sure SSL is enabled on your database.

4. **Debugging Connection**: Enable more detailed logging by adding `console.log` statements in the `initPostgresConnection` function.

## Our Implementation

In our codebase:

1. The database connection is initialized in `src/services/vercelDb.ts`
2. We use `@vercel/postgres` which simplifies handling PostgreSQL with Vercel
3. We've added detailed logging and error handling
4. We use the `ENV_NODE` environment variable to force production mode which ensures the real database is used

## Setting Up in a New Environment

When deploying to a new environment:

1. Set up the PostgreSQL environment variables in Vercel project settings
2. Use the DbInitializer component in the admin panel to create necessary database tables
3. Verify the connection is working by checking the logs or testing functionality

By following this guide, you should have a good understanding of how the application connects to Supabase PostgreSQL via Vercel's infrastructure.
