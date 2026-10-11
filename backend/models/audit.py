from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ContainmentActionRequest(BaseModel):
    user_id: str
    action_type: str  # "PERMISSION_DOWNGRADE", "VPN_ISOLATION", "SESSION_TERMINATION", "DECOY_REDIRECTION"
    reason: str
    admin_actor: Optional[str] = "admin"

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    user_id: str
    username: str
    action_type: str
    actor: str  # "admin" or "SYSTEM_AUTOMATION"
    reason: str
    status: str = "SUCCESS"  # "SUCCESS", "FAILED"
    previous_state: str
    new_state: str
    details: Dict[str, Any] = {}
