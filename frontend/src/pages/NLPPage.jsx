import React, { useState, useEffect } from 'react';
import { 
  MessageSquareWarning, 
  Bot, 
  Search, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  Smile, 
  Frown, 
  Meh, 
  RefreshCw,
  Tag
} from 'lucide-react';
import { api } from '../services/api';

export const NLPPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [channelFilter, setChannelFilter] = useState('');
  
  // Interactive Live Sandbox State
  const [sandboxText, setSandboxText] = useState(
    "I'm going to dump the customer database to my personal drive before my resignation next Friday."
  );
  const [sandboxType, setSandboxType] = useState('CHAT');
  const [sandboxResult, setSandboxResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getNLPMessages(channelFilter, flaggedOnly);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [channelFilter, flaggedOnly]);

  const handleRunSandbox = async () => {
    if (!sandboxText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeText(sandboxText, sandboxType);
      setSandboxResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Run sandbox once initially
  useEffect(() => {
    handleRunSandbox();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>NLP EXFILTRATION & SHADOW AI MONITOR</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">INTENT & SENTIMENT</span>
          </h1>
          <p className="text-xs text-slate-400">Analysis of Slack/Teams internal communications and simulated external GenAI prompts</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Show Flagged Only</span>
          </label>

          <button
            onClick={fetchMessages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Sandbox Testbed */}
      <div className="p-5 rounded-2xl bg-cyber-card border border-cyan-500/40 shadow-cyan-glow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ANALYST NLP TEST SANDBOX</span>
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">REAL-TIME EVALUATION</span>
        </div>
        <p className="text-xs text-slate-400">
          Enter any sample chat message or GenAI prompt to test the NLTK sentiment scorer and exfiltration intent detector:
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSandboxType('CHAT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                sandboxType === 'CHAT' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Internal Chat (Slack/Teams)
            </button>
            <button
              onClick={() => setSandboxType('GENAI_PROMPT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                sandboxType === 'GENAI_PROMPT' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Simulated GenAI Prompt
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              placeholder="Type message to evaluate for exfiltration intent..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={handleRunSandbox}
              disabled={analyzing}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-cyan-glow flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <span>{analyzing ? 'Scoring...' : 'Score Intent'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sandbox Output Banner */}
        {sandboxResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">NLP RISK SCORE:</span>
              <span className={`text-xl font-bold ${
                sandboxResult.nlp_risk_score >= 60 ? 'text-red-400' :
                sandboxResult.nlp_risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {sandboxResult.nlp_risk_score} / 100
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">SENTIMENT POLARITY:</span>
              <span className="text-slate-200 font-semibold flex items-center space-x-1.5 mt-1">
                {sandboxResult.sentiment_label === 'NEGATIVE' ? <Frown className="w-4 h-4 text-red-400" /> :
                 sandboxResult.sentiment_label === 'POSITIVE' ? <Smile className="w-4 h-4 text-emerald-400" /> :
                 <Meh className="w-4 h-4 text-slate-400" />}
                <span>{sandboxResult.sentiment_label} ({sandboxResult.sentiment_score})</span>
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">THREAT CATEGORY:</span>
              <span className="text-cyan-400 font-bold block mt-1">
                {sandboxResult.category || 'BENIGN'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">MATCHED TOKENS:</span>
              <span className="text-amber-400 block mt-1 truncate">
                {sandboxResult.flagged_keywords?.length > 0 ? sandboxResult.flagged_keywords.join(', ') : 'None'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Monitored Communications Feed */}
      <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">LOGGED CHATS & GENAI PROMPT STREAMS</h3>
          <span className="text-xs font-mono text-slate-500">{messages.length} Records</span>
        </div>

        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl border transition space-y-2 ${
                msg.flagged
                  ? 'border-red-500/40 bg-red-950/20 shadow-red-glow/20'
                  : 'border-slate-800 bg-slate-950/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  {msg.message_type === 'GENAI_PROMPT' ? (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[10px] flex items-center space-x-1">
                      <Bot className="w-3 h-3" />
                      <span>GENAI PROMPT</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px]">
                      SLACK CHAT
                    </span>
                  )}
                  <span className="font-bold text-slate-200">{msg.username}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{msg.channel}</span>
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  <span className={msg.nlp_risk_score >= 50 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    NLP Risk: {msg.nlp_risk_score}/100
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message text with keyword highlight */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {msg.text}
              </p>

              {/* Threat tags */}
              {msg.flagged && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-red-400 font-semibold">TRIGGERED:</span>
                  {msg.flagged_keywords?.map((kw, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                      "{kw}"
                    </span>
                  ))}
                  {msg.category && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 ml-auto">
                      Category: {msg.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
