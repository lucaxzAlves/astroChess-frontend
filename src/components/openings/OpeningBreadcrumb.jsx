export default function OpeningBreadcrumb({ path, onJumpToPly }) {
  return (
    <div className="rounded-2xl border border-purple-500/18 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(8,8,18,0.88))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Current line
        </span>
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max items-center gap-2">
            {path.map((node, index) => (
              <div key={`${node.id}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-700">›</span>}
                <button
                  type="button"
                  onClick={() => onJumpToPly(index)}
                  className={[
                    "max-w-28 truncate rounded-full border px-3 py-1 text-xs font-semibold transition",
                    index === path.length - 1
                      ? "border-cyan-300/35 bg-cyan-500/10 text-cyan-100"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-purple-400/35 hover:text-purple-100",
                  ].join(" ")}
                  title={node.san || node.move}
                >
                  {node.san || node.move}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
