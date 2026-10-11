import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  Activity, 
  Clock, 
  ExternalLink, 
  X, 
  AlertTriangle,
  Lock,
  Compass,
  WifiOff,
  LogOut,
  RefreshCw,
  FileText
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { ResponseModal } from '../components/ResponseModal';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [containmentTarget, setContainmentTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getMonitoredUsers(departmentFilter);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [departmentFilter]);

  const handleOpenProfile = async (userId) => {
    try {
      setProfileLoading(true);
      const details = await api.getUserProfile(userId);
      setSelectedProfile(details);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>USER & ENTITY BEHAVIOR ANALYTICS (UEBA)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">PROFILER</span>
          </h1>
          <p className="text-xs text-slate-400">Continuous 30-day baseline surveillance across 6 cloud telemetry dimensions</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="DevOps">DevOps</option>
            <option value="Finance">Finance</option>
            <option value="Product">Product</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="HR">HR</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, username, or department..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Users Directory Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyber-border bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">IDENTITY</th>
                <th className="py-3 px-4">DEPARTMENT / ROLE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">RISK SCORE</th>
                <th className="py-3 px-4">ANOMALY STATE</th>
                <th className="py-3 px-4">LAST ACTION</th>
                <th className="py-3 px-4 text-right">PROFILE DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filteredUsers.map((u) => {
                const isHighRisk = u.risk_score >= 70;
                const isMedRisk = u.risk_score >= 35 && u.risk_score < 70;
                return (
                  <tr 
                    key={u.id}
                    className="hover:bg-slate-900/40 transition cursor-pointer"
                    onClick={() => handleOpenProfile(u.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                          alt={u.full_name} 
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-200">{u.full_name}</div>
                          <div className="text-[11px] font-mono text-cyan-400">{u.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium">{u.department}</div>
                      <div className="text-[11px] text-slate-500">{u.role}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : u.status === 'ISOLATED'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm ${
                          isHighRisk ? 'text-red-400' : isMedRisk ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {u.risk_score}
                        </span>
                        <span className="text-[10px] text-slate-500">/ 100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.anomaly_status ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800 text-[10px] font-mono font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ANOMALOUS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                          <span>WITHIN BASELINE</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-400">
                      {u.current_activity?.last_action || 'Routine Cloud Sync'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile(u.id);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        Inspect UEBA
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Deep-Dive Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-cyber-border">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedProfile.user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt={selectedProfile.user.full_name}
                  className="w-14 h-14 rounded-2xl border border-cyan-500/40 object-cover shadow-cyan-glow"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-100">{selectedProfile.user.full_name}</h2>
                    <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {selectedProfile.user.username}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedProfile.user.role} • {selectedProfile.user.department}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Location: {selectedProfile.user.current_activity?.last_location} | IP: {selectedProfile.user.current_activity?.last_ip}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setContainmentTarget(selectedProfile.user);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold transition"
                >
                  Contain User
                </button>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Risk Indicator Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 font-mono uppercase">Unified Risk Score</div>
                <div className={`text-2xl font-bold font-mono mt-1 ${
                  selectedProfile.user.risk_score >= 70 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {selectedProfile.user.risk_score} / 100
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 font-mono uppercase">Anomaly Status</div>
                <div className={`text-base font-bold font-mono mt-1 ${
                  selectedProfile.user.anomaly_status ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {selectedProfile.user.anomaly_status ? 'ANOMALOUS ACTIVITY' : 'NORMAL BEHAVIOR'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 font-mono uppercase">Current Cloud State</div>
                <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                  {selectedProfile.user.status}
                </div>
              </div>
            </div>

            {/* Behavioral Radar & Deviations Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
                    BEHAVIORAL BASELINE VS CURRENT ACTIVITY (RADAR)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cyan polygon represents 30-day baseline; Orange polygon highlights recent telemetry shift.
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={selectedProfile.radar_comparison}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={10} />
                      <PolarRadiusAxis stroke="#334155" fontSize={9} />
                      <Radar name="30d Baseline" dataKey="baseline" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
                      <Radar name="Current Activity" dataKey="current" stroke="#f97316" fill="#f97316" fillOpacity={0.45} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feature Deviations & Z-Scores List */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
                  LIGHTWEIGHT Z-SCORE FEATURE ATTRIBUTION
                </h3>
                <p className="text-[11px] text-slate-400">
                  Mathematical deviation (Δz = (x - μ) / σ) indicating specific threat factors.
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedProfile.deviations.map((dev) => (
                    <div 
                      key={dev.feature}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        dev.is_anomalous
                          ? 'border-red-500/40 bg-red-950/20 text-red-300'
                          : 'border-slate-800 bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{dev.label}</span>
                        <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                          dev.z_score >= 2.0 ? 'bg-red-950 text-red-400 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          z = +{dev.z_score}σ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{dev.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Chats & Prompts */}
            {selectedProfile.chats && selectedProfile.chats.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RECORDED CHATS & GENAI PROMPT LOGS</span>
                </h3>
                <div className="space-y-2">
                  {selectedProfile.chats.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        c.flagged ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800 bg-slate-900/40'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                        <span className="text-cyan-400">{c.channel}</span>
                        <span>{new Date(c.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200">{c.text}</p>
                      {c.flagged && (
                        <div className="text-[10px] text-amber-400 font-mono">
                          Matched Keywords: {c.flagged_keywords?.join(', ')} (NLP Score: {c.nlp_risk_score}/100)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            fetchUsers();
            if (selectedProfile) {
              handleOpenProfile(selectedProfile.user.id);
            }
          }}
        />
      )}
    </div>
  );
};
