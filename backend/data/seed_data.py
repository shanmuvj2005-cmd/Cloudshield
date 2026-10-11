import os
import json
import uuid
from datetime import datetime, timedelta
import pandas as pd
from backend.models.user import BaselineMetrics, CurrentActivity
from backend.ml.isolation_forest import anomaly_engine
from backend.ml.nlp_analyzer import nlp_analyzer
from backend.ml.risk_fusion import fuse_threat_signals

USERS_SEED = [
    {
        "id": "usr_sarah_chen",
        "username": "sarah.chen",
        "full_name": "Sarah Chen",
        "email": "sarah.chen@cloudcorp.io",
        "department": "Engineering",
        "role": "Senior Backend Engineer",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=14)).isoformat(),
        "tags": ["Resignation Pending", "Privileged Git Access"],
        "baseline": BaselineMetrics(
            mean_login_hour=10.0,
            std_login_hour=1.0,
            normal_login_start=9,
            normal_login_end=18,
            mean_login_frequency=3.5,
            std_login_frequency=1.0,
            mean_download_count=15.0,
            std_download_count=4.0,
            mean_session_duration=65.0,
            std_session_duration=15.0,
            mean_payload_size_mb=22.0,
            std_payload_size_mb=7.0,
            sensitive_file_ratio=0.06
        ),
        "current_activity": CurrentActivity(
            login_hour=2.75,  # 02:45 AM
            login_frequency=9,
            download_count=142,
            session_duration=195.0,
            payload_size_mb=850.0,
            sensitive_file_ratio=0.72,
            last_action="Git Clone Core Microservices + External AI Prompt",
            last_ip="198.51.100.44",
            last_location="San Jose, US (Unrecognized Residential ISP)"
        )
    },
    {
        "id": "usr_marcus_vance",
        "username": "marcus.vance",
        "full_name": "Marcus Vance",
        "email": "marcus.vance@cloudcorp.io",
        "department": "Sales",
        "role": "Strategic Enterprise Director",
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=42)).isoformat(),
        "tags": ["Departing to Competitor", "CRM Admin"],
        "baseline": BaselineMetrics(
            mean_login_hour=9.0,
            std_login_hour=1.5,
            normal_login_start=8,
            normal_login_end=18,
            mean_login_frequency=4.0,
            std_login_frequency=1.2,
            mean_download_count=8.0,
            std_download_count=3.0,
            mean_session_duration=45.0,
            std_session_duration=15.0,
            mean_payload_size_mb=12.0,
            std_payload_size_mb=5.0,
            sensitive_file_ratio=0.03
        ),
        "current_activity": CurrentActivity(
            login_hour=22.5,  # 10:30 PM
            login_frequency=7,
            download_count=98,
            session_duration=140.0,
            payload_size_mb=620.0,
            sensitive_file_ratio=0.88,
            last_action="Salesforce Full Customer CSV Export",
            last_ip="203.0.113.89",
            last_location="Chicago, US (Personal Mobile Hotspot)"
        )
    },
    {
        "id": "usr_elena_rostova",
        "username": "elena.rostova",
        "full_name": "Elena Rostova",
        "email": "elena.rostova@cloudcorp.io",
        "department": "DevOps",
        "role": "Lead Cloud Infrastructure Architect",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=8)).isoformat(),
        "tags": ["Canary Trap Triggered", "Root AWS Privileges"],
        "baseline": BaselineMetrics(
            mean_login_hour=11.0,
            std_login_hour=2.0,
            normal_login_start=8,
            normal_login_end=20,
            mean_login_frequency=5.0,
            std_login_frequency=1.5,
            mean_download_count=20.0,
            std_download_count=6.0,
            mean_session_duration=90.0,
            std_session_duration=25.0,
            mean_payload_size_mb=45.0,
            std_payload_size_mb=15.0,
            sensitive_file_ratio=0.10
        ),
        "current_activity": CurrentActivity(
            login_hour=14.0,
            login_frequency=6,
            download_count=28,
            session_duration=110.0,
            payload_size_mb=55.0,
            sensitive_file_ratio=0.45,
            last_action="Accessed Honey-File: aws_prod_root_backup_keys.json",
            last_ip="192.0.2.14",
            last_location="New York, US"
        )
    },
    {
        "id": "usr_david_kim",
        "username": "david.kim",
        "full_name": "David Kim",
        "email": "david.kim@cloudcorp.io",
        "department": "Finance",
        "role": "Financial Controller",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
        "tags": ["Impossible Travel", "Bulk Egress"],
        "baseline": BaselineMetrics(
            mean_login_hour=9.0,
            std_login_hour=0.8,
            normal_login_start=8,
            normal_login_end=17,
            mean_login_frequency=3.0,
            std_login_frequency=0.8,
            mean_download_count=10.0,
            std_download_count=3.0,
            mean_session_duration=50.0,
            std_session_duration=12.0,
            mean_payload_size_mb=15.0,
            std_payload_size_mb=6.0,
            sensitive_file_ratio=0.08
        ),
        "current_activity": CurrentActivity(
            login_hour=4.2,  # 04:12 AM
            login_frequency=11,
            download_count=180,
            session_duration=220.0,
            payload_size_mb=4200.0,  # 4.2 GB
            sensitive_file_ratio=0.65,
            last_action="S3 Financial Vault Bulk Tar Download",
            last_ip="185.220.101.5",
            last_location="Frankfurt, DE (Tor Exit Node)"
        )
    },
    {
        "id": "usr_alex_rivera",
        "username": "alex.rivera",
        "full_name": "Alex Rivera",
        "email": "alex.rivera@cloudcorp.io",
        "department": "Engineering",
        "role": "Frontend Developer",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
        "tags": ["Control Baseline"],
        "baseline": BaselineMetrics(
            mean_login_hour=10.0,
            std_login_hour=1.0,
            normal_login_start=9,
            normal_login_end=18,
            mean_login_frequency=3.8,
            std_login_frequency=1.0,
            mean_download_count=12.0,
            std_download_count=4.0,
            mean_session_duration=60.0,
            std_session_duration=15.0,
            mean_payload_size_mb=16.0,
            std_payload_size_mb=5.0,
            sensitive_file_ratio=0.02
        ),
        "current_activity": CurrentActivity(
            login_hour=10.2,
            login_frequency=4,
            download_count=11,
            session_duration=65.0,
            payload_size_mb=14.5,
            sensitive_file_ratio=0.01,
            last_action="Figma Asset Download",
            last_ip="192.168.1.112",
            last_location="San Francisco, US"
        )
    },
    {
        "id": "usr_priya_patel",
        "username": "priya.patel",
        "full_name": "Priya Patel",
        "email": "priya.patel@cloudcorp.io",
        "department": "Product",
        "role": "Principal Product Manager",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=2)).isoformat(),
        "tags": ["Control Baseline"],
        "baseline": BaselineMetrics(
            mean_login_hour=9.5,
            std_login_hour=1.2,
            normal_login_start=8,
            normal_login_end=19,
            mean_login_frequency=4.5,
            std_login_frequency=1.0,
            mean_download_count=18.0,
            std_download_count=5.0,
            mean_session_duration=80.0,
            std_session_duration=20.0,
            mean_payload_size_mb=25.0,
            std_payload_size_mb=8.0,
            sensitive_file_ratio=0.05
        ),
        "current_activity": CurrentActivity(
            login_hour=10.0,
            login_frequency=4,
            download_count=16,
            session_duration=75.0,
            payload_size_mb=22.0,
            sensitive_file_ratio=0.04,
            last_action="Q4 Roadmap Slide Review",
            last_ip="192.168.1.140",
            last_location="San Francisco, US"
        )
    },
    {
        "id": "usr_michael_chang",
        "username": "michael.chang",
        "full_name": "Michael Chang",
        "email": "michael.chang@cloudcorp.io",
        "department": "Infrastructure",
        "role": "Site Reliability Engineer",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=18)).isoformat(),
        "tags": ["Control Baseline"],
        "baseline": BaselineMetrics(
            mean_login_hour=11.0,
            std_login_hour=2.0,
            normal_login_start=8,
            normal_login_end=20,
            mean_login_frequency=5.5,
            std_login_frequency=1.2,
            mean_download_count=15.0,
            std_download_count=4.0,
            mean_session_duration=85.0,
            std_session_duration=20.0,
            mean_payload_size_mb=30.0,
            std_payload_size_mb=10.0,
            sensitive_file_ratio=0.08
        ),
        "current_activity": CurrentActivity(
            login_hour=11.5,
            login_frequency=5,
            download_count=14,
            session_duration=80.0,
            payload_size_mb=28.0,
            sensitive_file_ratio=0.07,
            last_action="Kubernetes Cluster Metrics Check",
            last_ip="192.168.2.55",
            last_location="Austin, US"
        )
    },
    {
        "id": "usr_samantha_wright",
        "username": "samantha.wright",
        "full_name": "Samantha Wright",
        "email": "samantha.wright@cloudcorp.io",
        "department": "HR",
        "role": "People Operations Lead",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "status": "ACTIVE",
        "last_active": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
        "tags": ["Control Baseline"],
        "baseline": BaselineMetrics(
            mean_login_hour=9.0,
            std_login_hour=0.8,
            normal_login_start=8,
            normal_login_end=17,
            mean_login_frequency=3.0,
            std_login_frequency=0.8,
            mean_download_count=7.0,
            std_download_count=2.0,
            mean_session_duration=40.0,
            std_session_duration=10.0,
            mean_payload_size_mb=8.0,
            std_payload_size_mb=3.0,
            sensitive_file_ratio=0.04
        ),
        "current_activity": CurrentActivity(
            login_hour=9.3,
            login_frequency=3,
            download_count=6,
            session_duration=42.0,
            payload_size_mb=7.5,
            sensitive_file_ratio=0.03,
            last_action="Workday Employee Onboarding Form",
            last_ip="192.168.1.98",
            last_location="New York, US"
        )
    }
]

