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

### Getting Started

The application has three main interfaces:
1. **Landing Page** - Introduction and navigation hub
2. **Admin Portal** - Document management for administrators
3. **Chat Interface** - Public chat for asking questions

### 🏠 Landing Page

1. Navigate to `http://localhost:5173/`
2. You'll see the **Genesis AI RAG** landing page with two options:
   - **Try Now** - Go directly to the chat interface
   - **Admin Login** - Access the admin portal to manage documents

### 🔐 Admin Portal (Document Management)

**Important:** You must upload documents through the admin portal before the chat can provide context-relevant answers. Without uploaded documents, the system has no knowledge base to draw from.

#### Step 1: Login
1. Click **Admin Login** from the landing page, or navigate to `http://localhost:5173/admin/login`
2. Enter the default credentials:
   - **Username**: `admin`
   - **Password**: `admin`
   
   > ⚠️ **Security Note**: Change these credentials in `backend/.env` for production use

#### Step 2: Upload Documents
1. After logging in, you'll see the **Admin Dashboard** with a sidebar
2. Click **Upload Documents** in the sidebar (or it may be the default view)
3. **Upload your PDF documents** using one of these methods:
   - **Drag & Drop**: Drag PDF files into the upload area
   - **Click to Browse**: Click the upload area to select files from your computer
4. **Select a Category** for each document (helps with organization):
   - Syllabus
   - Research Paper
   - Policy
   - Lecture Notes
   - General
5. Click **Upload** to process the document
6. Wait for the upload to complete (you'll see a success notification)

> 💡 **Tip**: Upload all relevant documents (handbooks, policies, FAQs, syllabi, etc.) to build a comprehensive knowledge base for accurate answers.

#### Step 3: Manage Documents
1. Click **Manage Documents** in the sidebar to view all uploaded documents
2. Features available:
   - **Search**: Filter documents by filename
   - **Category Filter**: View documents by category
   - **Delete**: Remove outdated or incorrect documents
3. Each document shows:
   - Filename
   - Category
   - Upload date/time
   - Delete action

### 💬 Public Chat Interface

**Prerequisites:** Ensure you have uploaded relevant documents through the Admin Portal first. The chat can only answer questions based on the uploaded documents.

#### Using the Chat
1. Navigate to `http://localhost:5173/chat` or click **Try Now** from the landing page
2. You'll see:
   - **FAQ Sidebar** (left): Click any question to auto-fill the input
   - **Chat Area** (center): Conversation history
   - **Input Box** (bottom): Type your questions here

#### Asking Questions
1. Type your question in the input box (e.g., "What is the admission process?")
2. Press **Enter** or click the **Send** button
3. The system will:
   - Search through uploaded documents for relevant information
   - Use RAG (Retrieval-Augmented Generation) to generate an accurate answer
   - Display the response with:
     - **RAG Tag**: Indicates the answer is based on retrieved documents
     - **Source Citations**: Shows which documents were used (if available)

#### Understanding Responses
- **RAG Responses**: Answers based on your uploaded documents (most accurate)
- **LLM Responses**: General knowledge responses (when no relevant documents are found)
- **Source Citations**: Click to see which documents were referenced

#### Example Questions
- "What are the admission requirements?"
- "When is the registration deadline?"
- "What is the fee structure for undergraduate programs?"
- "How do I apply for a scholarship?"
- "What are the campus facilities?"

> 📌 **Note**: The quality and accuracy of answers depend on the documents you've uploaded. Upload comprehensive, well-organized documents for best results.

### 🔄 Complete Workflow Example

1. **Admin uploads documents**:
   - Login to admin portal
   - Upload "Student Handbook.pdf" (Category: Policy)
   - Upload "Course Syllabus 2024.pdf" (Category: Syllabus)
   - Upload "Admission Guide.pdf" (Category: General)

2. **Student asks questions**:
   - Go to chat interface
   - Ask: "What documents do I need for admission?"
   - System retrieves relevant sections from "Admission Guide.pdf"
   - Provides accurate answer with source citation

3. **Admin maintains knowledge base**:
   - Regularly update documents when policies change
   - Delete outdated documents
   - Add new documents as they become available

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
