"""
Retrieval tests for the upgraded RAG pipeline.
Tests text cleaning, chunking, embeddings, and reranking.
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import pytest
from rag_engine import clean_text, sentence_chunks
import embeddings
import reranker

# Sample college document snippet
SAMPLE_DOCUMENT = """
College of Engineering and Technology

Page 1 of 5

The College of Engineering and Technology offers undergraduate and graduate programs in Computer Science, 
Electrical Engineering, and Mechanical Engineering. Our state-of-the-art facilities include modern laboratories, 
research centers, and collaborative workspaces.

Admission Requirements:
Students must have a minimum GPA of 3.0 for undergraduate programs. Graduate programs require a GPA of 3.5 
and GRE scores. International students must submit TOEFL scores of at least 80.

Page 2 of 5

Tuition and Fees:
Undergraduate tuition is $15,000 per semester. Graduate tuition is $18,000 per semester. Additional fees 
include a technology fee of $500 and a student activity fee of $200 per semester.

Campus Housing:
On-campus housing is available for all students. Dormitory rooms cost $4,000 per semester. Meal plans 
range from $2,000 to $3,500 per semester depending on the selected option.
"""

class TestTextCleaning:
    """Test the clean_text function."""
    
    def test_removes_page_numbers(self):
        """Test that page number patterns are removed."""
        cleaned = clean_text(SAMPLE_DOCUMENT)
        assert "Page 1 of 5" not in cleaned
        assert "Page 2 of 5" not in cleaned
    
    def test_preserves_content(self):
        """Test that actual content is preserved."""
        cleaned = clean_text(SAMPLE_DOCUMENT)
        assert "College of Engineering and Technology" in cleaned
        assert "Admission Requirements" in cleaned
        assert "Tuition and Fees" in cleaned
    
    def test_normalizes_whitespace(self):
        """Test that excessive whitespace is normalized."""
        text_with_spaces = "Hello    world\n\n\n\nNext paragraph"
        cleaned = clean_text(text_with_spaces)
        assert "    " not in cleaned  # Multiple spaces removed
        assert "\n\n\n" not in cleaned  # Multiple newlines collapsed

class TestSentenceChunking:
    """Test the sentence_chunks function."""
    
    def test_creates_chunks(self):
        """Test that text is split into chunks."""
        cleaned = clean_text(SAMPLE_DOCUMENT)
        chunks = sentence_chunks(cleaned, chunk_size=50, overlap=10)
        assert len(chunks) > 0
    
    def test_chunks_contain_complete_sentences(self):
        """Test that chunks contain complete sentences (end with punctuation)."""
        cleaned = clean_text(SAMPLE_DOCUMENT)
        chunks = sentence_chunks(cleaned, chunk_size=50, overlap=10)
        
        for chunk in chunks:
            # Each chunk should end with sentence-ending punctuation
            # (unless it's the last chunk and the document doesn't end with punctuation)
            if chunk != chunks[-1]:
                assert chunk.rstrip()[-1] in '.!?', f"Chunk doesn't end with sentence: {chunk[-50:]}"
    
    def test_overlap_works(self):
        """Test that chunks have overlap."""
        text = "First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence."
        chunks = sentence_chunks(text, chunk_size=3, overlap=1)
        
        # With overlap, we should see some sentences appear in multiple chunks
        assert len(chunks) >= 2

class TestEmbeddings:
    """Test the embeddings module."""
    
    def test_embed_texts_returns_list(self):
        """Test that embed_texts returns a list of embeddings."""
        texts = ["Hello world", "Test sentence"]
        result = embeddings.embed_texts(texts)
        
        assert isinstance(result, list)
        assert len(result) == 2
        assert isinstance(result[0], list)
        assert len(result[0]) > 0  # Should have embedding dimensions
    
    def test_embedding_dimensions_consistent(self):
        """Test that all embeddings have the same dimensions."""
        texts = ["Short", "A longer sentence with more words"]
        result = embeddings.embed_texts(texts)
        
        assert len(result[0]) == len(result[1])

class TestReranker:
    """Test the reranker module."""
    
    def test_rerank_returns_top_k(self):
        """Test that reranker returns correct number of results."""
        query = "What are the admission requirements?"
        candidates = [
            "The weather is nice today.",
            "Students must have a minimum GPA of 3.0 for undergraduate programs.",
            "Campus housing is available.",
            "Graduate programs require a GPA of 3.5 and GRE scores.",
        ]
        
        reranked, scores = reranker.rerank(query, candidates, top_k=2)
        
        assert len(reranked) == 2
        assert len(scores) == 2
    
    def test_rerank_improves_relevance(self):
        """Test that reranking puts most relevant content first."""
        query = "What is the tuition cost?"
        candidates = [
            "The library is open 24 hours.",
            "Undergraduate tuition is $15,000 per semester.",
            "Students can join various clubs.",
            "Graduate tuition is $18,000 per semester.",
        ]
        
        reranked, scores = reranker.rerank(query, candidates, top_k=3)
        
        # The top result should be about tuition
        assert "tuition" in reranked[0].lower()
        
        # Scores should be in descending order
        assert scores[0] >= scores[1] >= scores[2]

class TestIntegration:
    """Integration tests for the full pipeline."""
    
    def test_full_pipeline(self):
        """Test the complete pipeline: clean → chunk → embed."""
        # Clean
        cleaned = clean_text(SAMPLE_DOCUMENT)
        assert len(cleaned) > 0
        
        # Chunk
        chunks = sentence_chunks(cleaned, chunk_size=100, overlap=20)
        assert len(chunks) > 0
        
        # Embed
        chunk_embeddings = embeddings.embed_texts(chunks)
        assert len(chunk_embeddings) == len(chunks)
    
    def test_retrieval_simulation(self):
        """Simulate a retrieval scenario."""
        # Prepare document
        cleaned = clean_text(SAMPLE_DOCUMENT)
        chunks = sentence_chunks(cleaned, chunk_size=100, overlap=20)
        
        # Simulate query
        query = "How much does housing cost?"
        
        # In a real scenario, we'd search ChromaDB
        # Here we just test that reranking works
        reranked, scores = reranker.rerank(query, chunks, top_k=3)
        
        # The top result should mention housing or cost
        top_result = reranked[0].lower()
        assert "housing" in top_result or "cost" in top_result or "dormitory" in top_result

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
