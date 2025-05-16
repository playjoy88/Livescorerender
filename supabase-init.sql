-- Supabase SQL initialization script for Playjoy Livescore
-- This script can be executed in the Supabase SQL Editor
-- Version: 1.0.0

------------------------
-- EXTENSION SETUP
------------------------

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

------------------------
-- HELPER FUNCTIONS
------------------------

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------
-- USER MANAGEMENT TABLES
------------------------

-- Users profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  thai_league_fan BOOLEAN DEFAULT false,
  notification_token TEXT,
  notification_settings JSONB DEFAULT '{"goals": true, "cards": true, "lineups": true, "match_start": true, "match_end": true, "favorite_teams": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row-Level Security for user profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user profiles
CREATE POLICY "Users can view all profiles" 
  ON public.user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Create trigger for updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- User favorites (pinned matches and favorite teams)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('match', 'team', 'league')),
  entity_id VARCHAR(100) NOT NULL, -- API ID for match, team or league
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row-Level Security for user favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user favorites
CREATE POLICY "Users can manage own favorites" 
  ON public.user_favorites 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create index on user favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity ON public.user_favorites(favorite_type, entity_id);

------------------------
-- FOOTBALL DATA CACHE TABLES
------------------------

-- Teams table (cache of API data)
CREATE TABLE IF NOT EXISTS public.teams (
  id VARCHAR(50) PRIMARY KEY, -- API ID for the team
  name VARCHAR(100) NOT NULL,
  name_th VARCHAR(100), -- Thai translation
  country VARCHAR(50),
  country_th VARCHAR(50), -- Thai translation
  logo_url TEXT,
  venue_name VARCHAR(100),
  venue_city VARCHAR(100),
  founded INTEGER,
  data JSONB, -- Full API response data
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on teams
CREATE INDEX IF NOT EXISTS idx_teams_country ON public.teams(country);

-- Leagues table (cache of API data)
CREATE TABLE IF NOT EXISTS public.leagues (
  id VARCHAR(50) PRIMARY KEY, -- API ID for the league
  name VARCHAR(100) NOT NULL,
  name_th VARCHAR(100), -- Thai translation
  country VARCHAR(50),
  country_th VARCHAR(50), -- Thai translation
  logo_url TEXT,
  season INTEGER,
  is_current BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 999, -- For ordering leagues in UI (lower = higher priority)
  data JSONB, -- Full API response data
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on leagues
CREATE INDEX IF NOT EXISTS idx_leagues_country ON public.leagues(country);
CREATE INDEX IF NOT EXISTS idx_leagues_current_season ON public.leagues(is_current, season);

-- Matches table (cache of API data)
CREATE TABLE IF NOT EXISTS public.matches (
  id VARCHAR(50) PRIMARY KEY, -- API ID for the match
  league_id VARCHAR(50) REFERENCES public.leagues(id),
  home_team_id VARCHAR(50) REFERENCES public.teams(id),
  away_team_id VARCHAR(50) REFERENCES public.teams(id),
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20), -- LIVE, FINISHED, SCHEDULED, etc.
  home_score INTEGER,
  away_score INTEGER,
  match_time INTEGER, -- Time elapsed in minutes (for live matches)
  half_time_score VARCHAR(10),
  full_time_score VARCHAR(10),
  venue VARCHAR(100),
  referee VARCHAR(100),
  events JSONB, -- Goals, cards, substitutions
  statistics JSONB, -- Match stats
  lineups JSONB, -- Team lineups
  data JSONB, -- Full API response data
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on matches
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON public.matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_league ON public.matches(league_id);

------------------------
-- PREDICTION SYSTEM TABLES
------------------------

-- AI prediction models
CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE, -- For referencing in code (e.g., stats_master, form_guru)
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  accuracy_overall DECIMAL(5,2) DEFAULT 0, -- Overall accuracy percentage
  accuracy_last_week DECIMAL(5,2) DEFAULT 0, -- Last week's accuracy percentage
  config JSONB, -- Configuration for the model
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up sample AI models
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.ai_models) = 0 THEN
    INSERT INTO public.ai_models (name, code, description, is_active) VALUES 
    ('Playjoy Stats Master', 'stats_master', 'Based on statistical analysis of match and team data', true),
    ('Playjoy Form Guru', 'form_guru', 'Focuses on recent team form and momentum', true),
    ('Playjoy Thai Expert', 'thai_expert', 'Specialized in Thai football leagues', true),
    ('Playjoy Community', 'community', 'Aggregated from user predictions', true);
  END IF;
END $$;

-- Create trigger for updated_at on ai_models
DROP TRIGGER IF EXISTS update_ai_models_updated_at ON public.ai_models;
CREATE TRIGGER update_ai_models_updated_at
BEFORE UPDATE ON public.ai_models
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Match predictions
CREATE TABLE IF NOT EXISTS public.match_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id VARCHAR(50) NOT NULL REFERENCES public.matches(id),
  ai_model_id UUID REFERENCES public.ai_models(id),
  user_id UUID REFERENCES public.user_profiles(id),
  prediction_type VARCHAR(20) CHECK (prediction_type IN ('win_draw_loss', 'exact_score')),
  home_score INTEGER,
  away_score INTEGER,
  home_win_probability DECIMAL(5,2),
  draw_probability DECIMAL(5,2),
  away_win_probability DECIMAL(5,2),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  result VARCHAR(20) CHECK (result IN ('correct', 'incorrect', 'partial', 'pending')),
  points_earned INTEGER DEFAULT 0,
  factors JSONB, -- Factors that influenced the prediction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on match_predictions
CREATE INDEX IF NOT EXISTS idx_match_predictions_match ON public.match_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_predictions_user ON public.match_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_predictions_model ON public.match_predictions(ai_model_id);
CREATE INDEX IF NOT EXISTS idx_match_predictions_result ON public.match_predictions(result);

-- Prediction contests
CREATE TABLE IF NOT EXISTS public.prediction_contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  rules JSONB,
  prizes TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at on prediction_contests
DROP TRIGGER IF EXISTS update_prediction_contests_updated_at ON public.prediction_contests;
CREATE TRIGGER update_prediction_contests_updated_at
BEFORE UPDATE ON public.prediction_contests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Contest entries
CREATE TABLE IF NOT EXISTS public.contest_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL REFERENCES public.prediction_contests(id),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  total_points INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Create indexes on contest_entries
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON public.contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_user ON public.contest_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_points ON public.contest_entries(contest_id, total_points DESC);

-- Create trigger for updated_at on contest_entries
DROP TRIGGER IF EXISTS update_contest_entries_updated_at ON public.contest_entries;
CREATE TRIGGER update_contest_entries_updated_at
BEFORE UPDATE ON public.contest_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Contest matches
CREATE TABLE IF NOT EXISTS public.contest_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL REFERENCES public.prediction_contests(id),
  match_id VARCHAR(50) NOT NULL REFERENCES public.matches(id),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  points_exact_score INTEGER DEFAULT 3,
  points_outcome INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, match_id)
);

