#!/bin/bash
# Test with a clean environment

# Unset all MONGODB related environment variables
unset MONGODB_URI

# Load only the .env file we want
export $(grep -v '^#' .env | xargs)

echo "MONGODB_URI from .env:"
echo $MONGODB_URI

# Start the development server
npm run dev