# College RAG Bot - Complete Setup Guide

This guide will walk you through setting up and running the College RAG Bot from scratch.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - Check with: `python3 --version`
- **Node.js 16+** - Check with: `node --version`
- **npm** - Check with: `npm --version`
- **Ollama** - For running the local LLM

---

## Step 1: Install Ollama and Download the Model

### 1.1 Install Ollama

If you haven't installed Ollama yet:

1. Visit [https://ollama.com/](https://ollama.com/)
2. Download and install Ollama for macOS
3. Ollama will start automatically in the background

### 1.2 Check Installed Models

```bash
ollama list
```

You should see `phi3:mini` in the list. If not, pull it:

```bash
ollama pull phi3:mini
```

This will download the model (approximately 2.2 GB).

### 1.3 Verify Ollama is Running

```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with your installed models.

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd /Users/kishan/Documents/college_rag_bot/backend
```

### 2.2 Create Environment File

Copy the example environment file:

```bash
cp ../.env.example .env
```

### 2.3 Update the .env File

Open `.env` and ensure it has these settings:

```bash
# Backend Configuration
SECRET_KEY=your_super_secret_key_change_this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin Credentials (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin

# Paths
UPLOAD_DIR=../uploads
VECTOR_DB_DIR=../vector_db

# LLM Configuration
LLM_API_URL=http://localhost:11434/api/generate
LLM_MODEL_NAME=phi3:mini
```

**Important**: Make sure `LLM_MODEL_NAME` matches your installed Ollama model (use `ollama list` to check).

### 2.4 Install Python Dependencies

```bash
python3 -m pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn
- ChromaDB
- Sentence Transformers
- PDF processing libraries
- Authentication libraries
- And more...

**Note**: This may take several minutes as it downloads large packages like `scipy` and `scikit-learn`.

### 2.5 Start the Backend Server

```bash
python3 -m uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Keep this terminal window open!** The backend server needs to keep running.

---

## Step 3: Frontend Setup

### 3.1 Open a New Terminal Window

Keep the backend terminal running and open a new terminal.

### 3.2 Navigate to Frontend Directory

```bash
cd /Users/kishan/Documents/college_rag_bot/frontend
```

### 3.3 Install Node Dependencies

```bash
npm install
```

This will install:
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- And other frontend dependencies

### 3.4 Start the Frontend Server

```bash
npm run dev
```

You should see:
```
VITE v7.2.2  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Note**: If port 5173 is in use, Vite will automatically use port 5174.

**Keep this terminal window open too!** The frontend server needs to keep running.

---

## Step 4: Access the Application

Now you have both servers running:
- ✅ Backend: `http://127.0.0.1:8000`
- ✅ Frontend: `http://localhost:5173` (or `5174`)

### 4.1 Open Your Browser

Navigate to the frontend URL shown in your terminal (usually `http://localhost:5173` or `http://localhost:5174`).

### 4.2 Test the Chat Interface

1. Go to: `http://localhost:5173/chat` (or `5174`)
2. Type a question like: "What are the admission requirements?"
3. You should get a response (since no documents are uploaded, it will say it doesn't have the information)

### 4.3 Access the Admin Panel

1. Go to: `http://localhost:5173/admin/login` (or `5174`)
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin`
3. You should see the admin dashboard

---

## Step 5: Upload and Test Documents

### 5.1 Prepare a PDF Document

You need a PDF file with college-related information. You can:
- Create one yourself
- Use an existing college policy document
- Download a sample PDF

### 5.2 Upload via Admin Dashboard

1. In the admin dashboard, click "Choose File"
2. Select your PDF document
3. Enter a category (e.g., "Admissions", "Policies", etc.)
4. Click "Upload"
5. Wait for the processing to complete

### 5.3 Test the RAG System

1. Go back to the chat interface: `http://localhost:5173/chat`
2. Ask a question related to your uploaded document
3. The bot should now retrieve information from the document and provide an answer

---

## Troubleshooting

### Issue: "LLM Error" or "ensure the local LLM is running"

**Solution**:
1. Check if Ollama is running: `curl http://localhost:11434/api/tags`
2. Verify your model name in `.env` matches the installed model: `ollama list`
3. Restart the backend server

### Issue: Backend won't start - "ModuleNotFoundError"

**Solution**:
1. Make sure you're in the backend directory
2. Reinstall dependencies: `python3 -m pip install -r requirements.txt`
3. Check Python version: `python3 --version` (should be 3.9+)

### Issue: Frontend won't start - "npm command not found"

**Solution**:
1. Install Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Verify installation: `node --version` and `npm --version`
3. Try again: `npm install` then `npm run dev`

### Issue: Port already in use

**Solution**:
1. For backend (port 8000): Find and kill the process using `lsof -i :8000`
2. For frontend: Vite will automatically try another port (5174, 5175, etc.)

### Issue: Login fails with "Invalid credentials"

**Solution**:
1. Check your `backend/.env` file
2. Ensure `ADMIN_USERNAME=admin` and `ADMIN_PASSWORD=admin`
3. Restart the backend server

---

## Stopping the Servers

When you're done:

1. **Stop Backend**: Go to the backend terminal and press `Ctrl+C`
2. **Stop Frontend**: Go to the frontend terminal and press `Ctrl+C`

---

## Quick Start Script (Optional)

To make it easier, you can create a startup script. Create a file called `start.sh`:

```bash
#!/bin/bash

# Start backend in background
cd backend
python3 -m uvicorn main:app --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Servers are starting..."
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

Make it executable:
```bash
chmod +x start.sh
```

Run it:
```bash
./start.sh
```

---

## Summary of Commands

Here's a quick reference for running the project:

```bash
# Terminal 1 - Backend
cd /Users/kishan/Documents/college_rag_bot/backend
python3 -m uvicorn main:app --reload

# Terminal 2 - Frontend
cd /Users/kishan/Documents/college_rag_bot/frontend
npm run dev
```

Then open your browser to the frontend URL (shown in Terminal 2).

---

## Next Steps

- Upload college documents via the admin panel
- Test the RAG system with various queries
- Customize the admin credentials in `.env`
- Add more documents to improve the knowledge base

Enjoy using your College RAG Bot! 🎓🤖
