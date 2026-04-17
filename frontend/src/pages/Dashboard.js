import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.14),_transparent_18%)]" />
      <div className="relative z-10 px-6 py-8 xl:px-16">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70 mb-2">SIMULATED SECURITY OPERATIONS CENTER</p>
            <h1 className="text-4xl md:text-4xl font-black tracking-[0.25em] text-white drop-shadow-[0_0_35px_rgba(6,182,212,0.18)]">SOC SIMULATION - COMMAND CENTER</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full border border-indigo-400/30 bg-slate-900/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200 transition hover:border-indigo-300/60 hover:bg-slate-800"
            >
              {showHistory ? "Hide History" : `History (${pastAlerts.length})`}
            </button>
            <button
              type="button"
              onClick={handleClearAlerts}
              className="inline-flex items-center justify-center rounded-full border border-cyan-400/20 bg-slate-900/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200 transition hover:border-cyan-300/50 hover:bg-slate-800"
            >
              Clear Alerts
            </button>
          </div>
        </header>

        {showHistory && (
          <section className="mb-8 glass-card border border-indigo-400/30 p-6 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(99,102,241,0.35)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/80">Alert History</p>
                <h2 className="text-2xl font-bold text-white">Past Alerts (Before Current Timeline)</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200">{pastAlerts.length} total</span>
            </div>
            <div className="grid gap-4 max-h-[320px] overflow-y-auto pr-3">
              {pastAlerts.length === 0 ? (
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6 text-center text-slate-400">No past alerts available.</div>
              ) : (
                pastAlerts.map((alert, index) => <AlertCard key={`history-${alert.timestamp}-${index}`} alert={alert} />)
              )}
            </div>
          </section>
        )}

        <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-5 md:grid-cols-3">
            <StatsCard label="Total Alerts" description="Total threat events received so far" value={stats.totalAlerts} accent="text-cyan-300" />
            <StatsCard label="High Severity" description="Critical alerts needing attention" value={stats.highSeverityAlerts} accent="text-red-400" />
            <StatsCard label="Unique IPs" description="Distinct source IPs detected" value={stats.uniqueIPs} accent="text-amber-300" />
          </div>

          <div className="glass-card border border-cyan-400/20 p-5 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(0,255,255,0.35)]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-white">Alert Types</h2>
                <p className="text-sm text-slate-400">Realtime distribution by type</p>
              </div>
            </div>
            <div className="h-56">
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

        <main className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="glass-card border border-cyan-400/20 p-6 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(0,255,255,0.35)]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Live Alerts</p>
                <h2 className="text-3xl font-bold text-white">Real-time Threat Feed</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200">Latest {alerts.length}</span>
            </div>
            <div className="grid gap-4 max-h-[660px] overflow-y-auto pr-3">
              {alerts.length === 0 ? (
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-8 text-center text-slate-400">Waiting for threat data...</div>
              ) : (
                alerts.map((alert, index) => <AlertCard key={`${alert.timestamp}-${index}`} alert={alert} />)
              )}
            </div>
          </section>

          <section className="glass-card border border-cyan-400/20 p-6 rounded-[2rem] shadow-[0_40px_120px_-70px_rgba(0,255,255,0.35)]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Log Stream</p>
                <h2 className="text-3xl font-bold text-white">Event Timeline</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200">Recent {Math.min(logs.length, 20)}</span>
            </div>
            <div className="max-h-[660px] overflow-y-auto pr-3">
              {logs
                .slice(-20)
                .reverse()
                .map((log, index) => <LogItem key={`${log.timestamp}-${index}`} log={log} />)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
