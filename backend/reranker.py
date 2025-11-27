"""
Reranker module for two-stage retrieval.
Uses CrossEncoder to rerank candidate documents for improved relevance.
"""

from typing import List, Tuple
from sentence_transformers import CrossEncoder

# Global reranker cache
_reranker_model = None

def load_reranker() -> CrossEncoder:
    """
    Lazy-load the CrossEncoder reranker model.
    Uses ms-marco-MiniLM-L-6-v2 for efficient reranking.
    
    Returns:
        CrossEncoder model instance
    """
    global _reranker_model
    
    if _reranker_model is None:
        print("Loading reranker model: cross-encoder/ms-marco-MiniLM-L-6-v2")
        _reranker_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    
    return _reranker_model

def rerank(query: str, candidates: List[str], top_k: int = 3) -> Tuple[List[str], List[float]]:
    """
    Rerank candidate documents using CrossEncoder.
    
    Args:
        query: Search query
        candidates: List of candidate text chunks
        top_k: Number of top results to return
    
    Returns:
        Tuple of (top_k reranked texts, their scores)
    """
    if not candidates:
        return [], []
    
    model = load_reranker()
    
    # Create query-candidate pairs
    pairs = [[query, candidate] for candidate in candidates]
    
    # Get scores
    scores = model.predict(pairs)
    
    # Sort by score (descending)
    scored_candidates = list(zip(candidates, scores))
    scored_candidates.sort(key=lambda x: x[1], reverse=True)
    
    # Get top_k
    top_results = scored_candidates[:top_k]
    
    # Separate texts and scores
    top_texts = [text for text, score in top_results]
    top_scores = [float(score) for text, score in top_results]
    
    return top_texts, top_scores
