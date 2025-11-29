# 🚀 Quick Deployment Checklist

Use this checklist to deploy your College RAG Bot to production.

## ✅ Pre-Deployment

- [ ] Verify `.gitignore` excludes sensitive files (`.env`, `uploads/`, `vector_db/`)
- [ ] Generate strong `SECRET_KEY`: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] Create strong admin password
- [ ] Get Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] Commit all changes: `git add . && git commit -m "Prepare for deployment" && git push`

## 🖥️ Backend (Render)

- [ ] Create account at [render.com](https://render.com)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure service:
  - Root Directory: `backend`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables (see `.env.production`)
  - [ ] `SECRET_KEY`
  - [ ] `ADMIN_USERNAME` and `ADMIN_PASSWORD`
  - [ ] `GEMINI_API_KEY`
  - [ ] `LLM_PROVIDER=gemini`
  - [ ] `ALLOWED_ORIGINS` (update after Vercel deployment)
- [ ] Add persistent disk (optional, 1GB free)
- [ ] Deploy and wait for build
- [ ] Save backend URL: `https://__________.onrender.com`
- [ ] Test: Visit backend URL, should see `{"message": "College RAG Bot API is running"}`

## 🌐 Frontend (Vercel)

- [ ] Create account at [vercel.com](https://vercel.com)
- [ ] Import project from GitHub
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL` = Your Render backend URL
- [ ] Deploy and wait for build
- [ ] Save frontend URL: `https://__________.vercel.app`

## 🔧 Post-Deployment

- [ ] Update `ALLOWED_ORIGINS` in Render with Vercel URL
- [ ] Redeploy backend (automatic after env var change)
- [ ] Test admin login at `https://your-app.vercel.app/admin/login`
- [ ] Upload a test document
- [ ] Test chat at `https://your-app.vercel.app/chat`
- [ ] Check browser console for errors (F12)

## 🎉 Success Criteria

- ✅ Backend responds at root endpoint
- ✅ Frontend loads without errors
- ✅ Admin login works
- ✅ Document upload works
- ✅ Chat responds with Gemini
- ✅ No CORS errors in console

---

**Need detailed instructions?** See [DEPLOYMENT_GUIDE.md](file:///Users/kishan/Documents/college_rag_bot/DEPLOYMENT_GUIDE.md)
