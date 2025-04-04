import * as admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';

// Initialize Firebase Admin SDK
// Note: In Replit, we can use the FIREBASE_SERVICE_ACCOUNT environment variable
// which contains the service account key JSON
let serviceAccount;

try {
  // Try to parse the service account from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // For development, fall back to auto-initialization
    console.warn("FIREBASE_SERVICE_ACCOUNT not found, using application default credentials");
  }
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
}

// Initialize the app if it hasn't been initialized already
if (!admin.apps.length) {
  const config: admin.AppOptions = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  };
  
  if (serviceAccount) {
    config.credential = admin.credential.cert(serviceAccount);
  }
  
  admin.initializeApp(config);
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