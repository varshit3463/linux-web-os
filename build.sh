#!/bin/sh
# Custom build script for Vercel to bypass permission issues
echo "Installing dependencies..."
npm install

echo "Building with node directly..."
node node_modules/vite/bin/vite.js build

echo "Build complete!"
