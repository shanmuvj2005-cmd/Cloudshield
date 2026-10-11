import re
from typing import Dict, Any, List, Tuple

# Targeted threat lexicons
EXFILTRATION_TRIGGERS = [
    "dump db", "dump database", "download customer", "export records", "client list",
    "backup to personal", "personal drive", "dropbox upload", "google drive export",
    "usb copy", "github private", "send to my gmail", "exfiltrate", "confidential export",
    "copy database", "all ssn", "credit cards", "payroll records", "customer financial"
]

EVASION_TRIGGERS = [
    "bypass dlp", "disable crowdstrike", "turn off logging", "avoid detection",
    "audit trail", "kill agent", "stealth mode", "unmonitored proxy", "clear bash history",
    "delete cloudtrail", "disable security", "tunnel out", "hide traffic"
]

SHADOW_AI_TRIGGERS = [
    "paste into chatgpt", "upload to claude", "summarize code on external ai",
    "debug secret token on chatgpt", "external ai prompt", "bypass ai policy",
    "unauthorized genai", "summarize proprietary source code", "public llm"
]

DISGRUNTLED_TRIGGERS = [
    "quitting next week", "before i leave", "resignation pending", "boss will regret",
    "hate this company", "screwed over", "taking everything with me", "getting fired",
    "give two weeks notice", "they won't notice"
]

class NLPThreatAnalyzer:
    def __init__(self):
        self._vader = None
        self._init_vader()

    def _init_vader(self):
        try:
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            self._vader = SentimentIntensityAnalyzer()
        except Exception:
            # Fallback will use heuristic sentiment scoring
            self._vader = None

    def analyze_text(self, text: str, message_type: str = "CHAT") -> Dict[str, Any]:
        """
        Analyzes a chat message or simulated GenAI prompt for insider threat intent.
        """
        text_lower = text.lower()
        matched_exfil = [kw for kw in EXFILTRATION_TRIGGERS if kw in text_lower]
        matched_evasion = [kw for kw in EVASION_TRIGGERS if kw in text_lower]
        matched_shadow_ai = [kw for kw in SHADOW_AI_TRIGGERS if kw in text_lower]
        matched_disgruntled = [kw for kw in DISGRUNTLED_TRIGGERS if kw in text_lower]

        all_keywords = matched_exfil + matched_evasion + matched_shadow_ai + matched_disgruntled
        
        # Calculate sentiment score
        compound = 0.0
        if self._vader:
            try:
                scores = self._vader.polarity_scores(text)
                compound = float(scores.get("compound", 0.0))
            except Exception:
                compound = 0.0
        else:
            # Lightweight heuristic sentiment
            negative_words = ["hate", "leave", "quit", "bad", "regret", "worst", "fire", "screwed"]
            matches = sum(1 for w in negative_words if w in text_lower)
            if matches > 0:
                compound = -0.3 * min(3, matches)

        sentiment_label = "POSITIVE" if compound >= 0.15 else "NEGATIVE" if compound <= -0.15 else "NEUTRAL"

        # Calculate Intent Score (0 - 100)
        risk_score = 0.0
        category = None

        if matched_exfil:
            risk_score += 45.0 + min(35.0, len(matched_exfil) * 15.0)
            category = "EXFILTRATION_INTENT"
        elif matched_shadow_ai:
            risk_score += 40.0 + min(30.0, len(matched_shadow_ai) * 12.0)
            category = "SHADOW_AI"
        elif matched_evasion:
            risk_score += 50.0 + min(30.0, len(matched_evasion) * 15.0)
            category = "EVASION"
        elif matched_disgruntled:
            risk_score += 25.0 + min(20.0, len(matched_disgruntled) * 10.0)
            category = "DISGRUNTLED"

        # Negative sentiment amplifies risk
        if compound < -0.3:
            risk_score += 15.0
        elif compound < -0.1:
            risk_score += 8.0

        if message_type == "GENAI_PROMPT" and (matched_exfil or matched_shadow_ai):
            risk_score = min(100.0, risk_score + 15.0)

        risk_score = round(min(100.0, max(0.0, risk_score)), 1)
        flagged = risk_score >= 35.0 or len(all_keywords) > 0

        return {
            "text": text,
            "message_type": message_type,
            "sentiment_score": round(compound, 3),
            "sentiment_label": sentiment_label,
            "nlp_risk_score": risk_score,
            "flagged": flagged,
            "flagged_keywords": all_keywords,
            "category": category
        }

nlp_analyzer = NLPThreatAnalyzer()
