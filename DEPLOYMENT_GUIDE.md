# 🚀 Deployment Guide: College RAG Bot

This guide provides step-by-step instructions to deploy your College RAG Bot to production using:
- **Vercel** for the React frontend
- **Render** for the FastAPI backend

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

### 1. **Prepare Your GitHub Repository**

> [!IMPORTANT]
> Ensure your `.gitignore` is properly configured to exclude sensitive files.

**Files that MUST be in `.gitignore`:**
- ✅ `.env` and `backend/.env` (already configured)
- ✅ `venv/` and `featvenv/` (already configured)
- ✅ `uploads/` and `vector_db/` (already configured)
- ✅ `node_modules/` (already configured)

**Verify your repository is clean:**
```bash
cd /Users/kishan/Documents/college_rag_bot
git status
```

### 2. **Commit and Push to GitHub**

If you have uncommitted changes:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

> [!NOTE]
> Replace `main` with your branch name if different (e.g., `master`).

### 3. **Generate Strong Secrets**

You'll need these for environment variables:

```bash
# Generate a strong SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate a strong admin password (or create your own)
python3 -c "import secrets; print(secrets.token_urlsafe(16))"
```

**Save these values** - you'll need them for Render configuration.

---

## 🖥️ Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up or log in with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `college_rag_bot`
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `college-rag-bot-backend` (or your choice) |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### Step 3: Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add the following:

| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | `<generated-secret-key>` | Use the key generated earlier |
| `ALGORITHM` | `HS256` | Keep default |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Adjust as needed |
| `ADMIN_USERNAME` | `admin` | Change to your preferred username |
| `ADMIN_PASSWORD` | `<your-secure-password>` | Use strong password |
| `UPLOAD_DIR` | `/opt/render/project/src/uploads` | Render's persistent storage path |
| `VECTOR_DB_DIR` | `/opt/render/project/src/vector_db` | Render's persistent storage path |
| `LLM_PROVIDER` | `gemini` | **IMPORTANT: Must use `gemini`** |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` | Get from Google AI Studio |
| `LLM_API_URL` | `http://localhost:11434/api/generate` | Not used with Gemini |
| `LLM_MODEL_NAME` | `phi3.5` | Not used with Gemini |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | **Update after Vercel deployment** |
| `PYTHON_VERSION` | `3.11.0` | Specify Python version |

> [!WARNING]
> **Local LLM (Ollama) will NOT work on Render.** You MUST use `LLM_PROVIDER=gemini` and provide a valid `GEMINI_API_KEY`.

### Step 4: Add Persistent Disk (Optional but Recommended)

1. Scroll to **"Disk"** section
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB (free tier) or more

> [!NOTE]
> This ensures uploaded documents and vector database persist across deployments.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://college-rag-bot-backend.onrender.com`

### Step 6: Verify Backend

Open your backend URL in a browser:
```
https://your-backend-url.onrender.com
```

You should see:
```json
{"message": "College RAG Bot API is running"}
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update Frontend API Configuration

**BEFORE deploying to Vercel**, update the API URL in your frontend:

1. Open [`frontend/src/api.js`](file:///Users/kishan/Documents/college_rag_bot/frontend/src/api.js)
2. Change line 3:

```javascript
// BEFORE (local development)
const API_URL = 'http://localhost:8000';

// AFTER (production)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

This allows you to set the backend URL via environment variable.

### Step 2: Commit the Change

```bash
cd /Users/kishan/Documents/college_rag_bot
git add frontend/src/api.js
git commit -m "Update API URL for production deployment"
git push origin main
```

### Step 3: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account
3. Authorize Vercel to access your repositories

### Step 4: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your repository: `college_rag_bot`
3. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 5: Configure Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` |

> [!IMPORTANT]
> Replace `your-backend-url.onrender.com` with your actual Render backend URL from Step 6 of Backend Deployment.

### Step 6: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://college-rag-bot.vercel.app`

---

