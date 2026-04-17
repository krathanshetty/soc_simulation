import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FiActivity, FiAlertTriangle, FiClock, FiDatabase, FiGlobe, FiShield, FiTerminal, FiZap } from "react-icons/fi";
import AlertCard from "../components/AlertCard";
import LogItem from "../components/LogItem";
import StatsCard from "../components/StatsCard";

const API_BASE = "http://localhost:5000";
const REFRESH_INTERVAL_MS = 5000;

export default function Dashboard() {
  const [sessionStart, setSessionStart] = useState(() => new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [allAlerts, setAllAlerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [clock, setClock] = useState(() => new Date());

  const getEntryDate = useCallback((entry) => {
    if (!entry?.timestamp) return null;
    const parsed = new Date(entry.timestamp);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }, []);

  const isInCurrentSession = useCallback(
    (entry) => {
      const parsed = getEntryDate(entry);
      if (!parsed) return false;
      return parsed >= sessionStart;
    },
    [getEntryDate, sessionStart]
  );

  const pastAlerts = useMemo(
    () =>
      allAlerts
        .filter((alert) => {
          const parsed = getEntryDate(alert);
          return parsed && parsed < sessionStart;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [allAlerts, getEntryDate, sessionStart]
  );

  const fetchLogs = useCallback(() => {
    axios
      .get(`${API_BASE}/logs`)
      .then((res) => {
        const filteredLogs = res.data.filter(isInCurrentSession);
        setLogs(filteredLogs.slice(-100));
      })
      .catch((err) => {
        console.error("Backend fetch /logs error:", err);
        setLogs([]);
      });
  }, [isInCurrentSession]);

  const fetchAlerts = useCallback(() => {
    axios
      .get(`${API_BASE}/alerts`)
      .then((res) => {
        setAllAlerts(res.data);
        const filteredAlerts = res.data.filter(isInCurrentSession);
        setAlerts(filteredAlerts);
      })
      .catch((err) => {
        console.error("Backend fetch /alerts error:", err);
      });
  }, [isInCurrentSession]);

  useEffect(() => {
    fetchLogs();
    fetchAlerts();

    const refreshTimer = setInterval(() => {
      fetchLogs();
      fetchAlerts();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshTimer);
  }, [fetchLogs, fetchAlerts]);

  useEffect(() => {
    const clockTimer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const stats = useMemo(() => {
    const totalAlerts = alerts.length;
    const highSeverityAlerts = alerts.filter((alert) => alert.severity?.toLowerCase() === "high").length;
    const uniqueIPs = new Set(alerts.map((alert) => alert.ip)).size;

    const typeCounts = alerts.reduce((acc, alert) => {
      const type = alert.type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    return { totalAlerts, highSeverityAlerts, uniqueIPs, chartData };
  }, [alerts]);

  const handleClearAlerts = useCallback(() => {
    const shouldClear = window.confirm("Do you really want to clear alerts and restart the timeline from now?");
    if (!shouldClear) return;

    const resetTime = new Date();
    setSessionStart(resetTime);
    setAlerts([]);
    setLogs([]);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.14),_transparent_18%)]" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden px-5 py-4 lg:px-7 xl:px-9">
        <header className="mb-4 flex shrink-0 flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="pt-1">
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">SIMULATED SECURITY OPERATIONS CENTER</p>
            <h1 className="text-2xl md:text-2xl xl:text-[2.5rem] font-black tracking-[0.1em] text-white drop-shadow-[0_0_35px_rgba(6,182,212,0.18)]">SOC SIMULATION - COMMAND CENTER</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-w-[95px] items-center justify-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200">
              <FiActivity className="text-sm" />
              Live
            </span>
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="inline-flex min-w-[145px] items-center justify-center rounded-full border border-indigo-400/30 bg-slate-900/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-200 transition hover:border-indigo-300/60 hover:bg-slate-800"
            >
              {showHistory ? "Hide History" : `History (${pastAlerts.length})`}
            </button>
            <button
              type="button"
              onClick={handleClearAlerts}
              className="inline-flex min-w-[145px] items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-200 transition hover:border-red-300/60 hover:bg-red-500/20"
            >
              Clear Alerts
            </button>
          </div>
        </header>

        {showHistory && (
          <section className="mb-3 shrink-0 glass-card border border-indigo-400/30 p-4 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(99,102,241,0.35)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">Alert History</p>
                <h2 className="text-xl font-bold text-white">Past Alerts (Before Current Timeline)</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200">{pastAlerts.length} total</span>
            </div>
            <div className="grid max-h-[140px] gap-3 overflow-y-auto pr-2 xl:max-h-[170px]">
              {pastAlerts.length === 0 ? (
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6 text-center text-slate-400">No past alerts available.</div>
              ) : (
                pastAlerts.map((alert, index) => <AlertCard key={`history-${alert.timestamp}-${index}`} alert={alert} />)
              )}
            </div>
          </section>
        )}

        <section className="grid shrink-0 items-stretch gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)]">
          <div className="grid auto-rows-fr gap-3 md:grid-cols-3">
            <StatsCard
              label="Total Alerts"
              description="Total threat events received so far"
              value={stats.totalAlerts}
              accent="text-cyan-300"
              icon={<FiZap className="text-xl" />}
              trendText={`+${Math.max(1, stats.totalAlerts)} new in current session`}
            />
            <StatsCard
              label="High Severity"
              description="Critical alerts needing immediate attention"
              value={stats.highSeverityAlerts}
              accent="text-red-400"
              icon={<FiAlertTriangle className="text-xl" />}
              trendText={`${stats.highSeverityAlerts > 0 ? "+" : ""}${stats.highSeverityAlerts} high priority now`}
              trendTone={stats.highSeverityAlerts > 0 ? "negative" : "positive"}
            />
            <StatsCard
              label="Unique IPs"
              description="Distinct source IPs detected"
              value={stats.uniqueIPs}
              accent="text-amber-300"
              icon={<FiGlobe className="text-xl" />}
              trendText={`${stats.uniqueIPs} distinct active sources`}
            />
          </div>

          <div className="glass-card h-full min-h-[185px] border border-cyan-400/20 p-4 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(0,255,255,0.35)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Alert Types</h2>
                <p className="text-xs text-slate-400">Realtime distribution by type</p>
              </div>
            </div>
            <div className="h-[120px] md:h-[128px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barGap={6} barCategoryGap="24%">
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#020617', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, color: '#fff' }} />
                  <Bar dataKey="count" fill="#06b6d4" stroke="none" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <main className="mt-3 grid min-h-0 flex-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
          <section className="glass-card flex min-h-0 flex-col border border-cyan-400/20 p-6 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(0,255,255,0.35)]">
            <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Live Alerts</p>
                <h2 className="text-2xl font-bold text-white">Real-time Threat Feed</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200">Latest {alerts.length}</span>
            </div>
            <div className="grid min-h-[160px] flex-1 content-start gap-3 overflow-y-auto pr-2">
              {alerts.length === 0 ? (
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-8 text-center text-slate-400">Waiting for threat data...</div>
              ) : (
                alerts.map((alert, index) => <AlertCard key={`${alert.timestamp}-${index}`} alert={alert} />)
              )}
            </div>
            <div className="mt-2 shrink-0 border-t border-cyan-400/15 pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="text-sm font-semibold tracking-wide text-cyan-300 transition hover:text-cyan-200"
              >
                View All Alerts →
              </button>
            </div>
          </section>

          <section className="glass-card flex min-h-0 flex-col border border-cyan-400/20 p-6 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(0,255,255,0.35)]">
            <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Log Stream</p>
                <h2 className="text-2xl font-bold text-white">Event Timeline</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200">Recent {Math.min(logs.length, 20)}</span>
            </div>
            <div className="min-h-[160px] flex-1 overflow-y-auto pr-2">
              {logs
                .slice(-20)
                .reverse()
                .map((log, index) => <LogItem key={`${log.timestamp}-${index}`} log={log} />)}
            </div>
            <div className="mt-2 shrink-0 border-t border-cyan-400/15 pt-2 text-center">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-sm font-semibold tracking-wide text-cyan-300 transition hover:text-cyan-200"
              >
                View Full Timeline →
              </button>
            </div>
          </section>
        </main>

        <section className="mt-3 grid shrink-0 gap-2 md:grid-cols-2 xl:grid-cols-5">
          <div className="glass-card rounded-2xl border border-cyan-400/20 px-3 py-2">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-400"><FiShield className="text-sm" />SOC Simulation System</p>
            <p className="mt-0.5 text-[11px] text-slate-200">Protect • Detect • Respond</p>
          </div>
          <div className="glass-card rounded-2xl border border-cyan-400/20 px-3 py-2">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-400"><FiDatabase className="text-sm" />Data Source</p>
            <p className="mt-0.5 text-[11px] text-emerald-300">MongoDB Atlas</p>
          </div>
          <div className="glass-card rounded-2xl border border-cyan-400/20 px-3 py-2">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-400"><FiClock className="text-sm" />System Time</p>
            <p className="mt-0.5 text-[11px] text-slate-200">{clock.toLocaleString()}</p>
          </div>
          <div className="glass-card rounded-2xl border border-cyan-400/20 px-3 py-2">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-400"><FiActivity className="text-sm" />Status</p>
            <p className="mt-0.5 text-[11px] text-emerald-300">All Systems Operational</p>
          </div>
          <div className="glass-card rounded-2xl border border-cyan-400/20 px-3 py-2">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-400"><FiTerminal className="text-sm" />Version</p>
            <p className="mt-0.5 text-[11px] text-slate-200">v1.0.0</p>
          </div>
        </section>
      </div>
    </div>
  );
}
