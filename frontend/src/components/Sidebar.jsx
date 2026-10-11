import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  MessageSquareWarning, 
  Crosshair, 
  AlertTriangle, 
  ShieldCheck, 
  History,
  Terminal,
  Database
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'UEBA Profiles', icon: Users, badge: '8 Users' },
    { id: 'anomalies', label: 'Anomaly Engine', icon: Cpu, badge: 'Isolation Forest' },
    { id: 'nlp', label: 'NLP & GenAI Risks', icon: MessageSquareWarning, badge: null },
    { id: 'deception', label: 'Honey-Files & Traps', icon: Crosshair, badge: 'Canaries' },
    { id: 'alerts', label: 'Incident Alerts', icon: AlertTriangle, badge: 'Triage' },
    { id: 'audit', label: 'Containment Audit', icon: History, badge: null },
  ];

  return (
    <aside className="w-64 bg-cyber-bg border-r border-cyber-border flex flex-col justify-between shrink-0 h-[calc(100vh-65px)] overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-mono uppercase text-slate-500 tracking-wider px-3 mb-2">
            OPERATIONS CONSOLE
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Telemetry Scope Info */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold text-[11px]">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>TELEMETRY CONNECTOR</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>AWS CloudTrail:</span>
              <span className="text-emerald-400 font-mono">INGESTING</span>
            </div>
            <div className="flex justify-between">
              <span>Google Workspace:</span>
              <span className="text-emerald-400 font-mono">INGESTING</span>
            </div>
            <div className="flex justify-between">
              <span>Slack / Teams:</span>
              <span className="text-emerald-400 font-mono">PARSING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-cyber-border bg-slate-950/40 text-[11px] text-slate-500 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>ML ENGINE:</span>
          <span className="text-cyan-400">ISOLATION FOREST</span>
        </div>
        <div className="flex items-center justify-between">
          <span>EXPLAINABILITY:</span>
          <span className="text-slate-300">Z-SCORE ATTRIBUTION</span>
        </div>
        <div className="flex items-center justify-between">
          <span>SOC STATUS:</span>
          <span className="text-emerald-400">DEFENSE ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};