CANARIES_SEED = [
    {
        "id": "canary_salaries",
        "name": "Executive Compensation & Salaries 2026",
        "resource_path": "s3://corp-finance-vault/confidential_q4_executive_salaries.xlsx",
        "resource_type": "AWS_S3",
        "decoy_type": "Honey-Spreadsheet",
        "tripwire_status": "ARMED",
        "hits_count": 0,
        "last_triggered": None,
        "alert_severity": "CRITICAL"
    },
    {
        "id": "canary_aws_keys",
        "name": "AWS Production Master Root Backup Keys",
        "resource_path": "gdrive://shared-vault/aws_prod_root_backup_keys.json",
        "resource_type": "GOOGLE_WORKSPACE",
        "decoy_type": "Honey-Credentials",
        "tripwire_status": "TRIPPED",
        "hits_count": 1,
        "last_triggered": (datetime.utcnow() - timedelta(minutes=8)).isoformat(),
        "triggered_by": "elena.rostova",
        "alert_severity": "CRITICAL"
    },
    {
        "id": "canary_customer_ssn",
        "name": "Legacy Customer SSN & Tax Records Archive",
        "resource_path": "s3://customer-db-backups/customer_ssn_tax_export_2025.csv",
        "resource_type": "AWS_S3",
        "decoy_type": "Honey-PII",
        "tripwire_status": "ARMED",
        "hits_count": 0,
        "last_triggered": None,
        "alert_severity": "CRITICAL"
    },
    {
        "id": "canary_jwt_key",
        "name": "Production JWT Private Signing Key",
        "resource_path": "gdrive://engineering-core/jwt_signing_private_key.pem",
        "resource_type": "GOOGLE_WORKSPACE",
        "decoy_type": "Honey-PrivateKey",
        "tripwire_status": "ARMED",
        "hits_count": 0,
        "last_triggered": None,
        "alert_severity": "CRITICAL"
    }
]

