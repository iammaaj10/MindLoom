from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import time
import re
import os
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from contextlib import asynccontextmanager

MODEL_NAME = "all-MiniLM-L6-v2"
model = None
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

# ─── Common words to exclude from entity extraction ───
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "but", "and", "or", "if", "this", "that", "these", "those", "it",
    "its", "i", "me", "my", "we", "our", "you", "your", "he", "his",
    "she", "her", "they", "their", "what", "which", "who", "whom",
    "also", "about", "up", "like", "one", "two", "new", "first", "well",
    "way", "use", "make", "made", "see", "get", "many", "much", "said",
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    print(f"Loading {MODEL_NAME} on {device}...")
    model = SentenceTransformer(MODEL_NAME, device=device)
    print("Model loaded successfully.")
    yield
    model = None

app = FastAPI(title="MindLoom Local ML Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fix #6: API key authentication
ML_API_KEY = os.getenv("ML_SERVICE_API_KEY", "mindloom-dev-secret")

@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    # Allow health check without auth
    if request.url.path == "/health" or request.method == "OPTIONS":
        return await call_next(request)
    
    api_key = request.headers.get("x-api-key")
    if api_key != ML_API_KEY:
        return JSONResponse(
            status_code=401,
            content={"detail": "Unauthorized: Invalid or missing API key"}
        )
    return await call_next(request)

# ─── Request / Response Models ─────────────────────────

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimension: int
    latency_ms: float

class EntityRequest(BaseModel):
    texts: List[str]

class EntityResponse(BaseModel):
    entities: List[List[str]]
    latency_ms: float

class SimilarityRequest(BaseModel):
    query_embedding: List[float]
    candidate_embeddings: List[List[float]]
    top_k: Optional[int] = 5

class SimilarityResponse(BaseModel):
    scores: List[float]
    ranked_indices: List[int]

# ─── Entity Extraction Logic (zero extra deps) ────────

def extract_entities_from_text(text: str) -> List[str]:
    """
    Lightweight entity extraction using regex + heuristics.
    Extracts: dates, emails, URLs, capitalized proper nouns,
    and technical/domain keywords.
    """
    entities = set()

    # Dates (various formats)
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',           # 12/25/2024
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{2,4}\b',  # January 5, 2024
        r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4}\b',    # 5 January 2024
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',              # 2024-01-05
    ]
    for pattern in date_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            entities.add(f"DATE:{match.group().strip()}")

    # Emails
    for match in re.finditer(r'\b[\w.+-]+@[\w-]+\.[\w.-]+\b', text):
        entities.add(f"EMAIL:{match.group()}")

    # URLs
    for match in re.finditer(r'https?://[^\s<>"{}|\\^`\[\]]+', text):
        entities.add(f"URL:{match.group()}")

    # Capitalized proper noun phrases (2-4 consecutive capitalized words)
    for match in re.finditer(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b', text):
        phrase = match.group()
        words = phrase.lower().split()
        if not all(w in STOP_WORDS for w in words):
            entities.add(f"ENTITY:{phrase}")

    # Technical / domain keywords: words with special patterns
    # Acronyms (2+ consecutive uppercase letters)
    for match in re.finditer(r'\b[A-Z]{2,6}\b', text):
        word = match.group()
        if word not in {"THE", "AND", "FOR", "BUT", "NOT", "YOU", "ALL", "CAN", "HER", "WAS", "ONE", "OUR", "ARE", "HAS"}:
            entities.add(f"ACRONYM:{word}")

    # CamelCase or technical terms (e.g. JavaScript, MongoDB)
    for match in re.finditer(r'\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b', text):
        entities.add(f"TECH:{match.group()}")

    # Numbers with units (e.g. 10MB, 384-dimensional, 3.5 hours)
    for match in re.finditer(r'\b\d+\.?\d*\s*(?:MB|GB|KB|TB|ms|sec|min|hours?|days?|weeks?|months?|years?|%|px|em|rem)\b', text, re.IGNORECASE):
        entities.add(f"MEASURE:{match.group().strip()}")

    return sorted(entities)[:30]  # Cap at 30 entities per chunk

# ─── Endpoints ─────────────────────────────────────────

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
    embeddings = model.encode(request.texts, convert_to_numpy=True).tolist()
    latency_ms = (time.time() - start_time) * 1000

    return {
        "embeddings": embeddings,
        "dimension": len(embeddings[0]) if embeddings else 384,
        "latency_ms": latency_ms
    }

@app.post("/extract_entities", response_model=EntityResponse)
def extract_entities(request: EntityRequest):
    """Extract named entities, dates, and keywords from text chunks."""
    if not request.texts:
        return {"entities": [], "latency_ms": 0}

    start_time = time.time()
    all_entities = [extract_entities_from_text(t) for t in request.texts]
    latency_ms = (time.time() - start_time) * 1000

    return {"entities": all_entities, "latency_ms": latency_ms}

@app.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(request: SimilarityRequest):
    """Compute cosine similarity between a query vector and candidate vectors."""
    query = np.array(request.query_embedding)
    candidates = np.array(request.candidate_embeddings)

    if candidates.size == 0:
        return {"scores": [], "ranked_indices": []}

    # Cosine similarity: dot(q, c) / (|q| * |c|)
    query_norm = query / (np.linalg.norm(query) + 1e-10)
    candidate_norms = candidates / (np.linalg.norm(candidates, axis=1, keepdims=True) + 1e-10)
    scores = (candidate_norms @ query_norm).tolist()

    ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    top_k = request.top_k or len(scores)
    ranked_indices = ranked_indices[:top_k]

    return {"scores": scores, "ranked_indices": ranked_indices}
