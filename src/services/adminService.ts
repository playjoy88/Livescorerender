/**
 * Admin Service
 * Provides client-side functions to interact with the admin API endpoints
 * This service can be used in client components to perform administrative operations
 */

// Helper to perform admin operations via the secure API endpoint
export const performAdminOperation = async (
  operation: 'insert' | 'update' | 'delete' | 'select',
  table: string,
  data?: any,
  filters?: Record<string, any>
) => {
  try {
    // Build the request body
    const body = {
      operation,
      table,
      data,
      filters
    };

    // Generate a simple token for demonstration purposes
    // In a production app, this would be a proper JWT or OAuth token
    const adminToken = 'admin-' + Date.now() + '-' + Math.random().toString(36).substring(2);

    // Call the admin API endpoint
    const response = await fetch('/api/admin/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(body)
    });

    // Parse the response
    const result = await response.json();

    // If there's an error in the result, throw it
    if (!response.ok || result.error) {
      throw new Error(result.error || result.details || 'Failed to perform admin operation');
    }

    // Return the data
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error(`Error in performAdminOperation(${operation}, ${table}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Higher-level functions for specific operations

// Create a record
export const createRecord = async (table: string, data: any) => {
  return performAdminOperation('insert', table, data);
};

// Update a record
export const updateRecord = async (table: string, data: any, filters: Record<string, any>) => {
  return performAdminOperation('update', table, data, filters);
};

// Delete a record
export const deleteRecord = async (table: string, filters: Record<string, any>) => {
  return performAdminOperation('delete', table, undefined, filters);
};

// Get records
export const getRecords = async (table: string, filters?: Record<string, any>) => {
  return performAdminOperation('select', table, undefined, filters);
};

// Advertisement-specific functions
export const createAdvertisement = async (adData: any) => {
  return createRecord('advertisements', adData);
};

export const updateAdvertisement = async (id: string, adData: any) => {
  return updateRecord('advertisements', adData, { id });
};

export const deleteAdvertisement = async (id: string) => {
  return deleteRecord('advertisements', { id });
};

export const getAdvertisements = async () => {
  return getRecords('advertisements');
};

// Site settings specific functions
export const updateSiteSettings = async (settingType: string, data: any) => {
  // First check if the setting exists
  const existingSettings = await getRecords('site_settings', { setting_type: settingType });
  
  // Prepare the data with the value field for storing settings
  const settingsData = {
    value: data.settings
  };
  
  if (existingSettings.success && existingSettings.data && existingSettings.data.length > 0) {
    // Update existing record
    return updateRecord('site_settings', settingsData, { id: existingSettings.data[0].id });
  } else {
    // Create new record
    return createRecord('site_settings', { setting_type: settingType, ...settingsData });
  }
};

export const getSiteSetting = async (settingType: string) => {
  return getRecords('site_settings', { setting_type: settingType });
};
