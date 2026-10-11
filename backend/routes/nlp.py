from typing import Optional
from fastapi import APIRouter
from backend.database import db_manager
from backend.ml.nlp_analyzer import nlp_analyzer
from backend.models.nlp import AnalyzeTextRequest

router = APIRouter(prefix="/nlp", tags=["NLP Risk Signals"])

@router.get("/messages")
async def list_nlp_messages(channel: Optional[str] = None, flagged_only: bool = False):
    chat_coll = db_manager.get_collection("chats")
    query = {}
    if channel:
        query["channel"] = channel
    if flagged_only:
        query["flagged"] = True
        
    messages = await chat_coll.find(query).to_list(100)
    messages.sort(key=lambda m: m.get("nlp_risk_score", 0.0), reverse=True)
    return messages

@router.post("/analyze")
async def analyze_custom_text(request: AnalyzeTextRequest):
    """
    Live analyst test sandbox: evaluate any message or GenAI prompt in real time.
    """
    result = nlp_analyzer.analyze_text(
        text=request.text,
        message_type=request.message_type or "CHAT"
    )
    return result
