from fastapi import APIRouter, HTTPException
from models import ChatQuery, ChatResponse
from rag_engine import query_rag

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/query", response_model=ChatResponse)
async def chat_query(query: ChatQuery):
    try:
        result = query_rag(query.query)
        return ChatResponse(answer=result["answer"], sources=result["sources"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
