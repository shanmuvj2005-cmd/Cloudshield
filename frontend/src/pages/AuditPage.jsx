import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, CheckCircle2, RefreshCw, Lock, Terminal, Filter } from 'lucide-react';
import { api } from '../services/api';

export const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditTrail();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>CONTAINMENT RESPONSE AUDIT TRAIL</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">IMMUTABLE LOGS</span>
          </h1>
          <p className="text-xs text-slate-400">Verifiable forensic history of all automated and manual SOC containment playbooks</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Audit Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyber-border bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">AUDIT ID</th>
                <th className="py-3 px-4">TARGET USER</th>
                <th className="py-3 px-4">CONTAINMENT ACTION</th>
                <th className="py-3 px-4">ENFORCER ACTOR</th>
                <th className="py-3 px-4">STATE TRANSITION</th>
                <th className="py-3 px-4">MITIGATION REASON</th>
                <th className="py-3 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No containment actions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-cyan-400">
                      {log.id}
                    </td>

                    <td className="py-3.5 px-4 text-slate-200 font-semibold">
                      {log.username}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-200 border border-slate-800">
                        {log.action_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {log.actor}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-500">{log.previous_state}</span>
                      <span className="text-cyan-400 mx-1">→</span>
                      <span className="text-amber-400 font-bold">{log.new_state}</span>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs truncate text-[11px]">
                      {log.reason}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
