import os
import secrets
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class Settings:
    # Generate strong SECRET_KEY if not provided
    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY or SECRET_KEY == "supersecretkey":
        # Generate a strong random secret key
        SECRET_KEY = secrets.token_urlsafe(32)
        print("WARNING: Using generated SECRET_KEY. Set SECRET_KEY in .env for production!")
    
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    
    # Admin credentials
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    _ADMIN_PASSWORD_PLAIN = os.getenv("ADMIN_PASSWORD", "admin")
    
    # Hash the admin password on startup
    ADMIN_PASSWORD_HASH = pwd_context.hash(_ADMIN_PASSWORD_PLAIN)
    
    # For backward compatibility during login check
    ADMIN_PASSWORD = _ADMIN_PASSWORD_PLAIN
    
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "../uploads")
    VECTOR_DB_DIR = os.getenv("VECTOR_DB_DIR", "../vector_db")
    
    LLM_API_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
    LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "phi3.5")
    
    # LLM Switching
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "local")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # Gemini API Configuration
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_RATE_LIMIT_DELAY = float(os.getenv("GEMINI_RATE_LIMIT_DELAY", "1.0"))  # Seconds between requests
    GEMINI_MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", "5"))
    
    # CORS Settings - restrict to specific origins in production
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:3000").split(",")

    # Ensure directories exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(VECTOR_DB_DIR, exist_ok=True)

settings = Settings()

