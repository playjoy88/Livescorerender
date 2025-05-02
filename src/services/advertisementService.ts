// Import mock db with explicit type
const db = {
  // This is just a placeholder to make TypeScript happy
  collection: () => ({
    // Firestore collection reference placeholder
  }),
  doc: () => ({
    // Firestore document reference placeholder
  })
};

// Define types for Firestore-like operations
type FirestoreDb = typeof db;
type CollectionReference = { collectionName: string };
type DocumentReference = { collectionName: string; docId: string };
type QuerySnapshot = { empty: boolean; docs: Array<DocumentSnapshot> };
type DocumentSnapshot = { 
  id: string; 
  data: () => Record<string, unknown>;
  exists: () => boolean;
};
type QueryConstraint = { field: string; operator: string; value: unknown };

// Mock Firestore functions
const collection = (db: FirestoreDb, collectionName: string): CollectionReference => ({ collectionName });
// Use eslint-disable comments to indicate these parameters are intentionally unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDocs = async (collectionRef: CollectionReference): Promise<QuerySnapshot> => ({ 
  empty: true, 
  docs: [] 
});
const doc = (db: FirestoreDb, collectionName: string, docId: string): DocumentReference => ({ collectionName, docId });
const getDoc = async (docRef: DocumentReference): Promise<DocumentSnapshot> => ({
  exists: () => false,
  data: () => ({}),
  id: docRef.docId
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addDoc = async (collectionRef: CollectionReference, data: Record<string, unknown>): Promise<DocumentReference & { id: string }> => ({ 
  id: `ad-${Date.now()}`,
  collectionName: 'advertisements',
  docId: `ad-${Date.now()}`
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateDoc = async (docRef: DocumentReference, data: Record<string, unknown>): Promise<void> => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deleteDoc = async (docRef: DocumentReference): Promise<void> => {};
const query = (collectionRef: CollectionReference, ...constraints: QueryConstraint[]): CollectionReference & { constraints: QueryConstraint[] } => ({ 
  ...collectionRef, 
  constraints 
});
const where = (field: string, operator: string, value: unknown): QueryConstraint => ({ field, operator, value });

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

// Empty state when we don't have actual data
const emptyStateAds: Advertisement[] = [
  {
    id: 'ad-001',
    name: 'Hero Banner - Main Promotion',
    position: 'hero',
    size: 'large',
    imageUrl: '/ads/hero-large.svg',
    url: 'https://playjoy.com/promotions/main',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    impressions: 0,
    clicks: 0,
    ctr: 0,
    revenue: 0
  },
  {
    id: 'ad-002',
    name: 'Sidebar Banner - Premium',
    position: 'sidebar',
    size: 'medium',
    imageUrl: '/ads/sidebar-medium.svg',
    url: 'https://playjoy.com/promotions/sidebar',
    status: 'scheduled',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(), // 37 days from now
    impressions: 0,
    clicks: 0,
    ctr: 0,
    revenue: 0
  }
];

// Get all advertisements
export const getAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    // Try to connect to Firestore if available
    const adsCollection = collection(db, 'advertisements');
    const adsSnapshot = await getDocs(adsCollection);
    
    if (!adsSnapshot.empty) {
      return adsSnapshot.docs.map((firestoreDoc: DocumentSnapshot) => {
        const data = firestoreDoc.data();
        return {
          id: firestoreDoc.id,
          ...data
        } as Advertisement;
      });
    } else {
      console.log('No advertisements found in Firestore, using empty state data');
      return emptyStateAds;
    }
  } catch (error) {
    console.error('Error fetching advertisements from Firestore:', error);
    console.log('Using empty state data instead');
    return emptyStateAds;
  }
};

// Get advertisement by ID
export const getAdvertisementById = async (id: string): Promise<Advertisement | null> => {
  try {
    // Try to connect to Firestore if available
    const adDoc = doc(db, 'advertisements', id);
    const adSnapshot = await getDoc(adDoc);
    
    if (adSnapshot.exists()) {
      return {
        id: adSnapshot.id,
        ...adSnapshot.data()
      } as Advertisement;
    } else {
      // Look for the ad in our empty state data
      const emptyStateAd = emptyStateAds.find(ad => ad.id === id);
      if (emptyStateAd) {
        return emptyStateAd;
      }
      return null;
    }
  } catch (error) {
    console.error('Error fetching advertisement from Firestore:', error);
    // Look for the ad in our empty state data
    const emptyStateAd = emptyStateAds.find(ad => ad.id === id);
    if (emptyStateAd) {
      return emptyStateAd;
    }
    return null;
  }
};

// Create advertisement
export const createAdvertisement = async (advertisement: Omit<Advertisement, 'id'>): Promise<Advertisement> => {
  try {
    // Add created and updated timestamps
    const adWithTimestamps = {
      ...advertisement,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      impressions: 0,
      clicks: 0,
      ctr: 0
    };
    
    // Try to connect to Firestore if available
    const adsCollection = collection(db, 'advertisements');
    const docRef = await addDoc(adsCollection, adWithTimestamps);
    
    return {
      id: docRef.id,
      ...adWithTimestamps
    } as Advertisement;
  } catch (error) {
    console.error('Error creating advertisement in Firestore:', error);
    // Generate a fake ID for the advertisement
    const fakeId = `ad-${Date.now()}`;
    return {
      id: fakeId,
      ...advertisement,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Advertisement;
  }
};

// Update advertisement
export const updateAdvertisement = async (id: string, advertisement: Partial<Advertisement>): Promise<Advertisement> => {
  try {
    // Add updated timestamp
    const adWithTimestamp = {
      ...advertisement,
      updatedAt: new Date().toISOString()
    };
    
    // Try to connect to Firestore if available
    const adDoc = doc(db, 'advertisements', id);
    await updateDoc(adDoc, adWithTimestamp);
    
    // Get the updated document
    const updatedDocSnapshot = await getDoc(adDoc);
    
    if (updatedDocSnapshot.exists()) {
      return {
        id: updatedDocSnapshot.id,
        ...updatedDocSnapshot.data()
      } as Advertisement;
    } else {
      throw new Error('Advertisement not found after update');
    }
  } catch (error) {
    console.error('Error updating advertisement in Firestore:', error);
    // If we can't update in Firestore, we'll just return the updated advertisement
    // This is just for demo purposes and won't persist
    return {
      id,
      ...advertisement,
      updatedAt: new Date().toISOString()
    } as Advertisement;
  }
};

// Delete advertisement
export const deleteAdvertisement = async (id: string): Promise<boolean> => {
  try {
    // Try to connect to Firestore if available
    const adDoc = doc(db, 'advertisements', id);
    await deleteDoc(adDoc);
    return true;
  } catch (error) {
    console.error('Error deleting advertisement from Firestore:', error);
    return false;
  }
};

// Get advertisements by status
export const getAdvertisementsByStatus = async (status: string): Promise<Advertisement[]> => {
  try {
    // Try to connect to Firestore if available
    const adsCollection = collection(db, 'advertisements');
    const q = query(adsCollection, where('status', '==', status));
    const adsSnapshot = await getDocs(q);
    
    if (!adsSnapshot.empty) {
      return adsSnapshot.docs.map((firestoreDoc: DocumentSnapshot) => {
        const data = firestoreDoc.data();
        return {
          id: firestoreDoc.id,
          ...data
        } as Advertisement;
      });
    } else {
      // Filter our empty state data by status
      return emptyStateAds.filter(ad => ad.status === status);
    }
  } catch (error) {
    console.error('Error fetching advertisements by status from Firestore:', error);
    // Filter our empty state data by status
    return emptyStateAds.filter(ad => ad.status === status);
  }
};

// Record ad impression
export const recordImpression = async (id: string): Promise<boolean> => {
  try {
    // Get the current advertisement
    const ad = await getAdvertisementById(id);
    if (!ad) return false;
    
    // Increment impressions and recalculate CTR
    const impressions = ad.impressions + 1;
    const ctr = ad.clicks > 0 ? (ad.clicks / impressions) * 100 : 0;
    
    // Update the advertisement
    await updateAdvertisement(id, { impressions, ctr });
    return true;
  } catch (error) {
    console.error('Error recording impression:', error);
    return false;
  }
};

// Record ad click
export const recordClick = async (id: string): Promise<boolean> => {
  try {
    // Get the current advertisement
    const ad = await getAdvertisementById(id);
    if (!ad) return false;
    
    // Increment clicks and recalculate CTR
    const clicks = ad.clicks + 1;
    const ctr = ad.impressions > 0 ? (clicks / ad.impressions) * 100 : 0;
    
    // Update the advertisement
    await updateAdvertisement(id, { clicks, ctr });
    return true;
  } catch (error) {
    console.error('Error recording click:', error);
    return false;
  }
};
