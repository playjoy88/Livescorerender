import { supabase, supabaseAdmin } from './supabaseClient';
import { blobStorage } from './vercelDb';

// Define types here to avoid circular dependency
export interface Advertisement {
  id: string;
  name: string;
  position: 'hero' | 'sidebar' | 'in-feed' | 'footer' | 'pre-content';
  size: 'small' | 'medium' | 'large';
  imageUrl: string;
  url: string;
  status: 'active' | 'paused' | 'scheduled' | 'ended';
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NewAdvertisement = Omit<Advertisement, 'id'>;

// Type conversion helper: convert snake_case to camelCase
const snakeToCamel = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  const newObj: Record<string, unknown> = {};
  Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = snakeToCamel(value);
  });

  return newObj;
};

// Database record interface that matches the database schema
interface DbAdvertisement {
  id?: string;
  name: string;
  position: string;
  size: string;
  image_url: string;
  url: string;
  status: string;
  start_date: string;
  end_date: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  revenue?: number;
  created_at?: string;
  updated_at?: string;
}

// Type conversion helper: convert camelCase to snake_case
const camelToSnake = <T extends Record<string, unknown>>(obj: T): DbAdvertisement => {
  if (obj === null || typeof obj !== 'object') {
    return {} as DbAdvertisement;
  }

  // Convert from camelCase to snake_case and map properties correctly
  const name = obj.name as string || '';
  const position = obj.position as string || '';
  const size = obj.size as string || '';
  const imageUrl = obj.imageUrl as string || '';
  const url = obj.url as string || '';
  const status = obj.status as string || '';
  const startDate = obj.startDate as string || new Date().toISOString();
  const endDate = obj.endDate as string || new Date().toISOString();
  
  // Create the database record with the proper snake_case fields
  return {
    name,
    position,
    size, 
    image_url: imageUrl,
    url,
    status,
    start_date: startDate,
    end_date: endDate,
    impressions: (obj.impressions as number) || 0,
    clicks: (obj.clicks as number) || 0,
    ctr: (obj.ctr as number) || 0,
    revenue: (obj.revenue as number) || 0,
    created_at: (obj.createdAt as string) || new Date().toISOString(),
    updated_at: (obj.updatedAt as string) || new Date().toISOString()
  };
};

// Get all advertisements
export const getAllAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching advertisements:', error);
      throw new Error(`Failed to fetch advertisements: ${error.message}`);
    }

    return (data || []).map((ad) => snakeToCamel(ad) as Advertisement);
  } catch (error) {
    console.error('Error in getAllAdvertisements:', error);
    throw error;
  }
};

// Get a single advertisement by ID
export const getAdvertisementById = async (id: string): Promise<Advertisement | null> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 means no rows returned
        return null;
      }
      console.error(`Error fetching advertisement with id ${id}:`, error);
      throw new Error(`Failed to fetch advertisement: ${error.message}`);
    }

    return data ? snakeToCamel(data) as Advertisement : null;
  } catch (error) {
    console.error(`Error in getAdvertisementById(${id}):`, error);
    throw error;
  }
};

// Create a new advertisement
export const createAd = async (adData: NewAdvertisement): Promise<Advertisement> => {
  try {
    // Convert camelCase to snake_case for the database
    const snakeCaseData = camelToSnake(adData);
    
    // Add timestamps if not provided
    if (!snakeCaseData.created_at) {
      snakeCaseData.created_at = new Date().toISOString();
    }
    if (!snakeCaseData.updated_at) {
      snakeCaseData.updated_at = snakeCaseData.created_at;
    }

    console.log('Creating advertisement using admin client to bypass RLS:', snakeCaseData);
    
    // Use supabaseAdmin to bypass Row-Level Security
    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .insert(snakeCaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating advertisement:', error);
      throw new Error(`Failed to create advertisement: ${error.message}`);
    }

    return snakeToCamel(data) as Advertisement;
  } catch (error) {
    console.error('Error in createAd:', error);
    throw error;
  }
};

