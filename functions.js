// Firebase Functions config
export const config = {
  region: 'us-central1',
};

// Export the functions for deployment
export { default as api } from './dist/index.js';