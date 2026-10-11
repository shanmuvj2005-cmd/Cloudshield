import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import db_manager

router = APIRouter(prefix="/deception", tags=["Deception Layer"])

class TriggerCanaryRequest(BaseModel):
    canary_id: str
    user_id: Optional[str] = "usr_sarah_chen"
    username: Optional[str] = "sarah.chen"
    ip_address: Optional[str] = "198.51.100.44"

@router.get("/canaries")
async def list_canaries():
    canary_coll = db_manager.get_collection("canaries")
    canaries = await canary_coll.find({}).to_list(20)
    return canaries

@router.post("/trigger")
async def trigger_canary_tripwire(req: TriggerCanaryRequest):
    """
    Simulates an insider accessing a honey-file canary token.
    Instantly trips the wire and creates a critical alert.
    """
    canary_coll = db_manager.get_collection("canaries")
    alerts_coll = db_manager.get_collection("alerts")
    users_coll = db_manager.get_collection("users")

    canary = await canary_coll.find_one({"id": req.canary_id})
    if not canary:
        raise HTTPException(status_code=404, detail="Canary token not found")

    now_iso = datetime.utcnow().isoformat()

    # Update canary status
    await canary_coll.update_one(
        {"id": req.canary_id},
        {
            "$set": {
                "tripwire_status": "TRIPPED",
                "last_triggered": now_iso,
                "triggered_by": req.username
            },
            "$inc": {"hits_count": 1}
        }
    )

    # Elevate user's risk to critical
    await users_coll.update_one(
        {"$or": [{"id": req.user_id}, {"username": req.username}]},
        {
            "$set": {
                "risk_score": 96.5,
                "risk_level": "CRITICAL",
                "anomaly_status": True
            }
        }
    )

    # Create Critical Deception Alert
    alert_id = f"alt_{uuid.uuid4().hex[:8]}"
    alert_doc = {
        "id": alert_id,
        "timestamp": now_iso,
        "user_id": req.user_id,
        "username": req.username,
        "department": "Security/Tripwire",
        "severity": "CRITICAL",
        "risk_score": 98.0,
        "title": f"DECEPTION TRIPWIRE: Honey-File '{canary.get('name')}' Accessed",
        "description": f"Decoy resource '{canary.get('resource_path')}' accessed by {req.username} from IP {req.ip_address}. 100% true positive indicator.",
        "attack_vector": "CANARY_TRIPWIRE",
        "status": "OPEN",
        "assigned_to": "SOC Incident Commander",
        "contributing_factors": [
            f"Unauthorized read on canary token {canary.get('resource_path')}",
            f"Tripwire decoy type: {canary.get('decoy_type')}"
        ],
        "recommended_actions": [
            "Immediate VPN Isolation",
            "Session Termination & Token Revocation",
            "Decoy Redirection to Honeynet Sandbox"
        ],
        "forensic_details": {
            "canary_id": canary["id"],
            "resource_path": canary["resource_path"],
            "ip_address": req.ip_address
        }
    }
    await alerts_coll.insert_one(alert_doc)

    return {
        "status": "TRIPPED",
        "message": f"Tripwire '{canary['name']}' activated by {req.username}!",
        "alert": alert_doc
    }

@router.post("/reset")
async def reset_canaries():
    canary_coll = db_manager.get_collection("canaries")
    await canary_coll.update_one(
        {"id": "canary_aws_keys"},
        {"$set": {"tripwire_status": "ARMED", "hits_count": 0, "triggered_by": None}}
    )
    return {"status": "SUCCESS", "message": "Canary tripwires re-armed."}
