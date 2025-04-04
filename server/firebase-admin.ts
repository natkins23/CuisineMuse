import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Initialize Firebase Admin SDK
// Note: In production, we would use environment variables or secret manager
// for the firebase project configuration
if (!admin.apps.length) {
  admin.initializeApp({
    // In a production environment, you'd use secure environment variables
    // and automated certificate management
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    credential: admin.credential.applicationDefault(),
  });
}

/**
 * Express middleware to verify Firebase ID tokens
 */
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid auth token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach the verified user to the request
    return next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

export default admin;