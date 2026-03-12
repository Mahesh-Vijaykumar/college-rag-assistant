# Free Deployment Guide

This guide explains how to deploy the College RAG Support Bot for free using Render.

Since you want to deploy the application for free and it uses a local vector database (ChromaDB) and file storage, we have set up a multi-stage Dockerfile that runs both the React frontend and the FastAPI backend in a single container.

## Platform: Render (Free Tier)

Render provides a generous free tier for Web Services running Docker containers.

### Important Limitation of Free Deployment
Render's free tier uses an **ephemeral file system**. This means that when the application spins down (due to inactivity or during deployments), **all uploaded documents and the vector database will be lost**. You will need to re-upload the documents through the Admin panel after a restart. For persistent storage, you would need to upgrade to a paid Render plan to attach a Persistent Disk, or use an external Vector Database (like Pinecone) and S3 for file storage.

### Steps to Deploy

1. **Commit your code to GitHub**
   Ensure all changes, including the `Dockerfile` and `render.yaml`, are pushed to your GitHub repository.

2. **Sign up / Log in to Render**
   Go to [https://render.com/](https://render.com/) and create an account.

3. **Deploy from Blueprint (render.yaml)**
   - On the Render dashboard, click on **New** -> **Blueprint**.
   - Connect your GitHub account and select your repository.
   - Render will detect the `render.yaml` file.
   - Click **Apply**.

4. **Configure Secrets**
   Render will prompt you to provide the missing environment variables that were not committed for security reasons:
   - `GEMINI_API_KEY`: Your Google Gemini API Key. (Since the free tier won't support local LLM Ollama due to heavy resource usage, Gemini is highly recommended).
   - `ADMIN_PASSWORD`: The password you want to use for the Admin dashboard.

5. **Wait for Build**
   Render will build the Docker container (installing frontend dependencies, building React, installing Python dependencies) and then deploy the app.

6. **Access your App**
   Once deployed, Render will provide you with a `.onrender.com` URL. You can access the app at this URL.
   - The frontend will load on the main URL.
   - The Admin login is available at `/admin/login`.
   - The chat is available at `/chat`.

Enjoy your free deployment!
