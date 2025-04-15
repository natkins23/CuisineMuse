#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Deploy to Firebase
echo "Deploying to Firebase..."
npx firebase deploy --only hosting,functions

echo "Deployment completed!"