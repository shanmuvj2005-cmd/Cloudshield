import React from 'react';
import { 
  Shield, 
  Cpu, 
  Bot, 
  Crosshair, 
  ArrowRight, 
  Activity, 
  Lock, 
  Terminal, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Search,
  EyeOff
} from 'lucide-react';

export const LandingPage = ({ onEnterConsole }) => {
  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Bar */}
      <nav className="border-b border-cyber-border/80 px-8 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-wider">CLOUD<span className="text-cyan-400">SHIELD</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Version 1.0.0 • Production SOC Prototype</span>
          <button
            onClick={onEnterConsole}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-cyan-glow flex items-center space-x-2"
          >
            <span>Launch SOC Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Behavioral Security for AWS & Google Workspace</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight max-w-4xl mx-auto">
          Stopping Insider Threats Behind the Perimeter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Unsupervised AI</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Traditional firewalls and VPNs are blind to authorized credentials. CloudShield combines 
          <b> User and Entity Behavior Analytics (UEBA)</b>, <b>Isolation Forest anomaly scoring</b>, 
          <b> NLP intent analysis</b>, and <b>honey-token deception</b> into unified automated containment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onEnterConsole}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-cyan-glow flex items-center justify-center space-x-2 transition"
          >
            <span>Open Security Operations Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#architecture"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-sm transition"
          >
            View Architecture & Tech Stack
          </a>
        </div>
      </section>

      {/* Problem Statement Grid */}
      <section className="px-6 py-16 bg-slate-950/50 border-y border-cyber-border">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono uppercase text-red-400 tracking-widest">THE THREAT LANDSCAPE</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-100">Why Traditional Cloud Security Fails</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">Perimeter Invisibility</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Legitimate authenticated employees operate behind firewalls with valid OAuth tokens, rendering perimeter inspection useless.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">Silent GenAI Exfiltration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unauthorized use of external GenAI tools enables users to copy-paste proprietary code and customer records without network file drops.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-950/50 border border-yellow-500/30 text-yellow-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">Static Rule Overload</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conventional static thresholds generate high false positive noise, overwhelming analysts while sophisticated exfiltrators slip through.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">Delayed Containment</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detection without immediate response allows hours of unauthorized egress before security teams manually revoke access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section id="architecture" className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-mono uppercase text-cyan-400 tracking-widest">HOW CLOUDSHIELD WORKS</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-100">End-to-End Threat Intelligence & Containment Flow</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border relative space-y-4">
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">STAGE 1</span>
            <h4 className="font-bold text-base text-slate-100">Telemetry Ingestion & UEBA</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests AWS CloudTrail, Google Workspace Drive logs, and internal messaging telemetry. Computes individual 30-day baselines across 6 telemetry dimensions.
            </p>
            <div className="text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-800 pt-3">
              <div>• Login Hour & Frequency</div>
              <div>• Download Count & Duration</div>
              <div>• Payload Egress & Sensitivity</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-cyber-card border border-cyan-500/40 relative space-y-4 shadow-cyan-glow">
            <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">STAGE 2</span>
            <h4 className="font-bold text-base text-slate-100">Dual AI Engine & Deception</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unsupervised <b>Isolation Forest</b> scores behavioural outliers with transparent Z-score attribution. <b>NLP Analyzer</b> scans messages for exfiltration intent.
            </p>
            <div className="text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-800 pt-3">
              <div>• Isolation Forest (0.0 – 1.0)</div>
              <div>• NLTK Sentiment + Intent Lexicon</div>
              <div>• Virtual Canary Honey-Files</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border relative space-y-4">
            <span className="text-xs font-mono text-red-400 px-2 py-0.5 rounded bg-red-950 border border-red-800">STAGE 3</span>
            <h4 className="font-bold text-base text-slate-100">Threat Fusion & Response</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines behavioral, NLP, and canary signals into a unified 0–100 Risk Score. Enables automated containment playbooks with immutable audit logging.
            </p>
            <div className="text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-800 pt-3">
              <div>• Session Termination</div>
              <div>• VPN Subnet Quarantine</div>
              <div>• Decoy Honeynet Redirection</div>
            </div>
          </div>
        </div>

        {/* Demo Credentials CTA Box */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-cyber-card border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h4 className="text-lg font-bold text-slate-100">Ready to test the live platform?</h4>
            <p className="text-xs text-slate-400">
              Pre-seeded with 4 realistic malicious insider personas, interactive CSV upload, and automated response actions.
            </p>
            <div className="inline-block px-3 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-cyan-400">
              Demo Credentials: <span className="text-slate-200">admin</span> / <span className="text-slate-200">cloudshield2026</span>
            </div>
          </div>
          <button
            onClick={onEnterConsole}
            className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-cyan-glow whitespace-nowrap transition"
          >
            Enter SOC Console Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-cyber-border py-6 px-8 text-center text-xs text-slate-500 font-mono">
        CloudShield • AI-Based Insider Threat Detection Platform • FastAPI • scikit-learn • React • Tailwind
      </footer>
    </div>
  );
};
