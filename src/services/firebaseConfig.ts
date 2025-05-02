// This is a mock Firebase configuration for development
// In a production environment, you would replace this with actual Firebase config

// Mock Firestore DB that simulates basic functionality
export const db = {
  // This is just a placeholder to make TypeScript happy
  collection: () => ({
    // Firestore collection reference placeholder
  }),
  doc: () => ({
    // Firestore document reference placeholder
  })
};

export const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "playjoy-livescore.firebaseapp.com",
  projectId: "playjoy-livescore",
  storageBucket: "playjoy-livescore.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