// Update an existing advertisement
export const updateAd = async (id: string, adData: Partial<NewAdvertisement>): Promise<Advertisement | null> => {
  try {
    // Convert camelCase to snake_case for the database
    const snakeCaseData = camelToSnake(adData);
    
    // Always update the updated_at timestamp
    snakeCaseData.updated_at = new Date().toISOString();

    console.log('Updating advertisement using admin client to bypass RLS:', id, snakeCaseData);
    
    // Use supabaseAdmin to bypass Row-Level Security
    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .update(snakeCaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating advertisement with id ${id}:`, error);
      throw new Error(`Failed to update advertisement: ${error.message}`);
    }

    return data ? snakeToCamel(data) as Advertisement : null;
  } catch (error) {
    console.error(`Error in updateAd(${id}):`, error);
    throw error;
  }
};

// Delete an advertisement
export const deleteAdvertisement = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting advertisement using admin client to bypass RLS:', id);
    
    // Use supabaseAdmin to bypass Row-Level Security
    const { error } = await supabaseAdmin
      .from('advertisements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting advertisement with id ${id}:`, error);
      throw new Error(`Failed to delete advertisement: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteAdvertisement(${id}):`, error);
    throw error;
  }
};

// Get active advertisements for a specific position
export const getActiveAdvertisementsByPosition = async (position: string): Promise<Advertisement[]> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('position', position)
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now);

    if (error) {
      console.error(`Error fetching active advertisements for position ${position}:`, error);
      throw new Error(`Failed to fetch active advertisements: ${error.message}`);
    }

    return (data || []).map((ad) => snakeToCamel(ad) as Advertisement);
  } catch (error) {
    console.error(`Error in getActiveAdvertisementsByPosition(${position}):`, error);
    throw error;
  }
};

// Track advertisement impression
export const trackImpression = async (id: string): Promise<void> => {
  try {
    // First get the current advertisement to get the current impressions count
    const { data: currentAd, error: fetchError } = await supabase
      .from('advertisements')
      .select('impressions, clicks, ctr')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(`Error fetching advertisement with id ${id}:`, fetchError);
      throw new Error(`Failed to track impression: ${fetchError.message}`);
    }

    if (!currentAd) {
      throw new Error(`Advertisement with id ${id} not found`);
    }

    // Increment impressions and recalculate CTR
    const impressions = (currentAd.impressions || 0) + 1;
    const clicks = currentAd.clicks || 0;
    const ctr = clicks > 0 ? (clicks / impressions) * 100 : 0;

    // Update the advertisement
    const { error: updateError } = await supabase
      .from('advertisements')
      .update({
        impressions,
        ctr,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error(`Error updating impression count for advertisement ${id}:`, updateError);
      throw new Error(`Failed to track impression: ${updateError.message}`);
    }
  } catch (error) {
    console.error(`Error in trackImpression(${id}):`, error);
    // We don't want to throw here because it could interrupt the user experience
    // Just log the error
  }
};

// Track advertisement click
export const trackClick = async (id: string): Promise<void> => {
  try {
    // First get the current advertisement to get the current counts
    const { data: currentAd, error: fetchError } = await supabase
      .from('advertisements')
      .select('impressions, clicks, ctr')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(`Error fetching advertisement with id ${id}:`, fetchError);
      throw new Error(`Failed to track click: ${fetchError.message}`);
    }

    if (!currentAd) {
      throw new Error(`Advertisement with id ${id} not found`);
    }

    // Increment clicks and recalculate CTR
    const impressions = currentAd.impressions || 0;
    const clicks = (currentAd.clicks || 0) + 1;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    // Update the advertisement
    const { error: updateError } = await supabase
      .from('advertisements')
      .update({
        clicks,
        ctr,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error(`Error updating click count for advertisement ${id}:`, updateError);
      throw new Error(`Failed to track click: ${updateError.message}`);
    }
  } catch (error) {
    console.error(`Error in trackClick(${id}):`, error);
    // We don't want to throw here because it could interrupt the user experience
    // Just log the error
  }
};

// Export blobStorage from vercelDb to maintain compatibility with existing code
export { blobStorage };
