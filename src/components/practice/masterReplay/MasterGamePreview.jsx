import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function MasterGamePreview({
  game,
  selectedTrainingMode,
  onClose,
  onSelectTrainingMode,
  onStartReplay,
}) {
  const { t } = useLanguage();

  if (!game) return null;

  const activeMode = selectedTrainingMode || game.recommendedMode;

  return (
    <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(88,28,135,0.08),rgba(15,23,42,0.35))] p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
            {t("masterReplay.gamePreview")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{game.title}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {game.white} vs {game.black} · {game.event}, {game.year} · {game.result}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("masterReplay.close")}
        </button>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-300">
        {t(`masterReplay.game.${game.id}.description`, game.description)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100">
          {t(`masterReplay.difficulty.${game.difficulty}`, game.difficulty)}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
          {game.estimatedTime}
        </span>
        {game.themes.map((theme) => (
          <span
            key={theme}
            className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-xs text-purple-100"
          >
            {theme}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {t("masterReplay.keyMoments")}
        </p>
        {game.keyMoments.map((moment) => (
          <div
            key={`${moment.ply}-${moment.correctMove}`}
            className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Ply {moment.ply} · {moment.questionType}
              </span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                {moment.correctMove}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{moment.prompt}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{moment.explanation}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {t("masterReplay.availableModes")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {game.trainingModes.map((modeId) => {
            const active = activeMode === modeId;
            return (
              <button
                key={modeId}
                type="button"
                onClick={() => onSelectTrainingMode(modeId)}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-purple-300 bg-purple-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-purple-300/35 hover:text-white",
                ].join(" ")}
              >
                {t(`masterReplay.mode.${modeId}.title`, modeId)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-purple-300/20 bg-purple-300/8 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-purple-200">
          {t("masterReplay.recommendedMode")}
        </p>
        <p className="mt-2 text-sm font-semibold text-white">
          {t(`masterReplay.mode.${game.recommendedMode}.title`, game.recommendedMode)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onStartReplay(game, activeMode)}
        className="mt-6 w-full rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400"
      >
        {t("masterReplay.startMasterReplay")}
      </button>
    </aside>
  );
}
