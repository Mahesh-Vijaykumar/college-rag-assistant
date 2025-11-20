from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import admin, chat
from config import settings

app = FastAPI(title="College RAG Support Bot")

# CORS Configuration
origins = [
    "http://localhost:5173", # React default port
    "http://localhost:5174", # React fallback port
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(admin.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "College RAG Bot API is running"}
