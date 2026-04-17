export default function StatsCard({ label, description, value, accent }) {
  return (
    <div className="glass-card border border-cyan-400/20 p-5 rounded-3xl shadow-[0_24px_80px_-40px_rgba(0,255,255,0.6)] transition hover:-translate-y-1 hover:border-cyan-300/50">
      <div className="mb-4 text-center">
        <span className={`text-sm font-semibold uppercase tracking-[0.35em] ${accent}`}>{label}</span>
        {description ? <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p> : null}
      </div>
      <p className="text-4xl font-bold tracking-tight text-white text-center">{value}</p>
    </div>
  );
}
