from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class CloudEvent(BaseModel):
    id: str
    timestamp: str
    user_id: str
    username: str
    source: str  # "AWS_CLOUDTRAIL", "GOOGLE_WORKSPACE", "INTERNAL_CHAT", "DECEPTION_HONEYFILE"
    event_type: str  # e.g. "S3_GetObject", "Drive_FileDownload", "IAM_AssumeRole", "Canary_Read"
    resource: str
    ip_address: str
    location: str
    payload_size_mb: float = 0.0
    download_count: int = 1
    session_duration: float = 30.0
    sensitive: bool = False
    details: Dict[str, Any] = {}
