from typing import Dict, Any, List

def fuse_threat_signals(
    anomaly_score: float,          # 0.0 to 1.0
    nlp_risk_score: float = 0.0,   # 0.0 to 100.0
    deception_triggered: bool = False,
    is_off_hours: bool = False
) -> Dict[str, Any]:
    """
    Fuses Behavioral UEBA Anomaly Score, NLP Intent/Sentiment, and Deception Signals.
    Returns fused Risk Score (0-100), Severity Level, and Attack Vector.
    """
    # Behavioral component: scale 0-1 to 0-100
    behavioral_component = min(100.0, max(0.0, anomaly_score * 100.0))
    nlp_component = min(100.0, max(0.0, nlp_risk_score))
    deception_component = 100.0 if deception_triggered else 0.0
    
    off_hours_penalty = 12.0 if is_off_hours else 0.0

    # Weighted calculation
    fused_score = (
        0.45 * behavioral_component +
        0.35 * nlp_component +
        0.20 * deception_component +
        off_hours_penalty
    )

    # Hard tripwire for canary honey-file access
    if deception_triggered:
        fused_score = max(fused_score, 94.0)

    # Severe dual-signal amplification: behavioral anomaly + exfil chat intent
    if anomaly_score >= 0.70 and nlp_risk_score >= 60.0:
        fused_score = max(fused_score, 88.0)

    fused_score = round(min(100.0, max(0.0, fused_score)), 1)

    # Classify severity
    if fused_score >= 90.0:
        severity = "CRITICAL"
    elif fused_score >= 70.0:
        severity = "HIGH"
    elif fused_score >= 35.0:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Identify primary vector
    if deception_triggered:
        vector = "CANARY_TRIPWIRE"
    elif anomaly_score >= 0.70 and nlp_risk_score >= 50.0:
        vector = "FUSED_THREAT"
    elif nlp_risk_score >= 60.0:
        vector = "NLP_INTENT"
    else:
        vector = "BEHAVIORAL_ANOMALY"

    return {
        "risk_score": fused_score,
        "severity": severity,
        "attack_vector": vector,
        "components": {
            "behavioral": round(behavioral_component, 1),
            "nlp": round(nlp_component, 1),
            "deception": round(deception_component, 1),
            "off_hours_penalty": off_hours_penalty
        }
    }
