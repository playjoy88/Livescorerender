-- API Settings Table for Supabase
-- This table will store API configuration settings that can be managed through the admin interface

-- Create API settings table
CREATE TABLE IF NOT EXISTS public.api_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key TEXT NOT NULL,
  api_host VARCHAR(255) NOT NULL,
  api_version VARCHAR(10) NOT NULL,
  cache_timeout INTEGER NOT NULL DEFAULT 5,
  request_limit INTEGER NOT NULL DEFAULT 1000,
  polling_interval INTEGER NOT NULL DEFAULT 60,
  proxy_enabled BOOLEAN NOT NULL DEFAULT true,
  debug_mode BOOLEAN NOT NULL DEFAULT false,
  endpoints JSONB NOT NULL DEFAULT '{"fixtures": true, "standings": true, "teams": true, "players": true, "odds": false, "predictions": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.api_settings IS 'API configuration settings for football data providers';

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Create trigger for updated_at on api_settings
DROP TRIGGER IF EXISTS update_api_settings_updated_at ON public.api_settings;
CREATE TRIGGER update_api_settings_updated_at
BEFORE UPDATE ON public.api_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set up Row-Level Security for api_settings
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" 
  ON public.api_settings 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy to allow write access only for admin users
-- Note: This assumes you have a role field in your auth.users table or a way to identify admins
CREATE POLICY "Allow write access for admin users only" 
  ON public.api_settings 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default settings if table is empty
INSERT INTO public.api_settings (
  api_key,
  api_host,
  api_version,
  cache_timeout,
  request_limit,
  polling_interval,
  proxy_enabled,
  debug_mode,
  endpoints
)
SELECT
  'x-rapidapi-key-********-redacted',
  'api-football-v1.p.rapidapi.com',
  'v3',
  5,
  1000,
  60,
  true,
  false,
  '{"fixtures": true, "standings": true, "teams": true, "players": true, "odds": false, "predictions": true}'::jsonb
WHERE
  NOT EXISTS (SELECT 1 FROM public.api_settings);

-- Create type definitions file reminder
COMMENT ON TABLE public.api_settings IS 'Remember to update the src/types/supabase.ts file to include this table definition';
