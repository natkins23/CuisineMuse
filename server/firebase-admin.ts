import admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';

// Initialize Firebase Admin SDK
// Let's make Firebase configuration more resilient
// We'll use a simplified approach without relying on service account JSON parsing

// Initialize the app with project ID and default credentials
try {
  // Check if we already have an initialized app
  try {
    admin.app();
    console.log("Firebase Admin SDK already initialized");
  } catch (e) {
    // App not initialized, let's initialize it
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin SDK initialized successfully");
  }
} catch (error: any) {
  console.error("Error initializing Firebase Admin:", error);
}

// Export the admin SDK
export default admin;

/**
 * Express middleware to verify Firebase ID tokens
 */
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No valid token provided' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add the user to the request object
    (req as any).user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}