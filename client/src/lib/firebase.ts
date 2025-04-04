import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Get current protocol and hostname for auth domain fallback
const appHost = window.location.hostname;
const isLocalhost = appHost === 'localhost' || appHost === '127.0.0.1' || appHost.includes('replit.dev') || appHost.includes('.repl.co');

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Dynamically set the authDomain based on environment
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase config:", {
  ...firebaseConfig,
  apiKey: "HIDDEN",
  appId: "HIDDEN"
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set persistence to local
auth.useDeviceLanguage();

// Export the app
export default app;