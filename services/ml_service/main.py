from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import time
import torch
from sentence_transformers import SentenceTransformer
from contextlib import asynccontextmanager

MODEL_NAME = "all-MiniLM-L6-v2"
model = None
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    print(f"Loading {MODEL_NAME} on {device}...")
    model = SentenceTransformer(MODEL_NAME, device=device)
    print("Model loaded successfully.")
    yield
    # Clean up resources if needed
    model = None

app = FastAPI(title="MindLoom Local ML Service", lifespan=lifespan)

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimension: int
    latency_ms: float

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model": MODEL_NAME,
        "device": device,
        "model_loaded": model is not None
    }

@app.post("/embed", response_model=EmbedResponse)
def embed_texts(request: EmbedRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    
    if not request.texts:
        return {"embeddings": [], "dimension": 384, "latency_ms": 0}
        
    start_time = time.time()
    
    # Generate embeddings and convert to native python lists of floats
    embeddings = model.encode(request.texts, convert_to_numpy=True).tolist()
    
    latency_ms = (time.time() - start_time) * 1000
    
    return {
        "embeddings": embeddings,
        "dimension": len(embeddings[0]) if embeddings else 384,
        "latency_ms": latency_ms
    }
