import CoachInsightPanel from "./CoachInsightPanel";
import ReviewMoveList, { type ReviewMove } from "./ReviewMoveList";

type ReviewReport = {
  white: string;
  black: string;
  accuracy: string;
  rating: string;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
};

type ReviewGameInfo = {
  result: string;
  timeControl: string;
  date: string;
};

type ReviewSidePanelProps = {
  activeTab: "report" | "analysis" | "coach";
  onTabChange: (tab: "report" | "analysis" | "coach") => void;
  report: ReviewReport;
  gameInfo: ReviewGameInfo;
  moves: ReviewMove[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
};

function EvalBadge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

export default function ReviewSidePanel({
  activeTab,
  onTabChange,
  report,
  gameInfo,
  moves,
  currentMoveIndex,
  onSelectMove,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: ReviewSidePanelProps) {
  return (
    <aside className="h-full w-full rounded-2xl border border-white/10 bg-neutral-900 p-4 text-zinc-100 shadow-2xl lg:p-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-lg font-semibold">Revisão da partida</h2>
        <p className="mt-1 text-sm text-zinc-400">Análise premium do tabuleiro e fluxo de treino.</p>
      </div>

      <div className="mt-4 flex gap-2 border-b border-white/10 pb-3">
        {[
          ["report", "Relatório"],
          ["analysis", "Análise"],
          ["coach", "Coach IA"],
        ].map(([key, label]) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key as "report" | "analysis" | "coach")}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              {label}
              {isActive && (
                <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-violet-300" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        {activeTab === "report" && (
          <>
            <div className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4 shadow">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Informações da partida</p>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-zinc-500">Jogadores</p>
                  <p className="font-semibold text-zinc-100">{report.white} vs {report.black}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Resultado</p>
                  <p className="font-semibold text-zinc-100">{gameInfo.result}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Ritmo</p>
                  <p className="font-semibold text-zinc-100">{gameInfo.timeControl}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Data</p>
                  <p className="font-semibold text-zinc-100">{gameInfo.date}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4 shadow">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Avaliação / feedback</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <EvalBadge label="Melhor lance" colorClass="border-emerald-400/40 bg-emerald-500/15 text-emerald-300" />
                <EvalBadge label="Imprecisão" colorClass="border-yellow-400/40 bg-yellow-500/15 text-yellow-300" />
                <EvalBadge label="Erro" colorClass="border-orange-400/40 bg-orange-500/15 text-orange-300" />
                <EvalBadge label="Capivarada" colorClass="border-red-400/40 bg-red-500/15 text-red-300" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Precisão", report.accuracy],
                ["Rating", report.rating],
                ["Imprecisões", String(report.inaccuracies)],
                ["Erros", String(report.mistakes)],
                ["Capivaradas", String(report.blunders)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4 shadow">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "analysis" && (
          <>
            <ReviewMoveList
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onSelectMove={onSelectMove}
            />

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={onFirst}
                className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition hover:border-violet-300/50 hover:text-violet-100"
              >
                |&lt;
              </button>
              <button
                type="button"
                onClick={onPrev}
                className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition hover:border-violet-300/50 hover:text-violet-100"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition hover:border-violet-300/50 hover:text-violet-100"
              >
                &gt;
              </button>
              <button
                type="button"
                onClick={onLast}
                className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition hover:border-violet-300/50 hover:text-violet-100"
              >
                &gt;|
              </button>
            </div>
          </>
        )}

        {activeTab === "coach" && <CoachInsightPanel />}

        <div className="space-y-2 border-t border-white/10 pt-4">
          <button
            type="button"
            className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Start full analysis
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-violet-300/35 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20"
          >
            Train this position
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-violet-300/35 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-violet-300/60 hover:text-violet-100"
          >
            Send to AI Coach
          </button>
        </div>
      </div>
    </aside>
  );
}
