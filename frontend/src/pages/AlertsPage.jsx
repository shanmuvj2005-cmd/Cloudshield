import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  ArrowUpRight, 
  X, 
  Clock, 
  RefreshCw, 
  Eye, 
  Filter, 
  Lock,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { ResponseModal } from '../components/ResponseModal';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [containmentTarget, setContainmentTarget] = useState(null);
  const { latestAlert } = useWebSocket();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts(severityFilter, statusFilter);
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  // When a new WebSocket alert arrives, prepend it
  useEffect(() => {
    if (latestAlert) {
      setAlerts((prev) => [latestAlert, ...prev.filter((a) => a.id !== latestAlert.id)]);
    }
  }, [latestAlert]);

  const handleStatusUpdate = async (alertId, newStatus) => {
    try {
      await api.updateAlertStatus(alertId, newStatus);
      fetchAlerts();
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>INCIDENT ALERTS & INVESTIGATION TRIAGE</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">ACTIVE SOC</span>
          </h1>
          <p className="text-xs text-slate-400">Live triage feed correlated across UEBA, NLP intent, and deception tripwires</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-cyber-card rounded-2xl border border-cyber-border text-xs">
            No incident alerts found matching current filters.
          </div>
        ) : (
          alerts.map((alt) => {
            const isCrit = alt.severity === 'CRITICAL';
            const isHigh = alt.severity === 'HIGH';
            return (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isCrit
                    ? 'border-red-500/50 bg-red-950/20 shadow-red-glow/20'
                    : isHigh
                    ? 'border-orange-500/40 bg-orange-950/10'
                    : 'border-cyber-border bg-cyber-card'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                      isCrit ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
                      isHigh ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {alt.severity}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{alt.title}</h3>
                  </div>

                  <div className="flex items-center space-x-3 font-mono text-xs">
                    <span className="text-red-400 font-bold">Risk: {alt.risk_score}/100</span>
                    <span className="text-slate-500 text-[11px]">{new Date(alt.timestamp).toLocaleTimeString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      alt.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      alt.status === 'ESCALATED' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      alt.status === 'ACKNOWLEDGED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {alt.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {alt.description}
                </p>

                {/* Factors & Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Target: <b className="text-cyan-400">{alt.username}</b> ({alt.department})</span>
                    <span className="text-[11px] text-slate-600">|</span>
                    <span className="text-[11px] font-mono text-slate-400">Vector: <span className="text-slate-200">{alt.attack_vector}</span></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAlert(alt)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Investigate
                    </button>

                    {alt.status === 'OPEN' && (
                      <button
                        onClick={() => handleStatusUpdate(alt.id, 'ACKNOWLEDGED')}
                        className="px-3 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-medium transition"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alt.status !== 'ESCALATED' && alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleStatusUpdate(alt.id, 'ESCALATED')}
                        className="px-3 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-medium transition"
                      >
                        Escalate to IR
                      </button>
                    )}

                    {alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => {
                          setContainmentTarget({
                            id: alt.user_id,
                            username: alt.username,
                            full_name: alt.username,
                            department: alt.department
                          });
                        }}
                        className="px-3 py-1 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold transition"
                      >
                        Contain User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Forensic Investigation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-cyber-border">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                      {selectedAlert.severity}
                    </span>
                    <h2 className="text-base font-bold text-slate-100">{selectedAlert.title}</h2>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Alert ID: {selectedAlert.id} • Target: {selectedAlert.username} ({selectedAlert.department})
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-1 text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">INCIDENT SUMMARY</h4>
                <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedAlert.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">CONTRIBUTING THREAT FACTORS</h4>
                <div className="space-y-1.5">
                  {selectedAlert.contributing_factors?.map((f, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-red-300">
                      • {f}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">RECOMMENDED CONTAINMENT PLAYBOOKS</h4>
                <div className="space-y-1.5">
                  {selectedAlert.recommended_actions?.map((act, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedAlert.forensic_details && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">FORENSIC METADATA</h4>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                    {JSON.stringify(selectedAlert.forensic_details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-cyber-border">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusUpdate(selectedAlert.id, 'DISMISSED')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                >
                  Dismiss Alert
                </button>
              </div>
              <button
                onClick={() => {
                  setContainmentTarget({
                    id: selectedAlert.user_id,
                    username: selectedAlert.username,
                    full_name: selectedAlert.username,
                    department: selectedAlert.department
                  });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-red-glow transition flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Execute Containment Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Containment Modal */}
      {containmentTarget && (
        <ResponseModal
          isOpen={!!containmentTarget}
          user={containmentTarget}
          onClose={() => setContainmentTarget(null)}
          onActionSuccess={() => {
            fetchAlerts();
            setSelectedAlert(null);
          }}
        />
      )}
    </div>
  );
};
