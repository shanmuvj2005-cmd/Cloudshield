import math
from typing import Dict, Any, List, Tuple
from backend.models.user import BaselineMetrics, CurrentActivity

FEATURE_KEYS = [
    "login_hour",
    "login_frequency",
    "download_count",
    "session_duration",
    "payload_size_mb",
    "sensitive_file_ratio"
]

FEATURE_LABELS = {
    "login_hour": "Login Hour (24h)",
    "login_frequency": "Login Frequency (events/hr)",
    "download_count": "File Download Volume",
    "session_duration": "Session Duration (min)",
    "payload_size_mb": "Network Egress Payload (MB)",
    "sensitive_file_ratio": "Sensitive Resource Ratio"
}

def calculate_feature_deviations(
    baseline: BaselineMetrics,
    current: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Computes normalized Z-scores and deviations between baseline and current activity.
    Returns ranked feature deviations for explainability.
    """
    deviations = []
    
    # 1. Login Hour
    curr_hour = float(current.get("login_hour", 9.0))
    hour_mean = baseline.mean_login_hour
    hour_std = max(baseline.std_login_hour, 0.5)
    
    # Off hours check
    is_off_hours = curr_hour < baseline.normal_login_start or curr_hour > baseline.normal_login_end
    hour_z = abs(curr_hour - hour_mean) / hour_std
    if is_off_hours:
        hour_z = max(hour_z, 2.5)
        
    deviations.append({
        "feature": "login_hour",
        "label": FEATURE_LABELS["login_hour"],
        "baseline_val": round(hour_mean, 1),
        "current_val": round(curr_hour, 1),
        "z_score": round(hour_z, 2),
        "is_anomalous": hour_z > 2.0 or is_off_hours,
        "detail": f"Active at {int(curr_hour):02d}:{int((curr_hour % 1)*60):02d} (Normal: {baseline.normal_login_start:02d}:00-{baseline.normal_login_end:02d}:00)"
    })

    # 2. Login Frequency
    curr_freq = float(current.get("login_frequency", 4))
    freq_mean = baseline.mean_login_frequency
    freq_std = max(baseline.std_login_frequency, 0.5)
    freq_z = (curr_freq - freq_mean) / freq_std
    deviations.append({
        "feature": "login_frequency",
        "label": FEATURE_LABELS["login_frequency"],
        "baseline_val": round(freq_mean, 1),
        "current_val": round(curr_freq, 1),
        "z_score": round(max(0.0, freq_z), 2),
        "is_anomalous": freq_z > 2.2,
        "detail": f"{curr_freq:.0f} logins/hr vs baseline {freq_mean:.1f}/hr (+{max(0, (curr_freq-freq_mean)/freq_mean*100):.0f}%)"
    })

    # 3. Download Count
    curr_dl = float(current.get("download_count", 10))
    dl_mean = baseline.mean_download_count
    dl_std = max(baseline.std_download_count, 1.0)
    dl_z = (curr_dl - dl_mean) / dl_std
    deviations.append({
        "feature": "download_count",
        "label": FEATURE_LABELS["download_count"],
        "baseline_val": round(dl_mean, 1),
        "current_val": round(curr_dl, 1),
        "z_score": round(max(0.0, dl_z), 2),
        "is_anomalous": dl_z > 2.5,
        "detail": f"{int(curr_dl)} downloads vs baseline {dl_mean:.0f} (+{max(0, (curr_dl-dl_mean)/dl_mean*100):.0f}%)"
    })

    # 4. Session Duration
    curr_dur = float(current.get("session_duration", 60.0))
    dur_mean = baseline.mean_session_duration
    dur_std = max(baseline.std_session_duration, 5.0)
    dur_z = (curr_dur - dur_mean) / dur_std
    deviations.append({
        "feature": "session_duration",
        "label": FEATURE_LABELS["session_duration"],
        "baseline_val": round(dur_mean, 1),
        "current_val": round(curr_dur, 1),
        "z_score": round(max(0.0, dur_z), 2),
        "is_anomalous": dur_z > 2.5,
        "detail": f"{curr_dur:.0f} min vs typical {dur_mean:.0f} min"
    })

    # 5. Payload Size MB
    curr_pl = float(current.get("payload_size_mb", 15.0))
    pl_mean = baseline.mean_payload_size_mb
    pl_std = max(baseline.std_payload_size_mb, 2.0)
    pl_z = (curr_pl - pl_mean) / pl_std
    deviations.append({
        "feature": "payload_size_mb",
        "label": FEATURE_LABELS["payload_size_mb"],
        "baseline_val": round(pl_mean, 1),
        "current_val": round(curr_pl, 1),
        "z_score": round(max(0.0, pl_z), 2),
        "is_anomalous": pl_z > 2.5,
        "detail": f"{curr_pl:.1f} MB egress vs normal {pl_mean:.1f} MB (+{max(0, (curr_pl-pl_mean)/pl_mean*100):.0f}%)"
    })

    # 6. Sensitive File Ratio
    curr_sens = float(current.get("sensitive_file_ratio", 0.04))
    sens_mean = baseline.sensitive_file_ratio
    sens_z = (curr_sens - sens_mean) / 0.08
    deviations.append({
        "feature": "sensitive_file_ratio",
        "label": FEATURE_LABELS["sensitive_file_ratio"],
        "baseline_val": round(sens_mean, 2),
        "current_val": round(curr_sens, 2),
        "z_score": round(max(0.0, sens_z), 2),
        "is_anomalous": sens_z > 2.5 or curr_sens > 0.40,
        "detail": f"{curr_sens*100:.0f}% sensitive files accessed (baseline {sens_mean*100:.0f}%)"
    })

    # Sort descending by z_score
    deviations.sort(key=lambda x: x["z_score"], reverse=True)
    return deviations
