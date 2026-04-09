#!/bin/bash

# Vercel Deployment Script for SoilSense Project
# This script automates the deployment process to Vercel

echo "🚀 Starting SoilSense deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"

    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod

    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌍 Your app is now live on Vercel!"
    else
        echo "❌ Deployment failed. Please check your Vercel configuration."
        exit 1
    fi
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "📋 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Set up Firebase credentials"
echo "3. Test the deployed application"
echo "4. Share the live URL with stakeholders"