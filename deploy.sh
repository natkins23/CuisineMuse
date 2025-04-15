#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Deploy only the hosting part to Firebase
echo "Deploying to Firebase Hosting..."
npx firebase deploy --only hosting --token "$FIREBASE_TOKEN"

echo "Deployment complete!"
echo "Your application is available at: https://culinarymuse-66553.web.app"