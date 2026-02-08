#!/bin/bash
echo "Starting DSA Platform..."

# Kill any existing processes on ports
echo "Cleaning up ports..."
lsof -t -i:5001 | xargs kill -9 2>/dev/null
lsof -t -i:3000 | xargs kill -9 2>/dev/null

# Start Backend
echo "Starting Backend (Port 5001)..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend (Port 3000)..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo "DSA Platform is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo "Press CTRL+C to stop both servers."

trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
