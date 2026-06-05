import MoveExplorerTable from "./MoveExplorerTable";
import OpeningStatsPanel from "./OpeningStatsPanel";
import RepertoirePanel from "./RepertoirePanel";

const tabs = [
  { id: "moves", label: "Moves" },
  { id: "statistics", label: "Statistics" },
  { id: "repertoire", label: "Repertoire" },
];

export default function OpeningTreePanel({
  activeTab,
  colorScope,
  currentNode,
  isLoadingMoves = false,
  onSelectMove,
  onColorScopeChange,
  onTabChange,
  repertoire,
}) {
  return (
    <section className="astro-card min-w-0 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="astro-eyebrow">Opening tree</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Personal Move Explorer</h2>
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-slate-950/55 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={[
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "border border-purple-400/35 bg-purple-500/15 text-white shadow-[0_0_18px_rgba(168,85,247,0.14)]"
                  : "text-slate-400 hover:text-purple-100",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {activeTab === "moves" && (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Repertoire color
              </span>
              <div className="flex gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1">
                {[
                  ["all", "Todas"],
                  ["white", "Brancas"],
                  ["black", "Pretas"],
                ].map(([scope, label]) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => onColorScopeChange(scope)}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      colorScope === scope
                        ? "border border-cyan-300/30 bg-cyan-500/10 text-cyan-100"
                        : "text-slate-400 hover:text-purple-100",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <MoveExplorerTable
              moves={currentNode?.children || []}
              onSelectMove={onSelectMove}
              colorScope={colorScope}
              isLoading={isLoadingMoves}
            />
          </div>
        )}
        {activeTab === "statistics" && <OpeningStatsPanel node={currentNode} />}
        {activeTab === "repertoire" && <RepertoirePanel repertoire={repertoire} />}
      </div>
    </section>
  );
}
