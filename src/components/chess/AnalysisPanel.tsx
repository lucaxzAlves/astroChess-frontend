import CoachInsightPanel from "./CoachInsightPanel";
import MoveList, { type MoveItem } from "./MoveList";

type ReportData = {
  white: string;
  black: string;
  accuracy: string;
  rating: string;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
};

type Props = {
  activeTab: "report" | "analysis" | "coach";
  onTabChange: (tab: "report" | "analysis" | "coach") => void;
  report: ReportData;
  moves: MoveItem[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
};

export default function AnalysisPanel({
  activeTab,
  onTabChange,
  report,
  moves,
  currentMoveIndex,
  onSelectMove,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: Props) {
  const tabClass = (isActive: boolean) =>
    `rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 ${
      isActive
        ? "border-violet-300/70 bg-violet-400/20 text-violet-100 shadow-[0_6px_18px_rgba(124,58,237,0.3)]"
        : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-violet-300/50 hover:text-violet-100"
    }`;

  return (
    <aside className="h-full min-h-0 rounded-2xl border border-violet-400/20 bg-gradient-to-b from-[#0f172a] to-[#111827] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.4)]">
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onTabChange("report")} className={tabClass(activeTab === "report")}>Relatório</button>
        <button type="button" onClick={() => onTabChange("analysis")} className={tabClass(activeTab === "analysis")}>Análise</button>
        <button type="button" onClick={() => onTabChange("coach")} className={tabClass(activeTab === "coach")}>Coach IA</button>
      </div>

      {activeTab === "report" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Brancas", report.white],
            ["Pretas", report.black],
            ["Accuracy", report.accuracy],
            ["Rating", report.rating],
            ["Imprecisões", String(report.inaccuracies)],
            ["Erros", String(report.mistakes)],
            ["Blunders", String(report.blunders)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-violet-500/15 bg-[#0a1224] p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="space-y-4">
          <MoveList moves={moves} currentMoveIndex={currentMoveIndex} onSelectMove={onSelectMove} />
          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={onFirst} className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-sm text-violet-100 transition hover:bg-violet-500/20">|&lt;</button>
            <button type="button" onClick={onPrev} className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-sm text-violet-100 transition hover:bg-violet-500/20">&lt;</button>
            <button type="button" onClick={onNext} className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-sm text-violet-100 transition hover:bg-violet-500/20">&gt;</button>
            <button type="button" onClick={onLast} className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-sm text-violet-100 transition hover:bg-violet-500/20">&gt;|</button>
          </div>
        </div>
      )}

      {activeTab === "coach" && <CoachInsightPanel />}
    </aside>
  );
}
