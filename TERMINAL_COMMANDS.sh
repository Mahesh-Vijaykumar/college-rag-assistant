#!/bin/bash
# College RAG Bot - Terminal Commands with Virtual Environment
# Copy and paste these commands in order

# ============================================
# STEP 1: VERIFY PREREQUISITES
# ============================================

# Check Python version (should be 3.9+)
python3 --version

# Check Node.js version (should be 16+)
node --version

# Check npm
npm --version

# Check if Ollama is installed
which ollama

# ============================================
# STEP 2: SETUP OLLAMA
# ============================================

# List installed Ollama models
ollama list

# If phi3:mini is not installed, pull it (this will take a few minutes)
# ollama pull phi3:mini

# Verify Ollama is running
curl http://localhost:11434/api/tags

# ============================================
# STEP 3: PROJECT SETUP WITH VIRTUAL ENVIRONMENT
# ============================================

# Navigate to the project root directory
cd /Users/kishan/Documents/college_rag_bot

# Create a virtual environment in the root folder
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# You should see (venv) in your terminal prompt now

# Install Python dependencies from root requirements.txt
pip install -r requirements.txt

# Create .env file in backend (if not exists)
cp .env.example backend/.env

# ============================================
# STEP 4: START BACKEND SERVER
# ============================================

# Navigate to backend directory (while venv is still active)
cd backend

# Start the backend server (keep this terminal open)
uvicorn main:app --reload

# You should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
# INFO:     Application startup complete.

# ============================================
# STEP 5: FRONTEND SETUP (NEW TERMINAL)
# ============================================

# Open a NEW terminal window and run these commands:

# Navigate to the project root directory
cd /Users/kishan/Documents/college_rag_bot

# Navigate to frontend
cd frontend

# Install Node dependencies (if not already done)
npm install

# Start the frontend server (keep this terminal open)
npm run dev

# You should see:
# VITE v7.2.2  ready in XXX ms
# ➜  Local:   http://localhost:5173/

# ============================================
# STEP 6: ACCESS THE APPLICATION
# ============================================

# Open your browser and go to:
# http://localhost:5173/chat          (Public chat)
# http://localhost:5174/chat          (If port 5173 was in use)

# Admin panel:
# http://localhost:5173/admin/login   (Login: admin/admin)
# http://localhost:5174/admin/login   (If port 5173 was in use)

# ============================================
# STOPPING THE SERVERS
# ============================================

# Backend terminal: Press Ctrl+C, then:
deactivate

# Frontend terminal: Press Ctrl+C

# ============================================
# RESTARTING LATER (IMPORTANT!)
# ============================================

# When you want to run the project again:

# Terminal 1 - Backend:
cd /Users/kishan/Documents/college_rag_bot
source venv/bin/activate
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend:
cd /Users/kishan/Documents/college_rag_bot/frontend
npm run dev
