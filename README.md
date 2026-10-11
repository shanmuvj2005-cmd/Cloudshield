# CloudShield — AI-Based Insider Threat Detection Platform

> **Next-Generation Behavioral Threat Analytics & Automated Containment for AWS and Google Workspace**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://reactjs.org/)
[![scikit-learn](https://img.shields.io/badge/ML-Isolation_Forest-orange.svg)](https://scikit-learn.org/)
[![NLTK](https://img.shields.io/badge/NLP-VADER%20%2B%20Intent-green.svg)](https://www.nltk.org/)
[![Status](https://img.shields.io/badge/SOC-OPERATIONAL-emerald.svg)]()

---

## 1. Problem Statement
Traditional perimeter-based security controls (Firewalls, Zero-Trust Gateways, VPNs) establish a rigid perimeter around organizations. However:
- **Legitimate Authenticated Insiders** operate freely with valid credentials and OAuth tokens behind this perimeter.
- **Unauthorized Generative AI Services** create silent data exfiltration channels through copy-paste or upload actions that bypass network DLP.
- **Static Rule Engines** trigger high false-positive alert fatigue while missing subtle, correlated deviations.
- **Delayed Containment** allows hours or days of unauthorized egress before incident response teams can manually investigate and revoke access.

**CloudShield** solves this by unifying **User & Entity Behavior Analytics (UEBA)**, unsupervised **Isolation Forest anomaly detection**, **NLP intent analysis**, and **deception canaries** into an automated containment platform.

---

## 2. System Architecture & Threat Fusion

```
Cloud Telemetry (AWS CloudTrail, Google Workspace, Slack/Teams, Canaries)
                       │
                       ▼
         Data Ingestion & Normalization
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
   UEBA Profiler            NLP Threat Engine
(6D Baseline Deviation)  (Intent & Sentiment)
         │                           │
         ▼                           │
  Isolation Forest                   │
 (Anomaly Score 0-1)                 │
         │                           │
         └─────────────┬─────────────┘
                       ▼
          Threat Fusion & Tripwires
        (Workspace Risk Score 0-100)
                       │
                       ▼
 ┌───────────────────────────────────────────────┐
 │       Security Operations Center (SOC)        │
 │  • Real-Time Trend Charts  • Forensic Modal   │
 │  • Live CSV Upload         • Triage Actions   │
 └──────────────────────┬────────────────────────┘
                        ▼
         Automated Response Playbook
  • Permission Downgrade    • VPN Isolation
  • Session Termination     • Decoy Redirection
                        │
                        ▼
       Immutable MongoDB / JSON Audit Trail
```

### Threat Fusion Formula
$$\text{RiskScore} = \min\left(100, \; 0.45 \cdot (\text{AnomalyScore} \times 100) + 0.35 \cdot \text{NLPScore} + 0.20 \cdot \text{DeceptionSignal} + \text{Penalty}_{\text{off\_hours}}\right)$$

- **Low Risk ($0 \le \text{Risk} < 35$)**: Routine benign operation.
- **Medium Risk ($35 \le \text{Risk} < 70$)**: Elevated anomaly, increased monitoring.
- **High / Critical Risk ($70 \le \text{Risk} \le 100$)**: Immediate alert generated and automated containment playbooks activated.

---

## 3. Pre-Seeded Attack Personas

The application includes realistic enterprise scenarios for immediate demonstration:

| Persona | Role | Department | Attack Vector | Triggered Threat Factors |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Chen** | Senior Backend Engineer | Engineering | **GenAI Prompt Exfiltration & Git Spike** | 02:45 AM login (+3.8σ), 142 git downloads, proprietary code pasted into ChatGPT prompt. |
| **Marcus Vance** | Strategic Sales Director | Sales | **Bulk CRM Client List Exfiltration** | Late-night mobile hotspot access, 98 Salesforce account downloads (620 MB egress). |
| **Elena Rostova** | Lead Cloud Architect | DevOps | **Honey-File Canary Access** | Accessed `aws_prod_root_backup_keys.json` canary token in Google Drive. 100% confidence tripwire. |
| **David Kim** | Financial Controller | Finance | **Impossible Travel & Bulk S3 Egress** | Frankfurt Tor exit-node login, 4.2 GB bulk tar archive downloaded from S3 financial vault. |
| **Control Group** | Software, Product, HR, Marketing | Various | **Normal Baseline** | 4 benign employees adhering to established 30-day baselines. |

---

## 4. Tech Stack

- **Backend**: Python 3.10+ with **FastAPI**, **Uvicorn**, **Pydantic v2**
- **Machine Learning**: **scikit-learn** (`IsolationForest`), **pandas**, **numpy**
- **NLP & Sentiment**: **NLTK** (VADER sentiment + Lexicon intent matcher)
- **Database Engine**: **Dual-Mode Engine** (automatically uses live MongoDB if running, or switches seamlessly to the embedded JSON store at `backend/data/db_state.json`)
- **Real-Time Streaming**: **FastAPI WebSockets** (`/ws/alerts`)
- **Authentication**: JWT authentication (`/api/auth/login`)
- **Frontend**: **React 18/19**, **Vite**, **Tailwind CSS**, **Lucide Icons**, **Recharts**

---

## 5. Quick Start Instructions

### Option A: 1-Click Launch on Windows (Recommended)
Double-click `run.bat` or run in terminal:
```powershell
.\run.bat
```
This automatically boots both the FastAPI backend (`http://127.0.0.1:8000`) and the React dashboard (`http://localhost:5173`).

---

### Option B: Manual Startup

#### 1. Backend:
```bash
cd cloudshield
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Documentation will be accessible at `http://127.0.0.1:8000/docs`*

#### 2. Frontend:
```bash
cd cloudshield/frontend
npm run dev
```
*Web dashboard will be accessible at `http://localhost:5173`*

---

### Option C: Docker Compose
```bash
docker-compose up --build
```

---

## 6. Demo Credentials & Evaluation Walkthrough

- **URL**: `http://localhost:5173`
- **Username**: `admin`
- **Password**: `cloudshield2026`

### Evaluation Steps:
1. **Landing Page**:
   - Navigate to `http://localhost:5173` to explore the executive overview, threat landscape, and architecture.
   - Click **"Launch SOC Console"** or **"Enter SOC Console Now"**.
2. **SOC Dashboard**:
   - Review KPI metric cards: Total Monitored Identities (8), Active Anomalies (3), High-Risk Alerts, and Workspace Risk Index.
   - Observe the 24-hour risk trend line chart with attack spikes.
   - Click the **"Run Detection Cycle"** button to execute batch Isolation Forest scoring on the fly.
   - Toggle the **"Stream: PAUSED / ON"** switch to control background WebSocket telemetry without flooding the screen.
   - Use the **"Inject Attack"** dropdown to inject any of the 4 attack personas on demand.
3. **UEBA Profiles**:
   - Navigate to **UEBA Profiles** in the sidebar.
   - Click on **Sarah Chen**, **Marcus Vance**, or **Elena Rostova**.
   - Inspect the interactive **6-dimension Radar Chart** comparing the 30-day baseline against current activity.
   - Review the mathematically transparent **Z-score deviations** (e.g., `+3.8σ off-hours`, `+840% downloads`).
4. **Anomaly Engine & CSV Upload**:
   - Go to **Anomaly Engine**.
   - Click **"Evaluate Demo CSV"** to score the pre-generated `sample_cloud_logs.csv` through Isolation Forest live.
   - Or drag-and-drop your own cloud log CSV to see instant predictions.
5. **NLP & GenAI Exfiltration Monitor**:
   - Go to **NLP & GenAI Risks**.
   - Inspect the flagged Slack messages and unauthorized GenAI prompts.
   - Test the **Analyst NLP Test Sandbox** by typing any phrase (e.g., *"I'll dump the customer DB to my personal USB before quitting"*) and clicking **"Score Intent"**.
6. **Honey-Files & Canaries**:
   - Go to **Honey-Files & Traps**.
   - Click **"Simulate Insider Access Trap"** on any active canary to trip the wire and trigger a critical alert.
7. **Incident Triage & Automated Containment**:
   - Go to **Incident Alerts**.
   - Inspect alerts, click **"Acknowledge"**, or click **"Investigate"** for full forensics.
   - Click **"Contain User"** and select **Session Termination**, **VPN Isolation**, **Permission Downgrade**, or **Decoy Redirection**.
8. **Audit Trail**:
   - Navigate to **Containment Audit** to verify the immutable log entry with target user, state transition, and timestamp.
