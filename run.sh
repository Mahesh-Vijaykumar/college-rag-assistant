#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT

echo "Starting Backend..."
cd backend
source venv/bin/activate || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
uvicorn main:app --reload &
BACKEND_PID=$!
echo "Backend running on PID $BACKEND_PID"

echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend running on PID $FRONTEND_PID"

echo "Both servers are running. Press Ctrl+C to stop."
wait