CHATS_SEED = [
    {
        "id": "chat_01",
        "timestamp": (datetime.utcnow() - timedelta(minutes=28)).isoformat(),
        "user_id": "usr_sarah_chen",
        "username": "sarah.chen",
        "channel": "DM (Private)",
        "message_type": "CHAT",
        "text": "Before I leave next Friday, I'm going to backup the entire payments repo to my personal drive just in case.",
    },
    {
        "id": "chat_02",
        "timestamp": (datetime.utcnow() - timedelta(minutes=16)).isoformat(),
        "user_id": "usr_sarah_chen",
        "username": "sarah.chen",
        "channel": "External_AI_Interface",
        "message_type": "GENAI_PROMPT",
        "text": "Summarize this proprietary source code for cloud authentication and debug this internal secret key logic.",
    },
    {
        "id": "chat_03",
        "timestamp": (datetime.utcnow() - timedelta(minutes=55)).isoformat(),
        "user_id": "usr_marcus_vance",
        "username": "marcus.vance",
        "channel": "#sales-chat",
        "message_type": "CHAT",
        "text": "Downloading entire customer lead database from Salesforce to my laptop so I have all contract renewals handy.",
    },
    {
        "id": "chat_04",
        "timestamp": (datetime.utcnow() - timedelta(minutes=44)).isoformat(),
        "user_id": "usr_marcus_vance",
        "username": "marcus.vance",
        "channel": "External_AI_Interface",
        "message_type": "GENAI_PROMPT",
        "text": "Format this exported CSV containing all client accounts and enterprise contact records into a summary pitch deck.",
    },
    {
        "id": "chat_05",
        "timestamp": (datetime.utcnow() - timedelta(minutes=32)).isoformat(),
        "user_id": "usr_david_kim",
        "username": "david.kim",
        "channel": "External_AI_Interface",
        "message_type": "GENAI_PROMPT",
        "text": "How to bypass DLP monitoring when uploading large zip archives from corporate network to Google Drive?",
    },
    {
        "id": "chat_06",
        "timestamp": (datetime.utcnow() - timedelta(minutes=12)).isoformat(),
        "user_id": "usr_alex_rivera",
        "username": "alex.rivera",
        "channel": "#engineering",
        "message_type": "CHAT",
        "text": "PR #418 is ready for review, refactored the frontend dashboard metrics chart component.",
    },
    {
        "id": "chat_07",
        "timestamp": (datetime.utcnow() - timedelta(minutes=10)).isoformat(),
        "user_id": "usr_priya_patel",
        "username": "priya.patel",
        "channel": "#product-team",
        "message_type": "CHAT",
        "text": "Great work on sprint planning everyone! Let's align with engineering on the Q4 deliverables tomorrow.",
    }
]

