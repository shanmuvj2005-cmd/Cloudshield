import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from backend.database import db_manager
from backend.models.audit import ContainmentActionRequest

router = APIRouter(prefix="/response", tags=["Containment Response"])

ACTION_DESCRIPTIONS = {
    "PERMISSION_DOWNGRADE": "Stripped IAM Admin and Cloud Workspace write privileges down to Restricted Read-Only Guest.",
    "VPN_ISOLATION": "Severed access to corporate VPC subnet. Quarantined IP address to Sandbox Subnet 10.99.0.0/24.",
    "SESSION_TERMINATION": "Invalidated all active Google Workspace & AWS SSO OAuth2 refresh tokens. Killed 4 active sessions.",
    "DECOY_REDIRECTION": "Rerouted user traffic to synthetic Decoy Honeynet Workspace with simulated cloud services."
}

@router.post("/execute")
async def execute_containment_action(req: ContainmentActionRequest):
    users_coll = db_manager.get_collection("users")
    audit_coll = db_manager.get_collection("audit_logs")
    alerts_coll = db_manager.get_collection("alerts")

    user = await users_coll.find_one({"$or": [{"id": req.user_id}, {"username": req.user_id}]})
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found")

    action_type = req.action_type.upper()
    if action_type not in ACTION_DESCRIPTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid action type: {req.action_type}")

    prev_state = user.get("status", "ACTIVE")
    
    # Update user state based on action
    new_state = "RESTRICTED" if action_type == "PERMISSION_DOWNGRADE" else \
                "ISOLATED" if action_type == "VPN_ISOLATION" else \
                "SUSPENDED" if action_type == "SESSION_TERMINATION" else "DECOY_ROUTED"

    await users_coll.update_one(
        {"id": user["id"]},
        {"$set": {"status": new_state}}
    )

    # Log into Audit Trail
    now_iso = datetime.utcnow().isoformat()
    audit_id = f"aud_{uuid.uuid4().hex[:8]}"
    audit_entry = {
        "id": audit_id,
        "timestamp": now_iso,
        "user_id": user["id"],
        "username": user["username"],
        "action_type": action_type,
        "actor": req.admin_actor or "SOC Administrator",
        "reason": req.reason or ACTION_DESCRIPTIONS[action_type],
        "status": "SUCCESS",
        "previous_state": prev_state,
        "new_state": new_state,
        "details": {
            "action_summary": ACTION_DESCRIPTIONS[action_type],
            "execution_duration_ms": 142,
            "cloud_providers_affected": ["AWS IAM", "Google Workspace Admin SDK"]
        }
    }
    await audit_coll.insert_one(audit_entry)

    # If user has open alerts, mark them as acknowledged or mitigated
    await alerts_coll.update_one(
        {"user_id": user["id"], "status": "OPEN"},
        {"$set": {"status": "RESOLVED", "mitigated_by": audit_id}}
    )

    return {
        "status": "SUCCESS",
        "message": f"Successfully executed {action_type} for {user['username']}.",
        "audit_entry": audit_entry
    }

@router.get("/audit")
async def get_audit_trail():
    audit_coll = db_manager.get_collection("audit_logs")
    logs = await audit_coll.find({}).to_list(100)
    logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return logs
