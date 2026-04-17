const statusTone = {
  success: "bg-emerald-500/10 text-emerald-200 border-emerald-400/20",
  failed: "bg-red-500/10 text-red-200 border-red-400/20",
  port_scan: "bg-amber-500/10 text-amber-200 border-amber-400/20",
};

export default function LogItem({ log }) {
  const status = log.status?.toLowerCase() || log.event?.toLowerCase();
  const tone = statusTone[status] || "bg-slate-800/80 text-slate-200 border-slate-600/40";

  return (
    <div className={`border-l-4 p-3 rounded-3xl mb-3 transition hover:shadow-[0_0_40px_rgba(0,255,255,0.12)] hover:-translate-y-0.5 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{log.event || "event"}</p>
          <p className="text-xs text-slate-400">{log.ip} · {log.username || "anonymous"}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{status}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{new Date(log.timestamp || Date.now()).toLocaleString()}</p>
    </div>
  );
}
