#!/bin/bash
# AKY Media Application Startup Script
# Ensures clean environment and proper MongoDB connection

echo "🚀 AKY Media Application Startup"
echo "================================="

# Function to kill any existing processes on port 4000
kill_port_process() {
  local port=4000
  local pid=$(lsof -ti:$port)
  if [ ! -z "$pid" ]; then
    echo "⚠️  Killing existing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null || true
    sleep 2
  fi
}

# Kill any existing processes
kill_port_process

# Start with clean environment
echo "🔧 Setting up clean environment..."
CLEAN_ENV="env -i /bin/bash -l -c \"
  cd $(pwd) && 
  source .env && 
  echo '✅ Environment variables loaded from .env' &&
  echo '   MONGODB_URI: $MONGODB_URI' &&
  npm run dev
\""

echo "🌐 Starting development server..."
eval $CLEAN_ENV &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 15

# Verify server is running
if curl -s http://localhost:4000/api/broadcast/status | grep -q '"success":true\|"isActive"'; then
  echo "✅ Server is running successfully!"
  echo "🔗 Access your application at: http://localhost:4000"
  echo "📺 Broadcast Admin: http://localhost:4000/broadcast-admin/login"
  echo "🎥 Live Stream: http://localhost:4000/live"
  
  # Show server status
  echo
  echo "📊 Server Status:"
  curl -s http://localhost:4000/api/broadcast/status | jq '.health, .connectionQuality' 2>/dev/null || echo "   Health: Check API response above"
else
  echo "❌ Server failed to start properly"
  echo "📋 Check the logs above for errors"
fi

echo
echo "💡 To stop the server, press Ctrl+C or run: kill-port 4000"