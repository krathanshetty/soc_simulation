const severityStyle = {
  high: "border-red-400/80 bg-red-500/10 shadow-[0_0_30px_rgba(255,77,77,0.25)]",
  medium: "border-amber-400/70 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.18)]",
  low: "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.18)]",
};

export default function AlertCard({ alert }) {
  const severity = alert.severity?.toLowerCase() || "low";
  const valueClass = severityStyle[severity] || severityStyle.low;
  const icon = severity === "high" ? "🚨" : "⚠️";

  return (
    <div className={`glass-card border-l-4 p-4 rounded-3xl transition duration-500 ease-out ${valueClass} ${severity === "high" ? "animate-pulse-slow" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{icon} {alert.type || "Unknown Alert"}</p>
          <p className="text-sm text-slate-300 mt-1">{alert.ip}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-cyan-300/90">{severity}</span>
      </div>
      <div className="mt-4 text-sm text-slate-400 space-y-1">
        <p><span className="text-cyan-300">Timestamp:</span> {new Date(alert.timestamp || Date.now()).toLocaleString()}</p>
        {alert.description && <p><span className="text-cyan-300">Detail:</span> {alert.description}</p>}
      </div>
    </div>
  );
}
