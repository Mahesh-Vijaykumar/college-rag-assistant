from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import admin, chat
from config import settings
from middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware
import logging
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="College RAG Support Bot")

# CORS Configuration - Hardened for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Specific origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PUT"],
    allow_headers=["*"],
)

# Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Include Routers
app.include_router(admin.router)
app.include_router(chat.router)

# Mount frontend static files
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Serve index.html for all other routes to support React Router
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow frontend routes like /admin/login or /chat to be handled by React Router
        # API requests should already be caught by the included routers above this catch-all
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"message": "College RAG Bot API is running. Frontend static files not found."}

