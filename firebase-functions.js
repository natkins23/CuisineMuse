import { onRequest } from 'firebase-functions/v2/https';
import { app } from './dist/index.js';

// Create a Cloud Function named 'api'
export const api = onRequest({ 
  region: 'us-central1',
  memory: '1GiB',
  minInstances: 0,
  maxInstances: 10,
}, app);