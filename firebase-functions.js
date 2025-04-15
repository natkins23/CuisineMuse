import { onRequest } from "firebase-functions/v2/https";
import app from "./dist/index.js";

// Set NODE_ENV to production for the Firebase Functions environment
process.env.NODE_ENV = 'production';

// Export the Cloud Function named 'api'
export const api = onRequest({ 
  region: 'us-central1',
  memory: '1GiB',
  minInstances: 0,
  maxInstances: 10,
  timeoutSeconds: 60
}, app);