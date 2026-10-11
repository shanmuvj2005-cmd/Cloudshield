import os
import io
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sklearn.ensemble import IsolationForest
from backend.ml.ueba_profiler import calculate_feature_deviations, FEATURE_KEYS
from backend.models.user import BaselineMetrics

class AnomalyEngine:
    def __init__(self, contamination: float = 0.08, n_estimators: int = 100):
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.model: Optional[IsolationForest] = None
        self.feature_columns = FEATURE_KEYS
        self._min_score = -0.5
        self._max_score = 0.5
        self.is_fitted = False

    def fit_synthetic_baseline(self, num_samples: int = 1200):
        """
        Fits the Isolation Forest on synthetic benign cloud activity logs.
        """
        np.random.seed(42)
        # Normal working hours: 8:30 to 17:30
        login_hour = np.clip(np.random.normal(12.0, 2.5, num_samples), 6.0, 21.0)
        # Normal login frequency: 2 - 6 times per hour
        login_frequency = np.clip(np.random.normal(3.8, 1.2, num_samples), 1.0, 8.0)
        # Normal file downloads: 5 - 25 files
        download_count = np.clip(np.random.normal(14.0, 6.0, num_samples), 1.0, 35.0)
        # Normal session duration: 30 - 120 minutes
        session_duration = np.clip(np.random.normal(70.0, 25.0, num_samples), 10.0, 180.0)
        # Normal payload egress: 5 - 35 MB
        payload_size_mb = np.clip(np.random.normal(18.0, 8.5, num_samples), 1.0, 50.0)
        # Normal sensitive file ratio: 0% - 10%
        sensitive_file_ratio = np.clip(np.random.normal(0.04, 0.03, num_samples), 0.0, 0.12)

        data = np.column_stack([
            login_hour,
            login_frequency,
            download_count,
            session_duration,
            payload_size_mb,
            sensitive_file_ratio
        ])

        df = pd.DataFrame(data, columns=self.feature_columns)
        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            random_state=42
        )
        self.model.fit(df)
        
        # Calibrate raw decision function min/max
        scores = self.model.decision_function(df)
        self._min_score = float(np.min(scores))
        self._max_score = float(np.max(scores))
        self.is_fitted = True
        print(f"[AnomalyEngine] Model fitted on {num_samples} baseline cloud events.")

    def _normalize_score(self, raw_score: float) -> float:
        """
        Maps raw decision function to normalized anomaly score in [0.0, 1.0].
        Lower decision_function -> higher anomaly probability.
        """
        # Raw score typically ranges from -0.3 (very anomalous) to +0.3 (very normal)
        # Invert and scale:
        clamped = max(-0.4, min(0.3, raw_score))
        # Normal score close to 0.25 -> anomaly score close to 0.05
        # Anomaly score close to -0.35 -> anomaly score close to 0.95
        normalized = (0.25 - clamped) / 0.55
        return float(np.clip(normalized, 0.02, 0.99))

    def predict_features(
        self,
        features: Dict[str, Any],
        baseline: Optional[BaselineMetrics] = None
    ) -> Dict[str, Any]:
        """
        Evaluates a single feature dictionary, returns anomaly score, risk level, and explanations.
        """
        if not self.is_fitted:
            self.fit_synthetic_baseline()

        row = [float(features.get(k, 0.0)) for k in self.feature_columns]
        df_row = pd.DataFrame([row], columns=self.feature_columns)
        
        raw_score = float(self.model.decision_function(df_row)[0])
        norm_score = self._normalize_score(raw_score)
        
        # Explainability via Z-score Baseline Deviation
        user_baseline = baseline or BaselineMetrics()
        deviations = calculate_feature_deviations(user_baseline, features)
        
        # Extract human-readable top contributing factors
        contributing_factors = [
            d["detail"] for d in deviations if d["is_anomalous"] or d["z_score"] >= 2.0
        ]
        if not contributing_factors and norm_score > 0.5:
            # Fallback to highest z-score feature
            contributing_factors = [deviations[0]["detail"]]

        # Determine risk level
        if norm_score >= 0.75:
            risk_level = "CRITICAL" if norm_score >= 0.88 else "HIGH"
        elif norm_score >= 0.50:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "raw_decision_score": round(raw_score, 4),
            "anomaly_score": round(norm_score, 3),
            "is_anomalous": norm_score >= 0.60,
            "risk_level": risk_level,
            "feature_deviations": deviations,
            "contributing_factors": contributing_factors
        }

    def evaluate_csv_content(self, csv_text: str) -> Dict[str, Any]:
        """
        Evaluates a cloud logs CSV, runs Isolation Forest on each row, and produces an executive summary.
        """
        if not self.is_fitted:
            self.fit_synthetic_baseline()

        df = pd.read_csv(io.StringIO(csv_text))
        
        # Ensure or fill required columns
        for col in self.feature_columns:
            if col not in df.columns:
                if col == "login_hour":
                    df[col] = 12.0
                elif col == "login_frequency":
                    df[col] = 4.0
                elif col == "download_count":
                    df[col] = 10.0
                elif col == "session_duration":
                    df[col] = 60.0
                elif col == "payload_size_mb":
                    df[col] = 15.0
                elif col == "sensitive_file_ratio":
                    df[col] = 0.05

        feature_matrix = df[self.feature_columns].astype(float)
        raw_scores = self.model.decision_function(feature_matrix)
        norm_scores = [self._normalize_score(s) for s in raw_scores]

        results = []
        for idx, row in df.iterrows():
            features = {k: float(row[k]) for k in self.feature_columns}
            score = norm_scores[idx]
            user_str = str(row.get("username") or row.get("user") or f"user_{idx+1}")
            event_type = str(row.get("event_type") or row.get("action") or "CloudAction")
            
            # Simple deviations
            devs = calculate_feature_deviations(BaselineMetrics(), features)
            top_factors = [d["detail"] for d in devs if d["is_anomalous"] or d["z_score"] >= 2.0]
            
            results.append({
                "row_index": idx + 1,
                "username": user_str,
                "event_type": event_type,
                "anomaly_score": round(score, 3),
                "is_anomalous": score >= 0.60,
                "risk_level": "CRITICAL" if score >= 0.88 else "HIGH" if score >= 0.75 else "MEDIUM" if score >= 0.50 else "LOW",
                "top_factors": top_factors or ["Within baseline parameters"]
            })

        total = len(results)
        anomalies_count = sum(1 for r in results if r["is_anomalous"])
        high_risk_count = sum(1 for r in results if r["risk_level"] in ["HIGH", "CRITICAL"])
        avg_score = round(float(np.mean(norm_scores)), 3) if total > 0 else 0.0

        return {
            "total_records_processed": total,
            "anomalies_detected": anomalies_count,
            "high_risk_alerts": high_risk_count,
            "mean_anomaly_score": avg_score,
            "records": results
        }

anomaly_engine = AnomalyEngine()
# Auto-initialize baseline model
anomaly_engine.fit_synthetic_baseline()
