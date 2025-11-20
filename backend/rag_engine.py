import os
import uuid
import time
import requests
import pdfplumber
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from database import get_collection
from config import settings

# Initialize embedding model
# Using a lightweight model suitable for local deployment
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def process_and_store_document(file_path: str, filename: str, category: str = "General"):
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    
    if not chunks:
        return
    
    # Generate embeddings
    embeddings = embedding_model.encode(chunks).tolist()
    
    collection = get_collection()
    
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{
        "filename": filename,
        "category": category,
        "chunk_index": i,
        "timestamp": str(time.time())
    } for i in range(len(chunks))]
    
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )

def query_rag(query_text: str, n_results: int = 3) -> Dict[str, Any]:
    collection = get_collection()
    
    # Embed query
    query_embedding = embedding_model.encode([query_text]).tolist()
    
    # Retrieve relevant documents
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results
    )
    
    documents = results['documents'][0] if results['documents'] else []
    metadatas = results['metadatas'][0] if results['metadatas'] else []
    
    context = "\n\n".join(documents)
    
    # Generate answer using local LLM
    answer = generate_answer(query_text, context)
    
    return {
        "answer": answer,
        "sources": [m['filename'] for m in metadatas]
    }

def generate_answer(query: str, context: str) -> str:
    if not context:
        return "I don’t have this information in the uploaded college documents."
        
    prompt = f"""You are the AI assistant of the college. 
Use ONLY the context below.

<context>
{context}
</context>

User question: {query}

If answer not in context:
Say “I don’t have this information in the uploaded college documents.”
"""

    payload = {
        "model": settings.LLM_MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(settings.LLM_API_URL, json=payload)
        response.raise_for_status()
        return response.json().get("response", "Error generating response.")
    except Exception as e:
        print(f"LLM Error: {e}")
        return "I encountered an error while trying to generate an answer. Please ensure the local LLM is running."
