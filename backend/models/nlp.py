from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ChatMessageRecord(BaseModel):
    id: str
    timestamp: str
    user_id: str
    username: str
    channel: str  # "#general", "#engineering", "#sales", "DM", "GenAI_Prompt"
    text: str
    message_type: str = "CHAT"  # "CHAT" or "GENAI_PROMPT"
    sentiment_score: float = 0.0  # -1.0 to 1.0
    sentiment_label: str = "NEUTRAL"  # "POSITIVE", "NEUTRAL", "NEGATIVE"
    nlp_risk_score: float = 0.0  # 0 to 100
    flagged: bool = False
    flagged_keywords: List[str] = []
    category: Optional[str] = None  # "EXFILTRATION_INTENT", "EVASION", "SHADOW_AI", "DISGRUNTLED"

class AnalyzeTextRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    message_type: Optional[str] = "CHAT"
