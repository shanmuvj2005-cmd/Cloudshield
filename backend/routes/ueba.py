from typing import List, Optional
from fastapi import APIRouter, HTTPException
from backend.database import db_manager
from backend.ml.ueba_profiler import calculate_feature_deviations
from backend.models.user import BaselineMetrics

router = APIRouter(prefix="/ueba", tags=["UEBA"])

@router.get("/users")
async def list_monitored_users(department: Optional[str] = None, status: Optional[str] = None):
    users_coll = db_manager.get_collection("users")
    query = {}
    if department:
        query["department"] = department
    if status:
        query["status"] = status
        
    users = await users_coll.find(query).to_list(100)
    # Sort by risk score descending
    users.sort(key=lambda u: u.get("risk_score", 0.0), reverse=True)
    return users

@router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    users_coll = db_manager.get_collection("users")
    user = await users_coll.find_one({"$or": [{"id": user_id}, {"username": user_id}]})
    if not user:
        raise HTTPException(status_code=404, detail="Monitored user not found")

    # Calculate deviations
    baseline_data = user.get("baseline", {})
    baseline_obj = BaselineMetrics(**baseline_data) if baseline_data else BaselineMetrics()
    curr_data = user.get("current_activity", {})
    deviations = calculate_feature_deviations(baseline_obj, curr_data)

    # Format radar comparison data for Recharts
    radar_data = [
        {
            "dimension": "Login Hour",
            "baseline": min(100, round((baseline_obj.mean_login_hour / 24.0) * 100)),
            "current": min(100, round((float(curr_data.get("login_hour", 9)) / 24.0) * 100)),
            "raw_baseline": f"{baseline_obj.mean_login_hour:.1f}h",
            "raw_current": f"{float(curr_data.get('login_hour', 9)):.1f}h",
            "z_score": next((d["z_score"] for d in deviations if d["feature"] == "login_hour"), 0.0)
        },
        {
            "dimension": "Login Frequency",
            "baseline": min(100, round((baseline_obj.mean_login_frequency / 10.0) * 100)),
            "current": min(100, round((float(curr_data.get("login_frequency", 4)) / 10.0) * 100)),
            "raw_baseline": f"{baseline_obj.mean_login_frequency:.1f}/h",
            "raw_current": f"{float(curr_data.get('login_frequency', 4)):.0f}/h",
            "z_score": next((d["z_score"] for d in deviations if d["feature"] == "login_frequency"), 0.0)
        },
        {
            "dimension": "Downloads",
            "baseline": min(100, round((baseline_obj.mean_download_count / 150.0) * 100)),
            "current": min(100, round((float(curr_data.get("download_count", 10)) / 150.0) * 100)),
            "raw_baseline": f"{baseline_obj.mean_download_count:.0f}",
            "raw_current": f"{float(curr_data.get('download_count', 10)):.0f}",
            "z_score": next((d["z_score"] for d in deviations if d["feature"] == "download_count"), 0.0)
        },
        {
            "dimension": "Duration",
            "baseline": min(100, round((baseline_obj.mean_session_duration / 200.0) * 100)),
            "current": min(100, round((float(curr_data.get("session_duration", 60)) / 200.0) * 100)),
            "raw_baseline": f"{baseline_obj.mean_session_duration:.0f}m",
            "raw_current": f"{float(curr_data.get('session_duration', 60)):.0f}m",
            "z_score": next((d["z_score"] for d in deviations if d["feature"] == "session_duration"), 0.0)
        },
        {
            "dimension": "Payload Egress",
            "baseline": min(100, round((baseline_obj.mean_payload_size_mb / 800.0) * 100)),
            "current": min(100, round((float(curr_data.get("payload_size_mb", 15)) / 800.0) * 100)),
            "raw_baseline": f"{baseline_obj.mean_payload_size_mb:.1f}MB",
            "raw_current": f"{float(curr_data.get('payload_size_mb', 15)):.1f}MB",
            "z_score": next((d["z_score"] for d in deviations if d["feature"] == "payload_size_mb"), 0.0)
        },
        {
            "dimension": "Sensitive Access",
            "baseline": min(100, round(baseline_obj.sensitive_file_ratio * 100)),
            "current": min(100, round(float(curr_data.get("sensitive_file_ratio", 0.04)) * 100)),
            "raw_baseline": f"{baseline_obj.sensitive_file_ratio*100:.0f}%",
            "raw_current": f"{float(curr_data.get('sensitive_file_ratio', 0.04))*100:.0f}%",
            "z_score": next((d["z_score"] for d in deviations if d["feature"] == "sensitive_file_ratio"), 0.0)
        }
    ]

    # Fetch associated chats/prompts
    chat_coll = db_manager.get_collection("chats")
    user_chats = await chat_coll.find({"user_id": user["id"]}).to_list(10)

    # Fetch associated alerts
    alerts_coll = db_manager.get_collection("alerts")
    user_alerts = await alerts_coll.find({"user_id": user["id"]}).to_list(10)

    return {
        "user": user,
        "deviations": deviations,
        "radar_comparison": radar_data,
        "chats": user_chats,
        "alerts": user_alerts
    }
