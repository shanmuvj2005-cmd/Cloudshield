import asyncio
import uuid
import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import db_manager
from backend.ml.isolation_forest import anomaly_engine
from backend.ml.nlp_analyzer import nlp_analyzer
from backend.ml.risk_fusion import fuse_threat_signals
from backend.models.user import BaselineMetrics

router = APIRouter(prefix="/simulator", tags=["Simulator & Streamer"])

class ScenarioRequest(BaseModel):
    scenario: str  # "SARAH_CHEN_EXFIL", "MARCUS_VANCE_SALES", "ELENA_ROSTOVA_CANARY", "DAVID_KIM_IMPOSSIBLE_TRAVEL", "BENIGN_ACTIVITY"

class SimulatorController:
    def __init__(self):
        self.is_running: bool = False
        self.task: Optional[asyncio.Task] = None
        self.total_emitted: int = 0
        self.interval_seconds: int = 7
        self.ws_subscribers: List[Any] = []

    def register_ws(self, ws):
        self.ws_subscribers.append(ws)

    def unregister_ws(self, ws):
        if ws in self.ws_subscribers:
            self.ws_subscribers.remove(ws)

    async def broadcast(self, message: Dict[str, Any]):
        for ws in list(self.ws_subscribers):
            try:
                await ws.send_json(message)
            except Exception:
                self.unregister_ws(ws)

    async def _stream_loop(self):
        sample_users = ["alex.rivera", "priya.patel", "michael.chang", "samantha.wright"]
        sample_actions = [
            ("Drive_Sync", 12.0, 3, "Google Drive Sync Client"),
            ("S3_ReadConfig", 5.0, 1, "AWS S3 Config Bucket"),
            ("Slack_Message", 1.0, 0, "Internal Slack Channel"),
            ("Figma_Export", 25.0, 4, "Figma UI Prototype Download")
        ]
        
        while self.is_running:
            await asyncio.sleep(self.interval_seconds)
            if not self.is_running:
                break
                
            u_name = random.choice(sample_users)
            action, payload, downloads, resource = random.choice(sample_actions)
            self.total_emitted += 1
            now_iso = datetime.utcnow().isoformat()
            
            telemetry_event = {
                "type": "LIVE_TELEMETRY",
                "timestamp": now_iso,
                "username": u_name,
                "event_type": action,
                "resource": resource,
                "payload_size_mb": round(payload + random.uniform(-2, 5), 1),
                "download_count": downloads,
                "anomaly_score": round(random.uniform(0.08, 0.22), 3),
                "risk_level": "LOW",
                "message": f"Routine operation: {action} on {resource}"
            }
            await self.broadcast(telemetry_event)

sim_controller = SimulatorController()

@router.get("/status")
async def get_simulator_status():
    return {
        "is_running": sim_controller.is_running,
        "interval_seconds": sim_controller.interval_seconds,
        "total_emitted": sim_controller.total_emitted,
        "active_ws_connections": len(sim_controller.ws_subscribers)
    }

@router.post("/start")
async def start_simulator():
    if not sim_controller.is_running:
        sim_controller.is_running = True
        sim_controller.task = asyncio.create_task(sim_controller._stream_loop())
    return {"status": "RUNNING", "message": "Telemetry stream started"}

@router.post("/stop")
async def stop_simulator():
    sim_controller.is_running = False
    if sim_controller.task:
        sim_controller.task.cancel()
        sim_controller.task = None
    return {"status": "PAUSED", "message": "Telemetry stream paused"}