## 🔧 Post-Deployment Configuration

### Update CORS Settings on Backend

Now that you have your Vercel URL, update the backend CORS settings:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Update `ALLOWED_ORIGINS`:

```
https://your-app.vercel.app,https://your-app-*.vercel.app
```

> [!TIP]
> The wildcard pattern `https://your-app-*.vercel.app` allows preview deployments to work.

5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## ✅ Verification & Testing

### 1. Test Backend API

```bash
# Test root endpoint
curl https://your-backend-url.onrender.com

# Expected response:
# {"message":"College RAG Bot API is running"}
```

### 2. Test Frontend

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Navigate to **Admin Login** (`/admin/login`)
3. Log in with your credentials
4. Try uploading a test document
5. Navigate to **Chat** (`/chat`)
6. Ask a test question

### 3. Check Browser Console

Open Developer Tools (F12) and check for:
- ✅ No CORS errors
- ✅ API requests going to correct backend URL
- ✅ Successful authentication

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest at 'https://backend.onrender.com' from origin 'https://app.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Verify `ALLOWED_ORIGINS` in Render includes your Vercel URL
2. Ensure no trailing slashes in URLs
3. Redeploy backend after changes

### Issue: 401 Unauthorized Errors

**Symptoms:**
- Can't log in to admin panel
- All API requests return 401

**Solution:**
1. Verify `SECRET_KEY` is set in Render environment variables
2. Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` are correct
3. Clear browser localStorage and try again

### Issue: Backend Build Fails

**Symptoms:**
- Render build fails with dependency errors

**Solution:**
1. Ensure `requirements.txt` is in backend directory
2. Build command should be: `pip install -r requirements.txt`
3. Check Python version is set to 3.11.0

### Issue: Frontend Shows "Network Error"

**Symptoms:**
- Chat doesn't work
- Document upload fails

**Solution:**
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check backend is running (visit backend URL)
3. Verify CORS settings

### Issue: Gemini API Errors

**Symptoms:**
- Chat returns errors about API key
- "API key not valid" errors

**Solution:**
1. Get a valid API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Update `GEMINI_API_KEY` in Render environment variables
3. Ensure `LLM_PROVIDER=gemini` is set

### Issue: Uploaded Documents Don't Persist

**Symptoms:**
- Documents disappear after redeployment

**Solution:**
1. Add a persistent disk in Render (see Backend Step 4)
2. Update `UPLOAD_DIR` and `VECTOR_DB_DIR` to use disk mount path

---

## 📝 Important Notes

### What to Keep the Same

✅ **Keep these files as-is:**
- All Python backend code
- All React frontend code
- `requirements.txt`
- `package.json`
- `.gitignore`

### What to Change

🔧 **Must change:**
- `frontend/src/api.js` - Update API_URL to use environment variable
- Environment variables in Render (backend)
- Environment variables in Vercel (frontend)
- `ALLOWED_ORIGINS` after getting Vercel URL

### What NOT to Put Where

❌ **Never commit to Git:**
- `.env` files
- API keys or secrets
- `uploads/` directory
- `vector_db/` directory
- `node_modules/`
- Virtual environments

❌ **Don't set in frontend:**
- Backend secrets (SECRET_KEY, ADMIN_PASSWORD)
- Gemini API key (only in backend)

✅ **Only set in backend (Render):**
- All authentication secrets
- Database paths
- LLM configuration
- CORS origins

✅ **Only set in frontend (Vercel):**
- `VITE_API_URL` (backend URL)

---

## 🎉 Success!

Once everything is deployed and verified:

1. **Share your app**: `https://your-app.vercel.app`
2. **Admin panel**: `https://your-app.vercel.app/admin/login`
3. **Chat interface**: `https://your-app.vercel.app/chat`

### Next Steps

- Set up custom domain (optional)
- Configure monitoring and alerts
- Set up automated backups for vector database
- Implement rate limiting for production use

---

## 📞 Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Happy Deploying! 🚀**