-- Create indexes on contest_matches
CREATE INDEX IF NOT EXISTS idx_contest_matches_contest ON public.contest_matches(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_matches_match ON public.contest_matches(match_id);

------------------------
-- NEWS AND CONTENT TABLES
------------------------

-- News articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  featured_image_url TEXT,
  author VARCHAR(100),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[],
  related_team_ids TEXT[],
  related_league_ids TEXT[],
  related_match_ids TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on news_articles
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles(published_at, status);
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles(slug);

-- Create trigger for updated_at on news_articles
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

------------------------
-- ADVERTISEMENTS SYSTEM
------------------------

-- Create advertisements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL,
  size VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,2) NOT NULL DEFAULT 0,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row-Level Security for advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
  ON public.advertisements 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Allow public read access but restrict write operations
CREATE POLICY "Allow public read access" 
  ON public.advertisements 
  FOR SELECT 
  TO anon 
  USING (true);

-- Insert sample data if the table is empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.advertisements) = 0 THEN
    -- Insert sample advertisements
    INSERT INTO public.advertisements (
      name, position, size, image_url, url, status, 
      start_date, end_date, impressions, clicks, ctr, revenue
    ) VALUES 
    (
      'Hero Banner - Main Promotion', 
      'hero', 
      'large', 
      'https://storage.example.com/ads/hero-large.svg', 
      'https://playjoy.com/promotions/main', 
      'active', 
      NOW(), 
      NOW() + INTERVAL '30 days', 
      1240, 
      83, 
      6.7, 
      18750
    ),
    (
      'Sidebar Banner - Premium', 
      'sidebar', 
      'medium', 
      'https://storage.example.com/ads/sidebar-medium.svg', 
      'https://playjoy.com/promotions/sidebar', 
      'scheduled', 
      NOW() + INTERVAL '7 days', 
      NOW() + INTERVAL '37 days', 
      0, 
      0, 
      0, 
      25400
    ),
    (
      'In-Feed Banner - Thai League Promo', 
      'in-feed', 
      'large', 
      'https://storage.example.com/ads/in-feed-large.svg', 
      'https://playjoy.com/promotions/thai-league', 
      'active', 
      NOW() - INTERVAL '10 days', 
      NOW() + INTERVAL '20 days', 
      2780, 
      195, 
      7.0, 
      32000
    );
  END IF;
