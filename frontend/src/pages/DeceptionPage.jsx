import React, { useState, useEffect } from 'react';
import { 
  Crosshair, 
  ShieldAlert, 
  FileSpreadsheet, 
  Key, 
  Database, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export const DeceptionPage = () => {
  const [canaries, setCanaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);
  const [tripwireBanner, setTripwireBanner] = useState(null);

  const fetchCanaries = async () => {
    try {
      setLoading(true);
      const data = await api.getCanaries();
      setCanaries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanaries();
  }, []);

  const handleSimulateTripwire = async (canaryId) => {
    setTriggering(canaryId);
    try {
      const res = await api.triggerCanary(canaryId, "elena.rostova");
      setTripwireBanner(res.message);
      await fetchCanaries();
      setTimeout(() => setTripwireBanner(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(null);
    }
  };

  const handleReset = async () => {
    await api.resetCanaries();
    await fetchCanaries();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>DECEPTION & CANARY HONEY-FILE LAYER</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">TRIPWIRES</span>
          </h1>
          <p className="text-xs text-slate-400">Zero-false-positive virtual decoy files deployed across AWS S3 and Google Drive</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tripwires</span>
          </button>

          <button
            onClick={fetchCanaries}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Canaries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banner */}
      {tripwireBanner && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center justify-between shadow-red-glow animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span className="font-semibold">{tripwireBanner}</span>
          </div>
          <span className="text-[10px] font-mono text-red-400">Critical Alert Broadcasted via WebSocket</span>
        </div>
      )}

      {/* Explanatory concept banner */}
      <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
          <Crosshair className="w-4 h-4" />
          <span>DECEPTION ARCHITECTURE EXPLANATION</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Canary tokens (honey-files) have <b>no legitimate business purpose</b>. Any access attempt—whether via S3 API, Google Drive sync, or shell download—represents a 100% confidence malicious action or compromised credential. When an insider trips a honey-file, the platform instantly triggers automated containment playbooks.
        </p>
      </div>

      {/* Canaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canaries.map((canary) => {
          const isTripped = canary.tripwire_status === 'TRIPPED';
          const isTriggeringThis = triggering === canary.id;
          return (
            <div
              key={canary.id}
              className={`p-5 rounded-2xl border transition space-y-4 ${
                isTripped
                  ? 'border-red-500/50 bg-red-950/20 shadow-red-glow/20'
                  : 'border-cyber-border bg-cyber-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${
                    canary.decoy_type.includes('Credentials') || canary.decoy_type.includes('PrivateKey')
                      ? 'bg-amber-950/50 border-amber-500/40 text-amber-400'
                      : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-400'
                  }`}>
                    {canary.decoy_type.includes('Credentials') ? <Key className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{canary.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{canary.decoy_type}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  isTripped
                    ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {canary.tripwire_status}
                </span>
              </div>

              {/* Path */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 break-all">
                {canary.resource_path}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <div>
                  <span>Decoy Hits: </span>
                  <span className="font-mono text-slate-200 font-bold">{canary.hits_count}</span>
                </div>
                {canary.triggered_by && (
                  <div className="text-red-400 font-mono text-[11px]">
                    Tripped by: {canary.triggered_by}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSimulateTripwire(canary.id)}
                disabled={isTriggeringThis}
                className="w-full py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span>{isTriggeringThis ? 'Tripping wire...' : 'Simulate Insider Access Trap'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