SAMPLE_CSV_DATA = """username,event_type,login_hour,login_frequency,download_count,session_duration,payload_size_mb,sensitive_file_ratio
sarah.chen,Git_Repo_Clone,2.75,9,142,195,850.0,0.72
marcus.vance,Drive_BulkExport,22.5,7,98,140,620.0,0.88
elena.rostova,S3_CanaryAccess,14.0,6,28,110,55.0,0.45
david.kim,S3_BulkDownload,4.2,11,180,220,4200.0,0.65
alex.rivera,Figma_AssetDownload,10.2,4,11,65,14.5,0.01
priya.patel,Drive_ViewFile,10.0,4,16,75,22.0,0.04
michael.chang,K8s_ConfigMap,11.5,5,14,80,28.0,0.07
samantha.wright,Workday_FormRead,9.3,3,6,42,7.5,0.03
jordan.taylor,Quickbooks_Sync,10.0,3,8,50,12.0,0.02
olivia.davis,Marketo_CampaignSave,14.2,4,12,60,18.0,0.04
contractor_remote,VPN_SessionOpen,3.1,8,85,150,490.0,0.60
support_agent,Zendesk_TicketBatch,11.0,4,9,55,10.0,0.01
"""

async def seed_initial_database(db):
    """
    Seeds users, calculated anomalies, alerts, canaries, and audit logs.
    """
    # 1. Clear existing seed data if needed
    user_coll = db["users"]
    alert_coll = db["alerts"]
    chat_coll = db["chats"]
    canary_coll = db["canaries"]
    event_coll = db["events"]
    audit_coll = db["audit_logs"]

    count = await user_coll.count_documents({})
    if count > 0:
        print("[Seed] Database already contains records. Skipping seed.")
        return

    print("[Seed] Populating CloudShield with realistic synthetic enterprise telemetry...")

    # Save sample CSV
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_cloud_logs.csv"))
    with open(csv_path, "w", encoding="utf-8") as f:
        f.write(SAMPLE_CSV_DATA.strip())
    print(f"[Seed] Created demo cloud logs CSV at {csv_path}")

    # Process and seed Chats with NLP
    seeded_chats = []
    for c in CHATS_SEED:
        nlp_res = nlp_analyzer.analyze_text(c["text"], c.get("message_type", "CHAT"))
        c_record = {
            **c,
            "sentiment_score": nlp_res["sentiment_score"],
            "sentiment_label": nlp_res["sentiment_label"],
            "nlp_risk_score": nlp_res["nlp_risk_score"],
            "flagged": nlp_res["flagged"],
            "flagged_keywords": nlp_res["flagged_keywords"],
            "category": nlp_res["category"]
        }
        seeded_chats.append(c_record)
    await chat_coll.insert_many(seeded_chats)

    # Seed Canaries
    await canary_coll.insert_many(CANARIES_SEED)

    # Process Users and calculate UEBA + Isolation Forest + NLP + Deception Fusion
    seeded_users = []
    seeded_alerts = []

    for u in USERS_SEED:
        curr = u["current_activity"]
        curr_dict = curr.model_dump() if hasattr(curr, "model_dump") else curr.__dict__
        base = u["baseline"]

        # Run Isolation Forest
        iforest_res = anomaly_engine.predict_features(curr_dict, base)
        anomaly_score = iforest_res["anomaly_score"]
        contributing_factors = iforest_res["contributing_factors"]

        # Check if user has associated chat risk
        user_chats = [c for c in seeded_chats if c["user_id"] == u["id"]]
        max_nlp_score = max([c["nlp_risk_score"] for c in user_chats]) if user_chats else 0.0

        # Check canary
        deception_tripped = (u["username"] == "elena.rostova")
        is_off_hours = (curr.login_hour < base.normal_login_start or curr.login_hour > base.normal_login_end)

        # Fuse threat
        fused = fuse_threat_signals(
            anomaly_score=anomaly_score,
            nlp_risk_score=max_nlp_score,
            deception_triggered=deception_tripped,
            is_off_hours=is_off_hours
        )

        user_doc = {
            **u,
            "baseline": base.model_dump() if hasattr(base, "model_dump") else base.__dict__,
            "current_activity": curr_dict,
            "risk_score": fused["risk_score"],
            "risk_level": fused["severity"],
            "anomaly_status": iforest_res["is_anomalous"] or deception_tripped,
            "threat_components": fused["components"]
        }
        seeded_users.append(user_doc)

        # Generate alert for high or critical risk
        if fused["severity"] in ["HIGH", "CRITICAL"]:
            alert_id = f"alt_{uuid.uuid4().hex[:8]}"
            title_map = {
                "usr_sarah_chen": "Unauthorized GenAI Exfiltration & Massive Git Clone Spike",
                "usr_marcus_vance": "Anomalous Bulk CRM Customer Export & Mobile Egress Burst",
                "usr_elena_rostova": "CRITICAL DECEPTION TRIPWIRE: Honey-File 'aws_prod_root_keys' Accessed",
                "usr_david_kim": "Impossible Travel & Massive 4.2 GB Financial Vault Egress"
            }
            title = title_map.get(u["id"], f"High Risk Activity Detected: {u['full_name']}")
            
            recom_actions = []
            if fused["severity"] == "CRITICAL":
                recom_actions = ["Immediate Session Termination", "VPN Quarantine", "Revoke Cloud Credentials"]
            else:
                recom_actions = ["Permission Downgrade to Read-Only", "Notify Department Head", "Isolate Endpoint"]

            alert_doc = {
                "id": alert_id,
                "timestamp": u["last_active"],
                "user_id": u["id"],
                "username": u["username"],
                "department": u["department"],
                "severity": fused["severity"],
                "risk_score": fused["risk_score"],
                "title": title,
                "description": f"Insider threat detected with unified risk score of {fused['risk_score']}/100. Primary vector: {fused['attack_vector']}.",
                "attack_vector": fused["attack_vector"],
                "status": "OPEN",
                "assigned_to": "SOC Incident Responder",
                "contributing_factors": contributing_factors,
                "recommended_actions": recom_actions,
                "forensic_details": {
                    "ip_address": curr.last_ip,
                    "location": curr.last_location,
                    "last_action": curr.last_action,
                    "behavioral_anomaly_score": anomaly_score,
                    "nlp_risk_score": max_nlp_score,
                    "deception_tripped": deception_tripped
                }
            }
            seeded_alerts.append(alert_doc)

    await user_coll.insert_many(seeded_users)
    if seeded_alerts:
        await alert_coll.insert_many(seeded_alerts)

    # Initial Audit Trail log
    initial_audit = [
        {
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "user_id": "usr_contractor_old",
            "username": "remote_contractor_9",
            "action_type": "SESSION_TERMINATION",
            "actor": "SYSTEM_AUTOMATION",
            "reason": "Automated containment: Session inactivity timeout and off-hours credential misuse",
            "status": "SUCCESS",
            "previous_state": "ACTIVE",
            "new_state": "SUSPENDED",
            "details": {"revoked_tokens": 3, "session_id": "sess_90214"}
        }
    ]
    await audit_coll.insert_many(initial_audit)
    print(f"[Seed] Successfully seeded {len(seeded_users)} users, {len(seeded_alerts)} alerts, {len(seeded_chats)} chats, and canaries.")
