from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import db_manager

router = APIRouter(prefix="/alerts", tags=["Alerts & Triage"])

class UpdateStatusRequest(BaseModel):
    status: str  # "ACKNOWLEDGED", "ESCALATED", "DISMISSED", "RESOLVED"
    note: Optional[str] = None
    assignee: Optional[str] = None

@router.get("")
async def list_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None
):
    alerts_coll = db_manager.get_collection("alerts")
    query = {}
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status
    if user_id:
        query["user_id"] = user_id

    alerts = await alerts_coll.find(query).to_list(100)
    alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return alerts

@router.get("/{alert_id}")
async def get_alert_detail(alert_id: str):
    alerts_coll = db_manager.get_collection("alerts")
    alert = await alerts_coll.find_one({"id": alert_id})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/status")
async def update_alert_status(alert_id: str, req: UpdateStatusRequest):
    alerts_coll = db_manager.get_collection("alerts")
    alert = await alerts_coll.find_one({"id": alert_id})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    valid_statuses = ["OPEN", "ACKNOWLEDGED", "ESCALATED", "DISMISSED", "RESOLVED"]
    status_upper = req.status.upper()
    if status_upper not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status: {req.status}")

    update_fields = {"status": status_upper}
    if req.assignee:
        update_fields["assigned_to"] = req.assignee
    if req.note:
        update_fields["resolution_note"] = req.note

    await alerts_coll.update_one({"id": alert_id}, {"$set": update_fields})
    alert.update(update_fields)

    return {
        "status": "SUCCESS",
        "message": f"Alert {alert_id} updated to {status_upper}",
        "alert": alert
    }
