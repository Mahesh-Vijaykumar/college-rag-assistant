import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
    
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "../uploads")
    VECTOR_DB_DIR = os.getenv("VECTOR_DB_DIR", "../vector_db")
    
    LLM_API_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
    LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "phi3.5")

    # Ensure directories exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(VECTOR_DB_DIR, exist_ok=True)

settings = Settings()
