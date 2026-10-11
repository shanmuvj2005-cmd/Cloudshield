const API_BASE = "http://127.0.0.1:8000/api";
export const WS_URL = "ws://127.0.0.1:8000/ws/alerts";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Authentication error");
    }
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  // UEBA
  getMonitoredUsers: async (department = "") => {
    const url = department ? `${API_BASE}/ueba/users?department=${department}` : `${API_BASE}/ueba/users`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch monitored users");
    return res.json();
  },

  getUserProfile: async (userId) => {
    const res = await fetch(`${API_BASE}/ueba/users/${userId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
  },

  // Anomaly Engine
  getAnomalyEvents: async (severity = "") => {
    const url = severity ? `${API_BASE}/anomaly/events?severity=${severity}` : `${API_BASE}/anomaly/events`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch anomaly events");
    return res.json();
  },

  runBatchDetection: async () => {
    const res = await fetch(`${API_BASE}/anomaly/run-detection`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to trigger detection");
    return res.json();
  },

  uploadLogsCSV: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/anomaly/upload-csv`, {
      method: "POST",
      headers,
      body: formData
    });
    if (!res.ok) throw new Error("Failed to upload CSV");
    return res.json();
  },

  getSampleCSV: async () => {
    const res = await fetch(`${API_BASE}/anomaly/sample-csv`, { headers: getHeaders() });
    return res.json();
  },

  // NLP & GenAI Monitor
  getNLPMessages: async (channel = "", flaggedOnly = false) => {
    let url = `${API_BASE}/nlp/messages?flagged_only=${flaggedOnly}`;
    if (channel) url += `&channel=${channel}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch NLP messages");
    return res.json();
  },

  analyzeText: async (text, messageType = "CHAT") => {
    const res = await fetch(`${API_BASE}/nlp/analyze`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text, message_type: messageType })
    });
    if (!res.ok) throw new Error("Failed to analyze text");
    return res.json();
  },

  // Deception Layer
  getCanaries: async () => {
    const res = await fetch(`${API_BASE}/deception/canaries`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch canaries");
    return res.json();
  },

  triggerCanary: async (canaryId, username = "sarah.chen") => {
    const res = await fetch(`${API_BASE}/deception/trigger`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ canary_id: canaryId, username })
    });
    if (!res.ok) throw new Error("Failed to trigger canary");
    return res.json();
  },

  resetCanaries: async () => {
    const res = await fetch(`${API_BASE}/deception/reset`, {
      method: "POST",
      headers: getHeaders()
    });
    return res.json();
  },

  // Containment & Response
  executeContainment: async (userId, actionType, reason = "") => {
    const res = await fetch(`${API_BASE}/response/execute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId, action_type: actionType, reason })
    });
    if (!res.ok) throw new Error("Failed to execute containment action");
    return res.json();
  },

  getAuditTrail: async () => {
    const res = await fetch(`${API_BASE}/response/audit`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch audit trail");
    return res.json();
  },

  // Alerts
  getAlerts: async (severity = "", status = "") => {
    let url = `${API_BASE}/alerts?`;
    if (severity) url += `severity=${severity}&`;
    if (status) url += `status=${status}&`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return res.json();
  },

  updateAlertStatus: async (alertId, status, note = "") => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error("Failed to update alert");
    return res.json();
  },

  // Simulator
  getSimulatorStatus: async () => {
    const res = await fetch(`${API_BASE}/simulator/status`, { headers: getHeaders() });
    return res.json();
  },

  startSimulator: async () => {
    const res = await fetch(`${API_BASE}/simulator/start`, {
      method: "POST",
      headers: getHeaders()
    });
    return res.json();
  },

  stopSimulator: async () => {
    const res = await fetch(`${API_BASE}/simulator/stop`, {
      method: "POST",
      headers: getHeaders()
    });
    return res.json();
  },

  injectScenario: async (scenario) => {
    const res = await fetch(`${API_BASE}/simulator/inject-scenario`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) throw new Error("Failed to inject scenario");
    return res.json();
  }
};
