from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class Alert(BaseModel):
    id: str
    timestamp: str
    user_id: str
    username: str
    department: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_score: float = 0.0
    title: str
    description: str
    attack_vector: str  # "BEHAVIORAL_ANOMALY", "NLP_INTENT", "CANARY_TRIPWIRE", "FUSED_THREAT"
    status: str = "OPEN"  # "OPEN", "ACKNOWLEDGED", "ESCALATED", "DISMISSED", "RESOLVED"
    assigned_to: Optional[str] = "SOC Analyst"
    contributing_factors: List[str] = []
    recommended_actions: List[str] = []
    event_id: Optional[str] = None
    forensic_details: Dict[str, Any] = {}
