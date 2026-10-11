import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CloudShield"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cloudshield-soc-secret-key-2026-secure-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/cloudshield")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "cloudshield")
    
    # Demo credentials
    DEMO_ADMIN_USERNAME: str = "admin"
    DEMO_ADMIN_PASSWORD: str = "cloudshield2026"
    
    # Anomaly Detection Defaults
    IFOREST_CONTAMINATION: float = 0.08
    IFOREST_ESTIMATORS: int = 100
    
    # Telemetry Simulator settings
    SIMULATOR_INTERVAL_SECONDS: int = 6
    SIMULATOR_AUTOSTART: bool = False  # Controlled / Paused by default as requested

settings = Settings()
