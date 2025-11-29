from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import admin, chat
from config import settings
from middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware
import logging

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

@app.get("/")
async def root():
    return {"message": "College RAG Bot API is running"}

