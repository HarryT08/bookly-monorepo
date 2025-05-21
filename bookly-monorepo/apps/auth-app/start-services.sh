#!/bin/bash

# Script to start all auth-app microservices together

# Initialize NVM
source ~/.nvm/nvm.sh
nvm use v22.12.0

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to start a service in the background
start_service() {
  local service_name=$1
  local port=$2
  echo "Starting $service_name on port $port..."
  
  cd "$SCRIPT_DIR/$service_name"
  npx nx serve $service_name &
  echo "$service_name started with PID $!"
  echo "$!" > "$SCRIPT_DIR/$service_name.pid"
}

# Start all services
start_service "auth-service" 3000
start_service "users-service" 3001
start_service "roles-service" 3002

echo "All services started. Press Ctrl+C to stop all services."

# Function to clean up on exit
cleanup() {
  echo "Stopping all services..."
  for service in auth-service users-service roles-service; do
    if [ -f "$SCRIPT_DIR/$service.pid" ]; then
      pid=$(cat "$SCRIPT_DIR/$service.pid")
      echo "Stopping $service (PID: $pid)"
      kill -15 "$pid" 2>/dev/null
      rm "$SCRIPT_DIR/$service.pid"
    fi
  done
  echo "All services stopped."
  exit 0
}

# Set up trap for SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait indefinitely
while true; do
  sleep 1
done
