#!/bin/bash
# Simple AKY Media Application Startup Script

echo "🚀 Starting AKY Media Application..."

# Kill any existing process on port 4000
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Start with clean environment
exec env -i /bin/bash -l -c "cd $(pwd) && source .env && npm run dev"