import os
import uuid
import time
import requests
import pdfplumber
import re
import nltk
from typing import List, Dict, Any
from database import get_collection
from config import settings
import embeddings
import reranker
import llm_client

# Download NLTK data if not already present
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)



def clean_text(text: str) -> str:
    """
    Clean extracted PDF text by removing headers/footers, page numbers,
    fixing hyphenation, and normalizing whitespace.
    """
    # Remove page number patterns (e.g., "Page 1 of 10", "Page 1", "1 of 10")
    text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Page\s+\d+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\b\d+\s+of\s+\d+\b', '', text)
    
    # Remove common header/footer patterns (customize based on your PDFs)
    # Remove lines that are just numbers (often page numbers)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Fix hyphenated line breaks (e.g., "exam-\nple" -> "example")
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    
    # Collapse multiple blank lines into single newline
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    
    # Normalize whitespace (multiple spaces to single space)
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    # Final trim
    return text.strip()

def sentence_chunks(text: str, chunk_size: int = 300, overlap: int = 75) -> List[str]:
    """
    Split text into chunks using sentence boundaries.
    Ensures chunks contain complete sentences and maintains word-based overlap.
    
    Args:
        text: Input text to chunk
        chunk_size: Target chunk size in words
        overlap: Overlap size in words
    
    Returns:
        List of text chunks
    """
    # Tokenize into sentences
    sentences = nltk.sent_tokenize(text)
    
    chunks = []
    current_chunk = []
    current_word_count = 0
    
    i = 0
    while i < len(sentences):
        sentence = sentences[i]
        sentence_words = len(sentence.split())
        
        # If adding this sentence would exceed chunk_size and we have content
        if current_word_count + sentence_words > chunk_size and current_chunk:
            # Save current chunk
            chunks.append(' '.join(current_chunk))
            
            # Calculate overlap: keep last sentences that sum to ~overlap words
            overlap_chunk = []
            overlap_word_count = 0
            
            # Go backwards through current_chunk to build overlap
            for sent in reversed(current_chunk):
                sent_words = len(sent.split())
                if overlap_word_count + sent_words <= overlap:
                    overlap_chunk.insert(0, sent)
                    overlap_word_count += sent_words
                else:
                    break
            
            # Start new chunk with overlap
            current_chunk = overlap_chunk
            current_word_count = overlap_word_count
        else:
            # Add sentence to current chunk
            current_chunk.append(sentence)
            current_word_count += sentence_words
            i += 1
    
    # Add final chunk if it has content
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    # Clean the extracted text
    return clean_text(text)

def process_and_store_document(file_path: str, filename: str, category: str = "General"):
    text = extract_text_from_pdf(file_path)
    chunks = sentence_chunks(text)
    
    if not chunks:
        return
    
    # Generate embeddings using new embeddings module
    chunk_embeddings = embeddings.embed_texts(chunks)
    
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
        embeddings=chunk_embeddings,
        metadatas=metadatas,
        ids=ids
    )

async def query_rag(query_text: str, n_results: int = 3) -> Dict[str, Any]:
    """
    Two-stage retrieval: dense retrieval + reranking.
    
    Args:
        query_text: User query
        n_results: Number of final results (after reranking)
    
    Returns:
        Dictionary with answer and sources
    """
    collection = get_collection()
    
    # Stage 1: Dense retrieval - get top 50 candidates
    query_embedding = embeddings.embed_texts([query_text])
    
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=50  # Retrieve more candidates for reranking
    )
    
    documents = results['documents'][0] if results['documents'] else []
    metadatas = results['metadatas'][0] if results['metadatas'] else []
    
    if not documents:
        return {
            "answer": "I don't have this information in the uploaded college documents.",
            "sources": []
        }
    
    # Stage 2: Rerank candidates to get top 3
    reranked_docs, scores = reranker.rerank(query_text, documents, top_k=n_results)
    
    # Apply similarity threshold - if top result is too weak, return fallback
    # Note: CrossEncoder scores can be negative, typical range is -15 to +15
    # A score below -5 indicates very poor relevance
    SIMILARITY_THRESHOLD = -5.0
    if not scores or scores[0] < SIMILARITY_THRESHOLD:
        return {
            "answer": "I don't have this information in the uploaded college documents.",
            "sources": []
        }
    
    # Build context from reranked results
    context = "\n\n".join(reranked_docs)
    
    # Get sources for reranked documents
    # Match reranked docs back to their metadata
    reranked_sources = []
    for reranked_doc in reranked_docs:
        for i, doc in enumerate(documents):
            if doc == reranked_doc:
                reranked_sources.append(metadatas[i]['filename'])
                break
    
    # Generate answer using unified LLM client
    prompt = f"""You are a helpful and knowledgeable AI assistant for a college.

Use ONLY the information in the <context> section to answer.

Follow these rules:
- Give clear, structured, and concise answers.
- Use bullet points, numbered lists, and bold headings.
- Highlight important details with **bold text**.
- If the user asks "who", "what", "when", "where", "which", provide a direct answer first.
- Then provide a short explanation under a section called **Details**.
- Do NOT add information that is not in the context.
- If the answer is not found in the context, reply:
  "I don't have this information in the uploaded college documents."

<context>
{context}
</context>

User Question: {query_text}

Provide the answer in clean, formatted Markdown.
"""
    
    answer = await llm_client.generate_answer_llm(prompt)
    
    return {
        "answer": answer,
        "sources": reranked_sources
    }
