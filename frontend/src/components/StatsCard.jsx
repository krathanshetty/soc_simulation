export default function StatsCard({ label, description, value, accent, icon, trendText, trendTone = "positive" }) {
  const trendClass = trendTone === "positive" ? "text-emerald-300" : "text-red-300";

  return (
    <div className="glass-card h-full min-h-[185px] border border-cyan-400/20 p-4 rounded-3xl shadow-[0_24px_80px_-40px_rgba(0,255,255,0.6)] transition hover:-translate-y-1 hover:border-cyan-300/50">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900/70 text-cyan-200">
          {icon || <span className="h-2 w-2 rounded-full bg-cyan-300" />}
        </div>
        <div>
          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>{label}</span>
          {description ? <p className="mt-0.5 text-[11px] leading-4 text-slate-400">{description}</p> : null}
        </div>
      </div>
      <p className="mt-3 text-center text-3xl font-bold tracking-tight text-white">{value}</p>
      {trendText ? <p className={`mt-2 text-center text-xs ${trendClass}`}>{trendText}</p> : null}
    </div>
  );
}
