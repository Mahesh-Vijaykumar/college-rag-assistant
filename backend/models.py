from pydantic import BaseModel
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class ChatQuery(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    category: Optional[str] = "General"
    upload_time: str
