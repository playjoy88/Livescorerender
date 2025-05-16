import type { Database } from '../types/supabase';
import { handleDbError } from '../utils/clientSideDbFallback';

export type ApiSettings = Database['public']['Tables']['api_settings']['Row'];
export type ApiSettingsUpdate = Database['public']['Tables']['api_settings']['Update'];
export type ApiSettingsInsert = Database['public']['Tables']['api_settings']['Insert'];

// Types for API test
export interface ApiTestDetails {
  status?: number;
  statusText?: string;
  endpoint?: string;
  data?: Record<string, unknown>;
  serverIp?: string;
  error?: string;
  resolution?: string;
}

export interface ApiTestResult {
  success: boolean;
  message: string;
  details?: ApiTestDetails;
}

/**
 * Service for managing API settings using the server-side API
 */
export const apiSettingsService = {
  /**
   * Get the current API settings
   * @returns The current API settings or null if not found
   */
  async getSettings(): Promise<ApiSettings | null> {
    try {
      const response = await fetch('/api/admin/api-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching API settings:', errorData);
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      return handleDbError(error, null);
    }
  },

  /**
   * Update API settings
   * @param id The ID of the settings record to update
   * @param settings The settings to update
   * @returns The updated settings or null if the update failed
   */
  async updateSettings(id: string, settings: ApiSettingsUpdate): Promise<ApiSettings | null> {
    try {
      const response = await fetch('/api/admin/api-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          ...settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating API settings:', errorData);
        throw new Error(errorData.error || 'Failed to update API settings');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      // Rethrow the error with details for better debugging
      throw error;
    }
  },

  /**
   * Create new API settings
   * @param settings The settings to create
   * @returns The created settings or null if the creation failed
   */
  async createSettings(settings: ApiSettingsInsert): Promise<ApiSettings | null> {
    try {
      const response = await fetch('/api/admin/api-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating API settings:', errorData);
        throw new Error(errorData.error || 'Failed to create API settings');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error in createSettings:', error);
      // Rethrow the error with details for better debugging
      throw error;
    }
  },

  /**
   * Test API connection with current settings
   * @returns An object with success status, message, and optional details
   */
  async testConnection(): Promise<ApiTestResult> {
    try {
      const response = await fetch('/api/admin/api-settings', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          message: errorData.message || 'Connection test failed',
          details: errorData.details
        };
      }

      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message,
        details: result.details
      };
    } catch (error) {
      console.error('Error testing API connection:', error);
      return { 
        success: false, 
        message: `Connection test failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },

  /**
   * Update the API endpoint configuration
   * @param id The ID of the settings record to update
   * @param endpoints The new endpoints configuration
   * @returns The updated settings or null if the update failed
   */
  async updateEndpoints(id: string, endpoints: Record<string, boolean>): Promise<ApiSettings | null> {
    return this.updateSettings(id, { endpoints });
  }
};

export default apiSettingsService;