END $$;

-- Create indexes for better performance on advertisements
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON public.advertisements(status);
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON public.advertisements(position);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON public.advertisements(start_date, end_date);

-- Create trigger for updated_at on advertisements
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON public.advertisements;
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

------------------------
-- ANALYTICS TABLES
------------------------

-- User activity log
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id),
  session_id VARCHAR(100),
  activity_type VARCHAR(50) NOT NULL, -- e.g., view_match, make_prediction, click_ad
  entity_type VARCHAR(50), -- e.g., match, team, ad
  entity_id VARCHAR(100),
  data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created ON public.user_activity_log(created_at);

-- Ad analytics
CREATE TABLE IF NOT EXISTS public.ad_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES public.advertisements(id),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ad_id, date)
);

-- Create indexes on ad_analytics
CREATE INDEX IF NOT EXISTS idx_ad_analytics_ad ON public.ad_analytics(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_date ON public.ad_analytics(date);

-- Create trigger for updated_at on ad_analytics
DROP TRIGGER IF EXISTS update_ad_analytics_updated_at ON public.ad_analytics;
CREATE TRIGGER update_ad_analytics_updated_at
BEFORE UPDATE ON public.ad_analytics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

------------------------
-- SITE SETTINGS TABLES
------------------------

-- Create site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_type VARCHAR(50) NOT NULL, -- e.g., 'logo', 'theme', 'seo'
  image_url TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  value JSONB, -- For storing complex settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row-Level Security for site settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
  ON public.site_settings 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Allow public read access but restrict write operations
CREATE POLICY "Allow public read access" 
  ON public.site_settings 
  FOR SELECT 
  TO anon 
  USING (true);

-- Create trigger for updated_at on site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.site_settings IS 'Website settings including logo, theme, and SEO configurations';

------------------------
-- API CACHING TABLES
------------------------

-- API caching table
CREATE TABLE IF NOT EXISTS public.api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint VARCHAR(255) NOT NULL,
  params JSONB,
  response JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(endpoint, params)
);

-- Create indexes on api_cache
CREATE INDEX IF NOT EXISTS idx_api_cache_endpoint ON public.api_cache(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache(expires_at);

------------------------
-- SET UP TABLE COMMENTS
------------------------

-- Add table comments for documentation
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.user_favorites IS 'User favorite teams, matches, and leagues';
COMMENT ON TABLE public.teams IS 'Football teams data cached from API';
COMMENT ON TABLE public.leagues IS 'Football leagues data cached from API';
COMMENT ON TABLE public.matches IS 'Football matches data cached from API';
COMMENT ON TABLE public.ai_models IS 'AI prediction models available in the system';
COMMENT ON TABLE public.match_predictions IS 'Predictions for match outcomes from AI models and users';
COMMENT ON TABLE public.prediction_contests IS 'Prediction contests for users to participate in';
COMMENT ON TABLE public.contest_entries IS 'User entries in prediction contests';
COMMENT ON TABLE public.contest_matches IS 'Matches associated with prediction contests';
COMMENT ON TABLE public.news_articles IS 'Football news articles';
COMMENT ON TABLE public.advertisements IS 'Ad management system for revenue generation';
COMMENT ON TABLE public.user_activity_log IS 'Log of user activities for analytics';
COMMENT ON TABLE public.ad_analytics IS 'Daily analytics for advertisement performance';
COMMENT ON TABLE public.api_cache IS 'Cache for external API responses';
