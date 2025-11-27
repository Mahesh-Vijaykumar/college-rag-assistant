# College RAG Support Bot

A powerful, local-first RAG (Retrieval-Augmented Generation) chat support system for colleges. It features a public chat interface for students and a secure admin panel for staff to manage documents.

Built with **FastAPI**, **React**, **ChromaDB**, and supports **Multi-LLM Switching** (Local Ollama or Google Gemini).

---

## 🚀 Features

-   **RAG Pipeline**: Accurate answers based *only* on uploaded documents.
-   **Multi-LLM Support**: Seamlessly switch between **Local LLM (Ollama)** for privacy and **Google Gemini** for cloud performance.
-   **Admin Panel**: Secure login to upload, view, and delete PDF documents.
-   **Two-Stage Retrieval**: Advanced semantic search with reranking for high accuracy.
-   **Modern UI**: Responsive React frontend with a clean chat interface.

---

## 📋 Prerequisites

-   **Python 3.9+**
-   **Node.js 16+**
-   **Ollama** (Required only if using Local LLM)
-   **Gemini API Key** (Required only if using Gemini)

---

## 🛠️ Installation

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    ```bash
    cp ../.env.example .env
    ```
    Open `.env` and configure your settings (see [Configuration](#-configuration) below).

### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

---

## ⚙️ Configuration & LLM Switching

The system supports two LLM providers. You control which one is used via the `LLM_PROVIDER` variable in `backend/.env`.

### **Option A: Use Google Gemini (Cloud)**
*Recommended for speed and performance without local hardware requirements.*

1.  Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2.  Open `backend/.env` and set:
    ```bash
    LLM_PROVIDER=gemini
    GEMINI_API_KEY=your_actual_api_key_here
    ```
3.  **Restart the backend server** for changes to take effect.

### **Option B: Use Local LLM (Ollama)**
*Recommended for complete privacy and offline capability.*

1.  Install [Ollama](https://ollama.com/).
2.  Pull the model (e.g., phi3:mini):
    ```bash
    ollama pull phi3:mini
    ```
3.  Open `backend/.env` and set:
    ```bash
    LLM_PROVIDER=local
    # LLM_API_URL=http://localhost:11434/api/generate (Default)
    ```
4.  **Restart the backend server** for changes to take effect.

> **Note:** The system uses **only one** provider at a time. If `LLM_PROVIDER` is missing or invalid, it defaults to `local`.

---

## ▶️ Running the Application

You need to run both the backend and frontend servers.

### 1. Start Backend
In a terminal (ensure venv is active):
```bash
cd backend
uvicorn main:app --reload --port 8000
```
*Server running at: `http://localhost:8000`*

### 2. Start Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
*UI running at: `http://localhost:5173`*

---

## 📖 Usage Guide

### Admin Panel (Document Management)
1.  Go to `http://localhost:5173/admin/login`.
2.  Login with default credentials:
    -   **Username**: `admin`
    -   **Password**: `admin`
    *(Change these in `.env` for production)*
3.  **Upload**: Drag & drop PDF documents (e.g., "College Handbook.pdf").
4.  **Manage**: View uploaded files or delete outdated ones.

### Public Chat
1.  Go to `http://localhost:5173/chat`.
2.  Ask questions like *"What is the fee structure?"* or *"When are the exams?"*.
3.  The bot will answer using **only** the information found in your uploaded documents.

---

## ❓ Troubleshooting

-   **"Please ensure the local LLM is running" Error**:
    -   If using **Local**: Ensure Ollama is running (`ollama serve`).
    -   If using **Gemini**: Check that `LLM_PROVIDER=gemini` is set in `.env` and you have **restarted** the backend.

-   **Gemini 404 Error**:
    -   Ensure you are using a valid model name. The system defaults to `gemini-2.0-flash`.

-   **Upload Failed**:
    -   Check if the `uploads` and `vector_db` folders exist in the project root. The backend attempts to create them, but permissions might block it.

-   **Frontend Connection Error**:
    -   Ensure the backend is running on port `8000`.
