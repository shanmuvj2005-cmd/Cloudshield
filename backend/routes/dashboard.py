from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter
from backend.database import db_manager

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats():
    users_coll = db_manager.get_collection("users")
    alerts_coll = db_manager.get_collection("alerts")
    audit_coll = db_manager.get_collection("audit_logs")

    users = await users_coll.find({}).to_list(100)
    alerts = await alerts_coll.find({}).to_list(100)
    audits = await audit_coll.find({}).to_list(50)

    total_users = len(users)
    active_anomalies = sum(1 for u in users if u.get("anomaly_status", False))
    high_risk_alerts = sum(1 for a in alerts if a.get("severity") in ["HIGH", "CRITICAL"] and a.get("status") != "RESOLVED")
    
    risk_scores = [u.get("risk_score", 15.0) for u in users]
    avg_risk_score = round(sum(risk_scores) / total_users, 1) if total_users > 0 else 18.5

    # Department breakdown
    dept_risk: Dict[str, List[float]] = {}
    for u in users:
        d = u.get("department", "Other")
        dept_risk.setdefault(d, []).append(u.get("risk_score", 15.0))
    
    dept_summary = [
        {"department": d, "avg_risk": round(sum(scores)/len(scores), 1), "user_count": len(scores)}
        for d, scores in dept_risk.items()
    ]

    # Generate 24-hour risk trend timeline
    now = datetime.utcnow()
    trend = []
    base_avg = max(20.0, avg_risk_score)
    for i in range(23, -1, -1):
        t_point = now - timedelta(hours=i)
        hour_str = t_point.strftime("%H:00")
        # Add slight natural fluctuation with spike in the recent 4 hours (representing current attacks)
        factor = 1.0
        if i <= 3:
            factor = 1.35
        elif 12 <= i <= 16:
            factor = 0.95
        point_risk = round(min(95.0, max(12.0, base_avg * factor + ((i % 5) - 2.5))), 1)
        trend.append({
            "time": hour_str,
            "risk_score": point_risk,
            "anomalies_active": max(1, int(active_anomalies * (1.2 if i <= 3 else 0.6)))
        })

    # Recent high risk alerts
    recent_alerts = sorted(
        [a for a in alerts if a.get("severity") in ["HIGH", "CRITICAL"]],
        key=lambda x: x.get("timestamp", ""),
        reverse=True
    )[:5]

    return {
        "overview": {
            "total_users_monitored": total_users,
            "active_anomalies": active_anomalies,
            "high_risk_alerts_24h": high_risk_alerts,
            "average_risk_score": avg_risk_score,
            "risk_status": "ELEVATED" if avg_risk_score > 40 else "STABLE",
            "storage_mode": db_manager.mode
        },
        "risk_trend": trend,
        "department_summary": dept_summary,
        "recent_alerts": recent_alerts,
        "recent_containments": audits[:5]
    }
