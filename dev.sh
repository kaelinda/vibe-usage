#!/bin/bash
# Dev script for VibeUsage
# Runs electron-vite dev and copies output to dist/

# Start electron-vite dev in background
npx electron-vite dev &
VITE_PID=$!

# Wait for build to complete
sleep 15

# Copy output files to dist
cp -r out/* dist/

echo "Files copied to dist/"

# Wait for electron-vite to exit or user to ctrl-c
wait $VITE_PID
