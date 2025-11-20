# College RAG Support Bot

A local RAG-based chat support system for colleges, featuring a public chat interface and an admin panel for document management. Built with FastAPI, React, ChromaDB, and local LLMs (phi3:mini).

## Prerequisites

- **Python 3.9+**
- **Node.js 16+**
- **Ollama** (for running local LLM)

## Setup Instructions

### 1. Install and Run Ollama

1.  Download and install [Ollama](https://ollama.com/).
2.  Pull the phi3:mini model:
    ```bash
    ollama pull phi3:mini
    ```
3.  Start the Ollama server (usually runs automatically in background).

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create `.env` file:
    ```bash
    cp ../.env.example .env
    ```
    (Optional: Update `.env` with your own secret key or credentials)

5.  Start the Backend Server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
    The UI will be available at `http://localhost:5173`.

## Usage

### Admin Panel
1.  Go to `http://localhost:5173/admin/login`.
2.  Login with default credentials:
    - **Username**: `admin`
    - **Password**: `admin`
3.  Upload PDF documents (e.g., college policies, event schedules).
4.  View and manage uploaded documents.

### Public Chat
1.  Go to `http://localhost:5173/chat`.
2.  Ask questions related to the uploaded documents.
3.  The bot will answer using the context from the documents.

## Troubleshooting

- **LLM Error**: Ensure Ollama is running and `phi3:mini` model is pulled. Check `LLM_API_URL` in `.env`.
- **Upload Error**: Ensure `uploads` and `vector_db` directories exist (created automatically by backend).
- **Permission Denied (npm)**: If you encounter permission errors during `npm install`, try using a different directory or checking your Node.js installation permissions.
