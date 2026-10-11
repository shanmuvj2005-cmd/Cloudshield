#!/usr/bin/env bash
echo "======================================================================"
echo "         CloudShield - AI Insider Threat Detection Platform           "
echo "======================================================================"

# Start backend
echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "[2/2] Starting React Vite Frontend on http://localhost:5173 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo "CloudShield is running!"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://127.0.0.1:8000/docs"
echo "Demo Login: admin / cloudshield2026"
wait
