import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Get current protocol and hostname for auth domain fallback
const appHost = window.location.hostname;
const isLocalhost = appHost === 'localhost' || appHost === '127.0.0.1' || appHost.includes('replit.dev') || appHost.includes('.repl.co');

// Firebase configuration
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Dynamically set the authDomain based on environment
  authDomain: `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: `${projectId}.appspot.com`,
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

// Log auth initialization status
console.log("Firebase Auth initialized:", {
  currentUser: auth.currentUser,
  config: auth.config,
  appName: auth.app.name,
  projectId: auth.app.options.projectId
});

// Set persistence to local
auth.useDeviceLanguage();

// Export the app (both default and named export)
export { app };
export default app;