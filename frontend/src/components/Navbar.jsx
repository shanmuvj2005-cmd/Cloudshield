import React, { useState } from 'react';
import { 
  Shield, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  Flame, 
  User, 
  LogOut, 
  ExternalLink,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { api } from '../services/api';

export const Navbar = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { connected, simulatorRunning, toggleSimulator } = useWebSocket();
  const [injectMenuOpen, setInjectMenuOpen] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);

  const handleInject = async (scenario) => {
    setInjecting(true);
    setInjectMenuOpen(false);
    try {
      const res = await api.injectScenario(scenario);
      setBannerMessage(`Scenario Injected: ${res.scenario}`);
      setTimeout(() => setBannerMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-wider text-slate-100">CLOUD<span className="text-cyan-400">SHIELD</span></span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">SOC v1.0</span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI-Based Insider Threat Platform</p>
        </div>
      </div>

      {/* Center status pill & controls */}
      <div className="flex items-center space-x-3">
        {/* Banner notification if scenario injected */}
        {bannerMessage && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-red-950/60 border border-red-500/40 text-red-300 rounded-full text-xs animate-pulse">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* WebSocket Live Status */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          {connected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 font-mono hidden md:inline">STREAM LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span className="text-slate-400 font-mono hidden md:inline">OFFLINE</span>
            </>
          )}
        </div>

        {/* Simulator Stream Toggle (Play / Pause) */}
        <button
          onClick={toggleSimulator}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            simulatorRunning
              ? 'bg-amber-950/50 border-amber-600/50 text-amber-300 hover:bg-amber-900/50'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="Toggle Background Telemetry Streamer"
        >
          {simulatorRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Stream: <b className="text-amber-400">ON</b></span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>Stream: <span className="text-slate-400">PAUSED</span></span>
            </>
          )}
        </button>

        {/* On-Demand Attack Scenario Injector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setInjectMenuOpen(!injectMenuOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/40 text-xs font-medium transition-all shadow-red-glow/20"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Inject Attack</span>
            <ChevronDown className="w-3 h-3 text-red-400" />
          </button>

          {injectMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-cyber-border text-slate-400 font-mono text-[11px] flex justify-between">
                <span>DEMO ATTACK PERSONAS</span>
                <span className="text-red-400 font-semibold">4 SCENARIOS</span>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => handleInject('SARAH_CHEN_EXFIL')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-200 flex flex-col transition"
                >
                  <span className="font-semibold text-red-400">Sarah Chen: GenAI Code Exfil</span>
                  <span className="text-[11px] text-slate-400">Off-hours 02:45 AM git clone + paste in ChatGPT</span>
                </button>

                <button
                  onClick={() => handleInject('ELENA_ROSTOVA_CANARY')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-200 flex flex-col transition"
                >
                  <span className="font-semibold text-amber-400">Elena Rostova: Honey-File Hit</span>
                  <span className="text-[11px] text-slate-400">Trips root AWS keys canary decoy</span>
                </button>

                <button
                  onClick={() => handleInject('MARCUS_VANCE_SALES')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-200 flex flex-col transition"
                >
                  <span className="font-semibold text-orange-400">Marcus Vance: Bulk CRM Export</span>
                  <span className="text-[11px] text-slate-400">98 client accounts exfiltration to personal cloud</span>
                </button>

                <button
                  onClick={() => handleInject('BENIGN_ACTIVITY')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-200 flex flex-col transition"
                >
                  <span className="font-semibold text-emerald-400">Normal Baseline Activity</span>
                  <span className="text-[11px] text-slate-400">Routine benign cloud action</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right User & Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition px-2 py-1 rounded"
        >
          <span>About</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        <div className="flex items-center space-x-2 pl-3 border-l border-cyber-border">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-medium text-slate-200">{user?.username || 'admin'}</div>
            <div className="text-[10px] text-cyan-400">SOC Commander</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
