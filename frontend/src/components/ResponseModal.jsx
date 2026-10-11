import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Lock, 
  WifiOff, 
  LogOut, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

export const ResponseModal = ({ isOpen, onClose, user, onActionSuccess }) => {
  const [selectedAction, setSelectedAction] = useState('SESSION_TERMINATION');
  const [reason, setReason] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen || !user) return null;

  const actions = [
    {
      id: 'SESSION_TERMINATION',
      name: 'Session Termination',
      icon: LogOut,
      severity: 'HIGH',
      description: 'Immediately revokes all active cloud OAuth tokens, JWTs, and SSO credentials.',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20'
    },
    {
      id: 'VPN_ISOLATION',
      name: 'VPN Network Isolation',
      icon: WifiOff,
      severity: 'CRITICAL',
      description: 'Quarantines user IP address to isolated sandbox subnet 10.99.0.0/24.',
      color: 'text-red-400 border-red-500/30 bg-red-950/20'
    },
    {
      id: 'PERMISSION_DOWNGRADE',
      name: 'Permission Downgrade',
      icon: Lock,
      severity: 'MEDIUM',
      description: 'Downgrades AWS IAM and Google Workspace roles to Restricted Read-Only Guest.',
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
    },
    {
      id: 'DECOY_REDIRECTION',
      name: 'Decoy Honeynet Redirection',
      icon: Compass,
      severity: 'CRITICAL',
      description: 'Transparently reroutes cloud requests to a synthetic Honeynet workspace.',
      color: 'text-purple-400 border-purple-500/30 bg-purple-950/20'
    }
  ];

  const handleExecute = async () => {
    setExecuting(true);
    setResult(null);
    try {
      const res = await api.executeContainment(
        user.id || user.username,
        selectedAction,
        reason || `Automated SOC containment action taken on ${user.username}`
      );
      setResult(res);
      if (onActionSuccess) onActionSuccess(res);
    } catch (err) {
      setResult({ status: 'ERROR', message: err.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">CONTAINMENT RESPONSE PLAYBOOK</h3>
              <p className="text-xs text-slate-400">Target Identity: <b className="text-cyan-400 font-mono">{user.full_name || user.username}</b> ({user.department})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!result ? (
          <div className="py-5 space-y-4">
            <div className="text-xs text-slate-300">
              Select automated containment action to enforce across AWS and Google Workspace:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {actions.map((act) => {
                const Icon = act.icon;
                const isSelected = selectedAction === act.id;
                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedAction(act.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-cyan-glow'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="font-semibold text-xs text-slate-200">{act.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{act.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Justification note */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                SOC Analyst Justification / Reason:
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Unscheduled off-hours git exfiltration and GenAI prompt leak detected"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            {result.status === 'SUCCESS' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-emerald-glow">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">Containment Action Enforced</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{result.message}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-slate-400 max-w-md mx-auto space-y-1">
                  <div>Audit ID: <span className="text-cyan-400">{result.audit_entry?.id}</span></div>
                  <div>Actor: <span className="text-slate-200">{result.audit_entry?.actor}</span></div>
                  <div>New State: <span className="text-amber-400">{result.audit_entry?.new_state}</span></div>
                  <div>Action: <span className="text-emerald-400">{result.audit_entry?.action_type}</span></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-red-400">Execution Failed</h4>
                  <p className="text-xs text-slate-400 mt-1">{result.message}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-cyber-border">
          {!result ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-red-glow disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enforcing...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Execute Containment</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-cyan-glow"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
