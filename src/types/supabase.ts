export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_settings: {
        Row: {
          id: string
          api_key: string
          api_host: string
          api_version: string
          cache_timeout: number
          request_limit: number
          polling_interval: number
          debug_mode: boolean
          endpoints: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          api_key: string
          api_host: string
          api_version: string
          cache_timeout?: number
          request_limit?: number
          polling_interval?: number
          debug_mode?: boolean
          endpoints?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          api_key?: string
          api_host?: string
          api_version?: string
          cache_timeout?: number
          request_limit?: number
          polling_interval?: number
          debug_mode?: boolean
          endpoints?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          id: string
          name: string
          position: string
          size: string
          image_url: string
          url: string
          status: string
          start_date: string
          end_date: string
          impressions: number | null
          clicks: number | null
          ctr: number | null
          revenue: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          size: string
          image_url: string
          url: string
          status: string
          start_date: string
          end_date: string
          impressions?: number | null
          clicks?: number | null
          ctr?: number | null
          revenue?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          size?: string
          image_url?: string
          url?: string
          status?: string
          start_date?: string
          end_date?: string
          impressions?: number | null
          clicks?: number | null
          ctr?: number | null
          revenue?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          id: string
          title: string
          original_title: string | null
          content: string
          original_content: string | null
          summary: string
          featured_image_url: string | null
          source: string
          published_at: string
          url: string | null
          status: string
          slug: string
          category: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          original_title?: string | null
          content: string
          original_content?: string | null
          summary: string
          featured_image_url?: string | null
          source: string
          published_at: string
          url?: string | null
          status?: string
          slug: string
          category: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          original_title?: string | null
          content?: string
          original_content?: string | null
          summary?: string
          featured_image_url?: string | null
          source?: string
          published_at?: string
          url?: string | null
          status?: string
          slug?: string
          category?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_type: string
          image_url: string | null
          width: number | null
          height: number | null
          alt_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_type: string
          image_url?: string | null
          width?: number | null
          height?: number | null
          alt_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_type?: string
          image_url?: string | null
          width?: number | null
          height?: number | null
          alt_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          password_hash: string
          role: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          password_hash: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          password_hash?: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
