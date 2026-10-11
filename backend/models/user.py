from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class BaselineMetrics(BaseModel):
    mean_login_hour: float = 9.5
    std_login_hour: float = 1.2
    normal_login_start: int = 8
    normal_login_end: int = 18
    mean_login_frequency: float = 4.2
    std_login_frequency: float = 1.0
    mean_download_count: float = 12.0
    std_download_count: float = 4.0
    mean_session_duration: float = 75.0  # minutes
    std_session_duration: float = 20.0
    mean_payload_size_mb: float = 18.5
    std_payload_size_mb: float = 8.0
    sensitive_file_ratio: float = 0.05  # 5% baseline

class CurrentActivity(BaseModel):
    login_hour: float = 9.0
    login_frequency: int = 4
    download_count: int = 10
    session_duration: float = 80.0
    payload_size_mb: float = 15.0
    sensitive_file_ratio: float = 0.04
    last_action: str = "Google Drive Sync"
    last_ip: str = "192.168.1.104"
    last_location: str = "San Francisco, US"

class UserProfile(BaseModel):
    id: str
    username: str
    full_name: str
    email: str
    department: str
    role: str
    avatar_url: Optional[str] = None
    risk_score: float = Field(default=15.0, ge=0.0, le=100.0)
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, CRITICAL
    anomaly_status: bool = False
    status: str = "ACTIVE"  # ACTIVE, ISOLATED, RESTRICTED, SUSPENDED
    last_active: str
    baseline: BaselineMetrics = Field(default_factory=BaselineMetrics)
    current_activity: CurrentActivity = Field(default_factory=CurrentActivity)
    tags: List[str] = []
