function getScore(move) {
  const total = Math.max(1, move.games || 0);
  return Math.round(((move.wins || 0) + (move.draws || 0) * 0.5) / total * 100);
}

function getColorGames(move, colorScope) {
  if (colorScope === "white") return move.whiteGames || 0;
  if (colorScope === "black") return move.blackGames || 0;
  return move.games || 0;
}

function getColorBadge(move) {
  const whiteGames = move.whiteGames || 0;
  const blackGames = move.blackGames || 0;

  if (whiteGames > 0 && blackGames > 0) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
          W {whiteGames}
        </span>
        <span className="rounded-full border border-violet-300/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
          B {blackGames}
        </span>
      </div>
    );
  }

  if (whiteGames > 0) {
    return (
      <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
        White
      </span>
    );
  }

  if (blackGames > 0) {
    return (
      <span className="rounded-full border border-violet-300/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
        Black
      </span>
    );
  }

  return null;
}

function MoveRows({ moves, onSelectMove, colorScope = "all" }) {
  if (!moves.length) {
    return (
      <div className="border-b border-white/[0.06] px-4 py-5 text-sm text-slate-500 last:border-b-0">
        Nenhum lance nesta cor para esta posição.
      </div>
    );
  }

  return moves.map((move, index) => {
    const score = typeof move.score === "number" ? Math.round(move.score) : getScore(move);
    const displayGames = getColorGames(move, colorScope);

    return (
      <button
        key={`${move.id}-${colorScope}-${index}`}
        type="button"
        onClick={() => onSelectMove(move)}
        className={[
          "group grid grid-cols-[minmax(0,1fr)_92px_120px] items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left transition last:border-b-0",
          index % 2 === 0 ? "bg-white/[0.025]" : "bg-slate-950/25",
          "hover:border-purple-400/20 hover:bg-[linear-gradient(135deg,rgba(168,85,247,0.12),rgba(34,211,238,0.05))]",
        ].join(" ")}
      >
        <span className="min-w-0">
          <span className="block truncate font-semibold text-white group-hover:text-cyan-100">
            {move.san || move.move}
          </span>
          <span className="mt-1 block">{getColorBadge(move)}</span>
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2 py-1 text-center text-sm text-slate-200">
          {displayGames}
        </span>
        <span className="grid gap-1">
          <span className="text-xs font-semibold text-slate-200">{score}%</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-slate-950/80 ring-1 ring-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-400 to-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.28)]"
              style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
            />
          </span>
        </span>
      </button>
    );
  });
}

function SectionHeader({ title, subtitle, tone }) {
  const toneClass =
    tone === "black"
      ? "from-violet-500/18 to-slate-950/40 text-violet-100"
      : "from-cyan-500/16 to-slate-950/40 text-cyan-100";

  return (
    <div className={`border-y border-white/[0.07] bg-gradient-to-r ${toneClass} px-4 py-3`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

export default function MoveExplorerTable({ moves, onSelectMove, colorScope = "all", isLoading = false }) {
  if (!moves?.length && isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-purple-400/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(7,7,17,0.82))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mx-auto grid max-w-sm place-items-center gap-4 py-8 text-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border border-purple-400/20" />
            <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-purple-400 shadow-[0_0_22px_rgba(34,211,238,0.25)]" />
            <div className="absolute inset-5 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Loading position moves</p>
            <p className="mt-1 text-xs text-slate-500">Preparing your personal repertoire tree.</p>
          </div>
          <div className="grid w-full gap-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-9 overflow-hidden rounded-xl border border-white/10 bg-slate-950/55"
              >
                <div className="h-full w-1/2 animate-[pulse_1.15s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!moves?.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 p-6">
        <div className="mx-auto grid max-w-sm place-items-center gap-3 py-6 text-center">
          <div className="h-10 w-10 rounded-full border border-slate-700/80 bg-slate-950/80 shadow-[inset_0_0_18px_rgba(148,163,184,0.08)]" />
          <p className="text-sm text-slate-500">Terminal position in your current repertoire.</p>
        </div>
      </div>
    );
  }

  const whiteMoves = moves.filter((move) => (move.whiteGames || 0) > 0);
  const blackMoves = moves.filter((move) => (move.blackGames || 0) > 0);
  const scopedMoves =
    colorScope === "white"
      ? whiteMoves
      : colorScope === "black"
        ? blackMoves
        : moves;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-400/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(7,7,17,0.82))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {isLoading && (
        <div className="absolute inset-x-0 top-0 z-20 border-b border-cyan-300/20 bg-slate-950/85 px-4 py-2 text-xs font-semibold text-cyan-100 backdrop-blur">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          Loading next position...
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_92px_120px] border-b border-purple-400/15 bg-[linear-gradient(135deg,rgba(168,85,247,0.16),rgba(34,211,238,0.07),rgba(15,23,42,0.58))] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
        <span className="text-purple-100">Move</span>
        <span className="text-cyan-100/90">Games</span>
        <span className="text-cyan-100/90">Score</span>
      </div>

      <div className="grid max-h-[28rem] overflow-y-auto [scrollbar-color:rgba(168,85,247,0.38)_rgba(15,23,42,0.42)] [scrollbar-width:thin]">
        {colorScope === "all" ? (
          <>
            <SectionHeader
              title="Partidas como brancas"
              subtitle="Linhas alcançadas quando você jogou de brancas."
            />
            <MoveRows moves={whiteMoves} onSelectMove={onSelectMove} colorScope="white" />
            <SectionHeader
              title="Partidas como pretas"
              subtitle="Linhas alcançadas quando você jogou de pretas."
              tone="black"
            />
            <MoveRows moves={blackMoves} onSelectMove={onSelectMove} colorScope="black" />
          </>
        ) : (
          <MoveRows moves={scopedMoves} onSelectMove={onSelectMove} colorScope={colorScope} />
        )}
      </div>
    </div>
  );
}