@router.post("/inject-scenario")
async def inject_scenario(req: ScenarioRequest):
    users_coll = db_manager.get_collection("users")
    alerts_coll = db_manager.get_collection("alerts")
    canary_coll = db_manager.get_collection("canaries")
    chats_coll = db_manager.get_collection("chats")
    now_iso = datetime.utcnow().isoformat()

    scenario_type = req.scenario.upper()

    if scenario_type == "SARAH_CHEN_EXFIL":
        user_id = "usr_sarah_chen"
        user = await users_coll.find_one({"id": user_id})
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        alert = {
            "id": alert_id,
            "timestamp": now_iso,
            "user_id": user_id,
            "username": "sarah.chen",
            "department": "Engineering",
            "severity": "CRITICAL",
            "risk_score": 94.0,
            "title": "[INJECTED] GenAI Code Exfiltration & Git Clone Spike",
            "description": "Sarah Chen logged in at 02:45 AM, cloned core payments repository, and pasted source code into unauthorized external GenAI.",
            "attack_vector": "FUSED_THREAT",
            "status": "OPEN",
            "assigned_to": "SOC Responder",
            "contributing_factors": [
                "Login hour 02:45 AM is +3.8σ outside working window",
                "142 git downloads (+840% above baseline)",
                "External AI prompt scanned: confidential source code matched"
            ],
            "recommended_actions": ["Immediate Session Termination", "VPN Isolation", "Downgrade IAM Permissions"],
            "forensic_details": {"ip_address": "198.51.100.44", "action": "GenAI Exfiltration"}
        }
        await alerts_coll.insert_one(alert)
        await users_coll.update_one({"id": user_id}, {"$set": {"risk_score": 94.0, "risk_level": "CRITICAL", "anomaly_status": True}})
        await sim_controller.broadcast({"type": "NEW_ALERT", "alert": alert})
        return {"status": "INJECTED", "scenario": scenario_type, "alert": alert}

    elif scenario_type == "ELENA_ROSTOVA_CANARY":
        canary = await canary_coll.find_one({"id": "canary_aws_keys"})
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        alert = {
            "id": alert_id,
            "timestamp": now_iso,
            "user_id": "usr_elena_rostova",
            "username": "elena.rostova",
            "department": "DevOps",
            "severity": "CRITICAL",
            "risk_score": 98.0,
            "title": "[INJECTED] TRIPWIRE HIT: Canary 'aws_prod_root_backup_keys.json'",
            "description": "Elena Rostova accessed active decoy canary file in Google Drive vault. High-fidelity malicious intent.",
            "attack_vector": "CANARY_TRIPWIRE",
            "status": "OPEN",
            "assigned_to": "SOC Incident Commander",
            "contributing_factors": ["Deception token tripped: aws_prod_root_backup_keys.json", "Decoy resource accessed"],
            "recommended_actions": ["Session Termination", "Decoy Redirection to Honeynet", "Quarantine VPC Access"],
            "forensic_details": {"canary_id": "canary_aws_keys", "ip_address": "192.0.2.14"}
        }
        await alerts_coll.insert_one(alert)
        await canary_coll.update_one({"id": "canary_aws_keys"}, {"$set": {"tripwire_status": "TRIPPED", "last_triggered": now_iso}})
        await users_coll.update_one({"id": "usr_elena_rostova"}, {"$set": {"risk_score": 98.0, "risk_level": "CRITICAL", "anomaly_status": True}})
        await sim_controller.broadcast({"type": "NEW_ALERT", "alert": alert})
        return {"status": "INJECTED", "scenario": scenario_type, "alert": alert}

    elif scenario_type == "MARCUS_VANCE_SALES":
        user_id = "usr_marcus_vance"
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        alert = {
            "id": alert_id,
            "timestamp": now_iso,
            "user_id": user_id,
            "username": "marcus.vance",
            "department": "Sales",
            "severity": "HIGH",
            "risk_score": 82.5,
            "title": "[INJECTED] Bulk CRM Account Exfiltration over Mobile Hotspot",
            "description": "Marcus Vance downloaded 98 client accounts (620 MB) late at night via an unrecognized mobile connection.",
            "attack_vector": "BEHAVIORAL_ANOMALY",
            "status": "OPEN",
            "assigned_to": "SOC Analyst",
            "contributing_factors": [
                "Egress payload 620 MB (+5,000% baseline)",
                "98 downloads vs normal 8",
                "Late night access at 22:30"
            ],
            "recommended_actions": ["Permission Downgrade to Read-Only", "Revoke Salesforce Admin"],
            "forensic_details": {"ip_address": "203.0.113.89", "action": "Salesforce Bulk CSV Export"}
        }
        await alerts_coll.insert_one(alert)
        await users_coll.update_one({"id": user_id}, {"$set": {"risk_score": 82.5, "risk_level": "HIGH", "anomaly_status": True}})
        await sim_controller.broadcast({"type": "NEW_ALERT", "alert": alert})
        return {"status": "INJECTED", "scenario": scenario_type, "alert": alert}

    else:
        # Benign action injection
        event = {
            "type": "LIVE_TELEMETRY",
            "timestamp": now_iso,
            "username": "alex.rivera",
            "event_type": "Figma_ComponentSync",
            "resource": "figma://cloudshield-design-system",
            "payload_size_mb": 14.5,
            "download_count": 2,
            "anomaly_score": 0.11,
            "risk_level": "LOW",
            "message": "Benign design sync within normal operating baseline."
        }
        await sim_controller.broadcast(event)
        return {"status": "INJECTED", "scenario": "BENIGN_ACTIVITY", "event": event}
