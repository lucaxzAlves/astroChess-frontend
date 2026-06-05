const insightStyles = {
  choice: "border-cyan-400/25 bg-cyan-500/8",
  style: "border-purple-400/25 bg-purple-500/8",
  warning: "border-amber-300/25 bg-amber-500/8",
  recommendation: "border-emerald-300/25 bg-emerald-500/8",
};

export default function PositionInsights({ insights }) {
  return (
    <section className="astro-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="astro-eyebrow">Astro diagnostics</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Position Insights</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Habit-level signals from your personal repertoire, prepared for future backend data.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <article
            key={`${insight.type}-${insight.title}`}
            className={`rounded-2xl border p-4 ${insightStyles[insight.type] || insightStyles.choice}`}
          >
            <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300" />
            <h3 className="text-base font-semibold text-white">{insight.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{insight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
