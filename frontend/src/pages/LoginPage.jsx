import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onSuccess }) => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('cloudshield2026');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cyber-card border border-cyber-border rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-cyan-glow">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">CLOUD<span className="text-cyan-400">SHIELD</span></h2>
          <p className="text-xs text-slate-400">Security Operations Command Access</p>
        </div>

        {/* Demo banner */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 font-mono text-center">
          Demo Credentials: <span className="text-slate-100 font-bold">admin</span> / <span className="text-slate-100 font-bold">cloudshield2026</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-cyan-glow flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to SOC Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          Strictly authorized SOC personnel only • Session tracked
        </div>
      </div>
    </div>
  );
};
