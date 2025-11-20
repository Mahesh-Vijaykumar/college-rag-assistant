import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from auth import create_access_token, get_current_admin, verify_password, get_password_hash
from models import UserLogin, Token, DocumentMetadata
from config import settings
from rag_engine import process_and_store_document, get_collection

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    if user.username != settings.ADMIN_USERNAME or user.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("General"),
    current_user: dict = Depends(get_current_admin)
):
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
    collection = get_collection()
    
    # Delete from ChromaDB
    collection.delete(where={"filename": filename})
    
    # Delete file from disk
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"message": f"Document {filename} deleted"}
