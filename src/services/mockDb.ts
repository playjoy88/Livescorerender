// Mock Database Implementation
// This provides a local in-memory database for ads management

import { v4 as uuidv4 } from 'uuid';

// Interface for database models
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

// Type for creating a new advertisement
export type NewAdvertisement = Omit<Advertisement, 'id'>;

// In-memory store for advertisements
let advertisements: Advertisement[] = [
  {
    id: '1',
    name: 'Hero Banner - Main Promotion',
    position: 'hero',
    size: 'large',
    imageUrl: '/ads/hero-large.svg',
    url: 'https://playjoy.com/promotions/main',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    impressions: 1240,
    clicks: 83,
    ctr: 6.7,
    revenue: 18750,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sidebar Banner - Premium',
    position: 'sidebar',
    size: 'medium',
    imageUrl: '/ads/sidebar-medium.svg',
    url: 'https://playjoy.com/promotions/sidebar',
    status: 'scheduled',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    impressions: 0,
    clicks: 0,
    ctr: 0,
    revenue: 25400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'In-Feed Banner - Thai League Promo',
    position: 'in-feed',
    size: 'large',
    imageUrl: '/ads/in-feed-large.svg',
    url: 'https://playjoy.com/promotions/thai-league',
    status: 'active',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    impressions: 2780,
    clicks: 195,
    ctr: 7.0,
    revenue: 32000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get all advertisements
export const getAdvertisements = async (): Promise<Advertisement[]> => {
  // Sort by updated date (newest first)
  return [...advertisements].sort((a, b) => 
    new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime()
  );
};

// Get a specific advertisement by ID
export const getAdvertisementById = async (id: string): Promise<Advertisement | null> => {
  const ad = advertisements.find(ad => ad.id === id);
  return ad || null;
};

// Create a new advertisement
export const createAdvertisement = async (advertisement: NewAdvertisement): Promise<Advertisement | null> => {
  const now = new Date().toISOString();
  const newAd: Advertisement = {
    ...advertisement,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
  
  advertisements.push(newAd);
  return newAd;
};

// Update an existing advertisement
export const updateAdvertisement = async (id: string, advertisement: Partial<Advertisement>): Promise<Advertisement | null> => {
  const index = advertisements.findIndex(ad => ad.id === id);
  if (index === -1) return null;
  
  // Update the advertisement
  advertisements[index] = {
    ...advertisements[index],
    ...advertisement,
    updatedAt: new Date().toISOString()
  };
  
  return advertisements[index];
};

// Delete an advertisement
export const deleteAdvertisement = async (id: string): Promise<boolean> => {
  const initialLength = advertisements.length;
  advertisements = advertisements.filter(ad => ad.id !== id);
  return advertisements.length < initialLength;
};

// Get advertisements by status
export const getAdvertisementsByStatus = async (status: string): Promise<Advertisement[]> => {
  return advertisements.filter(ad => ad.status === status)
    .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
};

// Record an impression for an advertisement
export const recordImpression = async (id: string): Promise<boolean> => {
  const ad = advertisements.find(ad => ad.id === id);
  if (!ad) return false;
  
  // Calculate new CTR
  const impressions = ad.impressions + 1;
  const ctr = ad.clicks > 0 ? (ad.clicks / impressions) * 100 : 0;
  
  // Update the advertisement
  ad.impressions = impressions;
  ad.ctr = parseFloat(ctr.toFixed(2));
  ad.updatedAt = new Date().toISOString();
  
  return true;
};

// Record a click for an advertisement
export const recordClick = async (id: string): Promise<boolean> => {
  const ad = advertisements.find(ad => ad.id === id);
  if (!ad) return false;
  
  // Calculate new CTR
  const clicks = ad.clicks + 1;
  const ctr = ad.impressions > 0 ? (clicks / ad.impressions) * 100 : 0;
  
  // Update the advertisement
  ad.clicks = clicks;
  ad.ctr = parseFloat(ctr.toFixed(2));
  ad.updatedAt = new Date().toISOString();
  
  return true;
};

// Simple mock blob storage service
export const blobStorage = {
  // Upload a file to "Blob Storage" (just returns a path)
  uploadFile: async (file: File): Promise<string> => {
    console.log('Mock uploading file:', file.name);
    
    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;
    
    // Return a public URL path
    return `/ads/${filename}`;
  },
  
  // Delete a file from "Blob Storage" (just logs)
  deleteFile: async (url: string): Promise<boolean> => {
    console.log('Mock deleting file:', url);
    return true;
  },
  
  // Check if a URL is a valid Blob Storage URL
  isValidBlobUrl: (url: string): boolean => {
    return url.startsWith('/ads/') || url.includes('storage.example.com/ads/');
  },
  
  // Format URL to ensure it has the correct format
  formatBlobUrl: (url: string) => {
    if (!url) return '';
    
    // For local paths, return as is
    if (url.startsWith('/')) {
      return url;
    }
    
    // If it contains storage.example.com/ads/, proxy it
    if (url.includes('storage.example.com/ads/')) {
      // Extract the path after "ads/"
      const match = url.match(/storage\.example\.com\/ads\/(.+)/);
      if (match && match[1]) {
        return `/ads/${match[1]}`;
      }
    }
    
    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's just a filename, assume it's in the /ads/ directory
    return `/ads/${url}`;
  }
};

// Database initialization - just logs since we're using in-memory data
export const initializeDatabase = async (): Promise<boolean> => {
  console.log('Mock database initialized successfully');
  return true;
};
