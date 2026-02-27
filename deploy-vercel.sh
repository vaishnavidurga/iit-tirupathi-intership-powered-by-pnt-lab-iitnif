#!/usr/bin/env bash
set -euo pipefail

# deploy-vercel.sh
# Simple helper to build and deploy this project to Vercel using the Vercel CLI and an env token.
# Usage:
#   VERCEL_TOKEN=your_token bash deploy-vercel.sh
# Or export VERCEL_TOKEN first:
#   export VERCEL_TOKEN=your_token
#   bash deploy-vercel.sh

# Check for token
if [ -z "${VERCEL_TOKEN-}" ]; then
  echo "ERROR: VERCEL_TOKEN environment variable not set. Create a Vercel token and set VERCEL_TOKEN before running."
  echo "See: https://vercel.com/account/tokens"
  exit 1
fi

echo "Installing dependencies (production-ish)..."
npm ci

echo "Building project..."
npm run build

echo "Deploying to Vercel (production)..."
# --confirm prevents confirmation prompts, --prod makes a production deployment
npx vercel --prod --yes --token "$VERCEL_TOKEN"

echo "Deployment finished. If the CLI output included a URL, open it to view the production site." 
