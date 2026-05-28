export type MoveItem = {
  san: string;
  fen: string;
  annotation?: "?!" | "?" | "??";
};

type Props = {
  moves: MoveItem[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
};

export default function MoveList({ moves, currentMoveIndex, onSelectMove }: Props) {
  return (
    <div className="rounded-xl border border-violet-400/20 bg-[#0a1224] p-3">
      <div className="mb-2 grid grid-cols-[44px_1fr_1fr] px-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
        <span>#</span>
        <span>Brancas</span>
        <span>Pretas</span>
      </div>
      <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
        {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, rowIndex) => {
          const whiteIndex = rowIndex * 2;
          const blackIndex = whiteIndex + 1;
          const whiteMove = moves[whiteIndex];
          const blackMove = moves[blackIndex];

          const baseClass =
            "rounded-md border px-2 py-1.5 text-left text-sm transition-colors duration-150";

          return (
            <div key={`row-${rowIndex}`} className="grid grid-cols-[44px_1fr_1fr] items-center gap-2">
              <span className="text-xs text-slate-500">{rowIndex + 1}.</span>
              <button
                type="button"
                onClick={() => onSelectMove(whiteIndex + 1)}
                className={`${baseClass} ${
                  currentMoveIndex === whiteIndex + 1
                    ? "border-violet-300/70 bg-violet-400/25 text-violet-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-violet-300/50 hover:bg-slate-800"
                }`}
              >
                {whiteMove ? `${whiteMove.san}${whiteMove.annotation ?? ""}` : "-"}
              </button>
              <button
                type="button"
                onClick={() => onSelectMove(blackIndex + 1)}
                disabled={!blackMove}
                className={`${baseClass} ${
                  currentMoveIndex === blackIndex + 1
                    ? "border-violet-300/70 bg-violet-400/25 text-violet-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-violet-300/50 hover:bg-slate-800"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {blackMove ? `${blackMove.san}${blackMove.annotation ?? ""}` : "-"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
