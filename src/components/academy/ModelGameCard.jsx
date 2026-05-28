import { useLanguage } from "../../contexts/LanguageContext.jsx";

export default function ModelGameCard({ modelGame }) {
  const { t } = useLanguage();

  if (!modelGame) return null;

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/80">
            {t("academy.gmModelGame")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {modelGame.white} vs {modelGame.black}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {modelGame.event}, {modelGame.year} · {modelGame.result}
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-violet-200/25 bg-violet-300/12 px-5 py-3 text-sm font-semibold text-violet-100 transition hover:border-violet-200/40 hover:bg-violet-300/18"
        >
          {t("academy.startGuessMove")}
        </button>
      </div>

      <p className="mt-5 max-h-40 overflow-y-auto pr-2 text-sm leading-6 text-slate-300 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
        {modelGame.commentary}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1 text-xs font-medium text-violet-100">
            {modelGame.theme}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-400">
            {t("academy.pgnPreview")}
          </span>
        </div>
        <p className="mt-3 max-h-24 overflow-y-auto break-words pr-2 font-mono text-xs leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
          {modelGame.pgn}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {(modelGame.guessTheMoveMoments || []).map((moment) => (
          <div
            key={`${moment.moveNumber}-${moment.bestMove}`}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t("academy.moveToMove", undefined, {
                  move: moment.moveNumber,
                  side: moment.sideToMove,
                })}
              </span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                {moment.bestMove}
              </span>
            </div>
            <p className="mt-3 max-h-28 overflow-y-auto pr-2 text-sm leading-6 text-slate-300 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
              {moment.prompt}
            </p>
            <p className="mt-2 max-h-28 overflow-y-auto pr-2 text-sm leading-6 text-slate-500 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
              {moment.idea}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
