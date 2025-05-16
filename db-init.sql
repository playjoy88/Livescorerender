-- Initialize database schema for Playjoy LiveScore
-- This script creates all necessary tables for the application
-- Version: 1.1.0

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_type TEXT NOT NULL UNIQUE,
  image_url TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  size TEXT NOT NULL,
  image_url TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  revenue FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  original_title TEXT,
  content TEXT NOT NULL,
  original_content TEXT,
  summary TEXT NOT NULL,
  featured_image_url TEXT,
  source TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create API settings table
CREATE TABLE IF NOT EXISTS api_settings (
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

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON advertisements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON news_articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_settings_updated_at
BEFORE UPDATE ON api_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for efficient news search
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);

-- Insert sample site settings if they don't exist
INSERT INTO site_settings (setting_type, image_url, width, height, alt_text)
VALUES ('logo', '/images/logo.png', 200, 60, 'Playjoy LiveScore Logo')
ON CONFLICT (setting_type) DO NOTHING;

-- Insert sample admin user if it doesn't exist
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@playjoy.com', '$2a$10$n9rVGJ1RUaRRnimN.rZ3d.JcEnKuFQBeQmTjuliLg0J1HahyR5i.6', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default API settings if they don't exist
INSERT INTO api_settings (
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
  NOT EXISTS (SELECT 1 FROM api_settings);
