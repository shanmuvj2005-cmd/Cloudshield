import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldAlert, 
  TrendingUp, 
  Play, 
  Clock, 
  CheckCircle2,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { ResponseModal } from '../components/ResponseModal';

export const DashboardPage = ({ onNavigateToUsers, onNavigateToAlerts }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningDetection, setRunningDetection] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [selectedUserForContainment, setSelectedUserForContainment] = useState(null);
  const { liveEvents } = useWebSocket();

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDetection = async () => {
    setRunningDetection(true);
    setDetectionResult(null);
    try {
      const res = await api.runBatchDetection();
      setDetectionResult(res);
      await fetchStats();
      setTimeout(() => setDetectionResult(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningDetection(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
        <span>Loading SOC telemetry...</span>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const riskTrend = stats?.risk_trend || [];
  const recentAlerts = stats?.recent_alerts || [];
  const deptSummary = stats?.department_summary || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>SOC COMMAND CENTER</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">REAL-TIME UEBA</span>
          </h1>
          <p className="text-xs text-slate-400">Continuous cloud telemetry surveillance and automated containment</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Run Detection Live Button */}
          <button
            onClick={handleRunDetection}
            disabled={runningDetection}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-cyan-glow flex items-center space-x-2 disabled:opacity-50"
          >
            <Cpu className={`w-4 h-4 ${runningDetection ? 'animate-spin' : ''}`} />
            <span>{runningDetection ? 'Running Isolation Forest...' : 'Run Detection Cycle'}</span>
          </button>

          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detection Run Toast Banner */}
      {detectionResult && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between shadow-cyan-glow animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{detectionResult.message}</span>
          </div>
          <span className="font-mono text-[11px] text-cyan-400">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* 1. Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users Monitored */}
        <div 
          onClick={onNavigateToUsers}
          className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyan-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monitored Cloud Identities</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{overview.total_users_monitored || 8}</span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center">
              Active Baselines
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>AWS & Google Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 2: Active Anomalies */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-amber-500/40 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Behavioral Anomalies</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">{overview.active_anomalies || 3}</span>
            <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800">
              Isolation Forest
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            <span>Deviating from 30-day baseline</span>
          </div>
        </div>

        {/* Card 3: High Risk Alerts */}
        <div 
          onClick={onNavigateToAlerts}
          className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-red-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">High / Critical Alerts (24h)</span>
            <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-400">{overview.high_risk_alerts_24h || 3}</span>
            <span className="text-[11px] font-mono text-red-400 px-2 py-0.5 rounded bg-red-950/40 border border-red-800">
              Requires Triage
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Actionable insider threats</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 4: Average Risk Score */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyan-500/40 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Workspace Risk Index</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-slate-100">{overview.average_risk_score || 38.4}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              overview.average_risk_score > 50 
                ? 'bg-red-950 text-red-400 border border-red-800' 
                : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
            }`}>
              {overview.risk_status || 'MODERATE'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            <span>Threat fusion across 8 identities</span>
          </div>
        </div>
      </div>

      {/* 2. Charts Section: 24h Real-Time Risk Trend & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>WORKSPACE RISK SCORE TREND (24H)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Aggregated hourly insider risk scoring with attack spikes</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Risk Score</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d1322', 
                    borderColor: '#1e293b', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk_score" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#riskGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Risk Distribution (1 col) */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>DEPARTMENT RISK EXPOSURE</span>
            </h3>
            <p className="text-[11px] text-slate-400">Mean UEBA risk scores across business units</p>
          </div>

          <div className="space-y-3 pt-2">
            {deptSummary.map((dept) => {
              const score = dept.avg_risk;
              const colorClass = score > 65 ? 'bg-red-500' : score > 40 ? 'bg-amber-500' : 'bg-cyan-500';
              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{dept.department}</span>
                    <span className="font-mono text-slate-400">{score} / 100 ({dept.user_count} users)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-semibold">Engineering & Sales</span> currently exhibit the highest elevated deviation due to off-hours git cloning and bulk CRM exports.
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: High-Risk Incidents Table & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent High-Risk Incidents Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>CONFIRMED HIGH-RISK INCIDENTS</span>
              </h3>
              <p className="text-[11px] text-slate-400">Identified via fused UEBA, NLP intent, and canary signals</p>
            </div>
            <button
              onClick={onNavigateToAlerts}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>View All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">SEVERITY</th>
                  <th className="py-2.5 px-3">IDENTITY</th>
                  <th className="py-2.5 px-3">INCIDENT VECTOR</th>
                  <th className="py-2.5 px-3">RISK SCORE</th>
                  <th className="py-2.5 px-3 text-right">QUICK CONTAINMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/50">
                {recentAlerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : alt.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {alt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{alt.username}</div>
                      <div className="text-[11px] text-slate-500">{alt.department}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-medium line-clamp-1">{alt.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{alt.attack_vector}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-red-400">
                      {alt.risk_score} / 100
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedUserForContainment({
                          id: alt.user_id,
                          username: alt.username,
                          full_name: alt.username,
                          department: alt.department
                        })}
                        className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[11px] font-semibold transition"
                      >
                        Contain User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live WebSocket Event Stream (1 col) */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>LIVE TELEMETRY STREAM</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              WEBSOCKET
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Real-time feed of events flowing into the Isolation Forest engine:
          </p>

          <div className="space-y-2 overflow-y-auto max-h-72 flex-1 pr-1">
            {liveEvents.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Stream is idle. Click <b>"Stream: PAUSED"</b> on top to start live simulated telemetry, or click <b>"Inject Attack"</b>.
              </div>
            ) : (
              liveEvents.map((ev, i) => (
                <div 
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1 font-mono transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-semibold">{ev.username}</span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-300">{ev.event_type} on <span className="text-slate-400">{ev.resource}</span></div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Score: {ev.anomaly_score}</span>
                    <span className={ev.risk_level === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {ev.risk_level}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Containment Modal */}
      {selectedUserForContainment && (
        <ResponseModal
          isOpen={!!selectedUserForContainment}
          user={selectedUserForContainment}
          onClose={() => setSelectedUserForContainment(null)}
          onActionSuccess={() => {
            fetchStats();
          }}
        />
      )}
    </div>
  );
};
