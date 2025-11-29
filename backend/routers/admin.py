import os
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from typing import List
from auth import (
    create_access_token, 
    create_refresh_token,
    verify_refresh_token,
    get_current_admin, 
    verify_password, 
    get_password_hash,
    revoke_token
)
from models import UserLogin, Token, TokenResponse, RefreshToken, DocumentMetadata
from config import settings
from rag_engine import process_and_store_document, get_collection
from middleware import login_rate_limiter, log_security_event

router = APIRouter(prefix="/admin", tags=["admin"])

def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, request: Request):
    """
    Admin login endpoint with rate limiting and security logging.
    """
    client_ip = get_client_ip(request)
    
    # Check rate limit
    login_rate_limiter.check_rate_limit(request)
    
    # Verify credentials using hashed password
    is_valid = (
        user.username == settings.ADMIN_USERNAME and 
        verify_password(user.password, settings.ADMIN_PASSWORD_HASH)
    )
    
    if not is_valid:
        # Record failed attempt
        login_rate_limiter.record_attempt(request, success=False)
        
        # Log security event
        log_security_event(
            event_type="LOGIN_FAILED",
            username=user.username,
            ip_address=client_ip,
            details="Invalid credentials"
        )
        
        # Generic error message to avoid username enumeration
        raise HTTPException(
            status_code=401, 
            detail="Invalid credentials"
        )
    
    # Record successful attempt
    login_rate_limiter.record_attempt(request, success=True)
    
    # Log security event
    log_security_event(
        event_type="LOGIN_SUCCESS",
        username=user.username,
        ip_address=client_ip
    )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_data: RefreshToken, request: Request):
    """
    Refresh access token using refresh token.
    """
    client_ip = get_client_ip(request)
    
    try:
        # Verify refresh token and get username
        username = verify_refresh_token(refresh_data.refresh_token)
        
        # Create new access token
        access_token = create_access_token(data={"sub": username})
        
        log_security_event(
            event_type="TOKEN_REFRESH",
            username=username,
            ip_address=client_ip
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        log_security_event(
            event_type="TOKEN_REFRESH_FAILED",
            ip_address=client_ip,
            details="Invalid refresh token"
        )
        raise

@router.post("/logout")
async def logout(
    refresh_data: RefreshToken,
    request: Request,
    current_user: dict = Depends(get_current_admin)
):
    """
    Logout endpoint - revokes refresh token.
    """
    client_ip = get_client_ip(request)
    
    # Revoke the refresh token
    revoke_token(refresh_data.refresh_token)
    
    log_security_event(
        event_type="LOGOUT",
        username=current_user.username,
        ip_address=client_ip
    )
    
    return {"message": "Logged out successfully"}

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("General"),
    current_user: dict = Depends(get_current_admin)
):
    """Upload and process PDF document."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Process document
    try:
        process_and_store_document(file_path, file.filename, category)
    except Exception as e:
        os.remove(file_path) # Cleanup on failure
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
        
    return {"message": "Document uploaded and processed successfully", "filename": file.filename}

@router.get("/documents", response_model=List[DocumentMetadata])
async def list_documents(current_user: dict = Depends(get_current_admin)):
    """List all uploaded documents."""
    collection = get_collection()
    # ChromaDB doesn't support "select distinct" easily, so we fetch all and deduplicate in python
    # This is inefficient for large datasets but fine for this scale
    result = collection.get()
    
    if not result['metadatas']:
        return []
        
    seen_files = set()
    documents = []
    
    for meta in result['metadatas']:
        if meta['filename'] not in seen_files:
            seen_files.add(meta['filename'])
            documents.append(DocumentMetadata(
                id=meta.get('filename'), # Using filename as ID for simplicity in this scope
                filename=meta.get('filename'),
                category=meta.get('category', 'General'),
                upload_time=meta.get('timestamp', '')
            ))
            
    return documents

@router.delete("/document/{filename}")
async def delete_document(filename: str, current_user: dict = Depends(get_current_admin)):
    """Delete a document from storage and vector database."""
    collection = get_collection()
    
    # Delete from ChromaDB
    collection.delete(where={"filename": filename})
    
    # Delete file from disk
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"message": f"Document {filename} deleted"}

