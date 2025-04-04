import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for server-side
const projectId = process.env.VITE_FIREBASE_PROJECT_ID?.trim();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: projectId,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, 'server');

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
export default app;