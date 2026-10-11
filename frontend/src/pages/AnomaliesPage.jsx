import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const AnomaliesPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [csvResult, setCsvResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sampleCsvContent, setSampleCsvContent] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getAnomalyEvents(severityFilter);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    api.getSampleCSV().then((res) => {
      if (res.content) setSampleCsvContent(res.content);
    }).catch(() => {});
  }, [severityFilter]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadLogsCSV(file);
      setCsvResult(res);
    } catch (err) {
      alert(`CSV Upload Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRunSampleCSV = async () => {
    if (!sampleCsvContent) return;
    setUploading(true);
    try {
      const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
      const file = new File([blob], 'sample_cloud_logs.csv', { type: 'text/csv' });
      const res = await api.uploadLogsCSV(file);
      setCsvResult(res);
    } catch (err) {
      alert(`Evaluation Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>ISOLATION FOREST ANOMALY ENGINE</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">UNSUPERVISED ML</span>
          </h1>
          <p className="text-xs text-slate-400">Scikit-learn tree-based isolation detecting multi-dimensional cloud outliers</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Severity Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>

          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Anomalies"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Engine Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            <span>MODEL HYPERPARAMETERS</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between"><span>Estimators:</span> <span className="text-slate-200">100 Trees</span></div>
            <div className="flex justify-between"><span>Contamination:</span> <span className="text-slate-200">0.08 (8%)</span></div>
            <div className="flex justify-between"><span>Algorithm:</span> <span className="text-slate-200">iForest Unsupervised</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
            <Layers className="w-4 h-4" />
            <span>FEATURE SPACE (6D)</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div>• login_hour, login_frequency</div>
            <div>• download_count, session_duration</div>
            <div>• payload_size_mb, sensitive_file_ratio</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
            <Info className="w-4 h-4" />
            <span>LIGHTWEIGHT EXPLAINABILITY</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Eliminates slow external SHAP overhead while providing mathematically transparent Z-score baseline deviations (Δz = (x - μ) / σ).
          </div>
        </div>
      </div>

      {/* CSV Live Ingestion Dropzone */}
      <div className="p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 transition space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>LIVE CLOUD LOGS CSV INGESTION & BATCH SCORING</span>
            </h3>
            <p className="text-xs text-slate-400">
              Drop any CSV log file containing cloud actions to run the Isolation Forest anomaly detector live.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunSampleCSV}
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-semibold transition flex items-center space-x-1.5 shadow-cyan-glow"
            >
              <span>Evaluate Demo CSV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <label className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer transition flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Scoring...' : 'Upload Custom CSV'}</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* CSV Live Prediction Summary if uploaded */}
        {csvResult && (
          <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border pb-3">
              <div className="font-semibold text-xs text-slate-200">
                Evaluation Results: <span className="text-cyan-400 font-mono">{csvResult.filename}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span>Processed: <b className="text-slate-100">{csvResult.total_records_processed}</b></span>
                <span>Anomalies: <b className="text-amber-400">{csvResult.anomalies_detected}</b></span>
                <span>High-Risk: <b className="text-red-400">{csvResult.high_risk_alerts}</b></span>
                <span>Mean Anomaly: <b className="text-cyan-400">{csvResult.mean_anomaly_score}</b></span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-cyber-border text-slate-500">
                    <th className="py-1.5 px-2">ROW</th>
                    <th className="py-1.5 px-2">USER</th>
                    <th className="py-1.5 px-2">EVENT TYPE</th>
                    <th className="py-1.5 px-2">ANOMALY SCORE</th>
                    <th className="py-1.5 px-2">SEVERITY</th>
                    <th className="py-1.5 px-2">TOP CONTRIBUTING FACTOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {csvResult.records.map((r) => (
                    <tr key={r.row_index} className={r.is_anomalous ? 'bg-red-950/20 text-red-200' : 'text-slate-400'}>
                      <td className="py-2 px-2 text-slate-500">#{r.row_index}</td>
                      <td className="py-2 px-2 text-slate-200 font-semibold">{r.username}</td>
                      <td className="py-2 px-2">{r.event_type}</td>
                      <td className="py-2 px-2 font-bold">{r.anomaly_score}</td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          r.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400' :
                          r.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400' :
                          r.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="py-2 px-2 truncate max-w-xs">{r.top_factors[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Live Scored Events Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden shadow-xl space-y-2 p-5">
        <h3 className="text-sm font-bold text-slate-100">SCORED CLOUD EVENTS & ANOMALY ATTRIBUTION</h3>
        <p className="text-xs text-slate-400">Events ranked by Isolation Forest anomaly score (0.0 to 1.0):</p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">IDENTITY</th>
                <th className="py-2.5 px-3">OPERATION</th>
                <th className="py-2.5 px-3">ANOMALY SCORE</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3">TOP CONTRIBUTING FACTORS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {events.map((ev, i) => (
                <tr key={i} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{ev.full_name || ev.username}</div>
                    <div className="text-[11px] font-mono text-cyan-400">{ev.username}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">
                    {ev.last_action}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={ev.anomaly_score >= 0.70 ? 'text-red-400' : 'text-slate-300'}>
                      {ev.anomaly_score}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal"> / 1.0</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      ev.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      ev.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      ev.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {ev.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      {ev.contributing_factors?.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="text-[11px] text-slate-400 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 inline-block mr-1">
                          {factor}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
