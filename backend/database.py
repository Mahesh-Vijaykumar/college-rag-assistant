import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings

def get_chroma_client():
    return chromadb.PersistentClient(path=settings.VECTOR_DB_DIR)

def get_collection():
    client = get_chroma_client()
    # Using a simple collection name
    return client.get_or_create_collection(name="college_docs")
