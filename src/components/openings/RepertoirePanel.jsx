function RepertoireList({ title, items, accent = "purple" }) {
  const accentClass = {
    purple: "border-purple-400/25 bg-purple-500/10 text-purple-100",
    cyan: "border-cyan-400/25 bg-cyan-500/10 text-cyan-100",
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-100",
  }[accent];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-xl border px-3 py-2 text-sm ${accentClass}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RepertoirePanel({ repertoire }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RepertoireList title="Most Played Lines" items={repertoire.mostPlayedLines} />
      <RepertoireList title="Favorite Openings" items={repertoire.favoriteOpenings} accent="cyan" />
      <RepertoireList title="Best Performing Openings" items={repertoire.bestPerformingOpenings} accent="cyan" />
      <RepertoireList title="Needs Work" items={repertoire.worstPerformingOpenings} accent="rose" />
    </div>
  );
}
