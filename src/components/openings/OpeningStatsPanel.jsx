function statPercent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function StatOrb({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div
        className="mx-auto grid h-20 w-20 place-items-center rounded-full border bg-slate-950/80 text-xl font-bold text-white"
        style={{
          borderColor: accent,
          boxShadow: `0 0 28px ${accent}33, inset 0 0 22px ${accent}18`,
        }}
      >
        {value}
      </div>
      <p className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}

export default function OpeningStatsPanel({ node }) {
  const games = node?.games || 0;
  const wins = statPercent(node?.wins || 0, games);
  const draws = statPercent(node?.draws || 0, games);
  const losses = statPercent(node?.losses || 0, games);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatOrb label="Games Reached" value={games} accent="#a855f7" />
      <StatOrb label="Wins" value={`${wins}%`} accent="#22d3ee" />
      <StatOrb label="Draws" value={`${draws}%`} accent="#c084fc" />
      <StatOrb label="Losses" value={`${losses}%`} accent="#fb7185" />
    </div>
  );
}
