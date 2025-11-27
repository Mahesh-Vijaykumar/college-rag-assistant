"""
Embeddings module for RAG system.
Provides lazy-loaded embedding model and text embedding functionality.
"""

from typing import List
from sentence_transformers import SentenceTransformer

# Global model cache
_embedding_model = None

def load_embedding_model(name: str = "all-mpnet-base-v2") -> SentenceTransformer:
    """
    Lazy-load the embedding model.
    Uses a stronger model (all-mpnet-base-v2) for better retrieval quality.
    
    Args:
        name: Model name from sentence-transformers
    
    Returns:
        SentenceTransformer model instance
    """
    global _embedding_model
    
    if _embedding_model is None:
        print(f"Loading embedding model: {name}")
        _embedding_model = SentenceTransformer(name)
    
    return _embedding_model

def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of texts.
    
    Args:
        texts: List of text strings to embed
    
    Returns:
        List of embeddings (each embedding is a list of floats)
    """
    model = load_embedding_model()
    embeddings = model.encode(texts)
    return embeddings.tolist()
