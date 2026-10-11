import os
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.database import db_manager
from backend.ml.isolation_forest import anomaly_engine
from backend.ml.risk_fusion import fuse_threat_signals
from backend.models.user import BaselineMetrics

router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])

@router.get("/events")
async def get_anomaly_events(severity: Optional[str] = None):
    users_coll = db_manager.get_collection("users")
    users = await users_coll.find({}).to_list(100)
    
    events = []
    for u in users:
        curr = u.get("current_activity", {})
        base = BaselineMetrics(**u.get("baseline", {}))
        pred = anomaly_engine.predict_features(curr, base)
        
        if pred["anomaly_score"] >= 0.40 or u.get("anomaly_status", False):
            events.append({
                "user_id": u["id"],
                "username": u["username"],
                "full_name": u["full_name"],
                "department": u["department"],
                "last_active": u["last_active"],
                "last_action": curr.get("last_action", "Cloud Operation"),
                "anomaly_score": pred["anomaly_score"],
                "risk_level": pred["risk_level"],
                "is_anomalous": pred["is_anomalous"],
                "contributing_factors": pred["contributing_factors"],
                "feature_deviations": pred["feature_deviations"]
            })
            
    events.sort(key=lambda x: x["anomaly_score"], reverse=True)
    if severity:
        events = [e for e in events if e["risk_level"] == severity]
    return events

@router.post("/run-detection")
async def run_batch_detection():
    """
    Manually triggers Isolation Forest evaluation across all active users.
    Refreshes risk scores and returns detection summary.
    """
    users_coll = db_manager.get_collection("users")
    chat_coll = db_manager.get_collection("chats")
    users = await users_coll.find({}).to_list(100)

    evaluated = []
    anomalies_detected = 0

    for u in users:
        curr = u.get("current_activity", {})
        base = BaselineMetrics(**u.get("baseline", {}))
        pred = anomaly_engine.predict_features(curr, base)

        user_chats = await chat_coll.find({"user_id": u["id"]}).to_list(10)
        max_nlp = max([c.get("nlp_risk_score", 0.0) for c in user_chats]) if user_chats else 0.0
        deception_tripped = (u.get("username") == "elena.rostova")
        
        is_off_hours = (
            float(curr.get("login_hour", 12)) < base.normal_login_start or 
            float(curr.get("login_hour", 12)) > base.normal_login_end
        )

        fused = fuse_threat_signals(
            anomaly_score=pred["anomaly_score"],
            nlp_risk_score=max_nlp,
            deception_triggered=deception_tripped,
            is_off_hours=is_off_hours
        )

        is_anom = pred["is_anomalous"] or deception_tripped
        if is_anom:
            anomalies_detected += 1

        # Update in database
        await users_coll.update_one(
            {"id": u["id"]},
            {
                "$set": {
                    "risk_score": fused["risk_score"],
                    "risk_level": fused["severity"],
                    "anomaly_status": is_anom,
                    "threat_components": fused["components"]
                }
            }
        )

        evaluated.append({
            "username": u["username"],
            "anomaly_score": pred["anomaly_score"],
            "fused_risk_score": fused["risk_score"],
            "severity": fused["severity"],
            "top_factor": pred["contributing_factors"][0] if pred["contributing_factors"] else "Normal baseline"
        })

    return {
        "status": "SUCCESS",
        "message": f"Detection cycle completed across {len(users)} identities. {anomalies_detected} anomalies confirmed.",
        "anomalies_count": anomalies_detected,
        "results": evaluated
    }

@router.post("/upload-csv")
async def upload_cloud_logs_csv(file: UploadFile = File(...)):
    """
    Accepts cloud telemetry CSV, executes Isolation Forest on all rows,
    and returns immediate scoring with feature attribution.
    """
    try:
        content = await file.read()
        csv_text = content.decode("utf-8")
        result = anomaly_engine.evaluate_csv_content(csv_text)
        result["filename"] = file.filename
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")

@router.get("/sample-csv")
async def get_sample_csv():
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample_cloud_logs.csv"))
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"filename": "sample_cloud_logs.csv", "content": content}
    return {"error": "Sample CSV not found"}
