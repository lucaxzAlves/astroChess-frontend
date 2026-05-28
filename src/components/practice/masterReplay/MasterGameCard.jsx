import { useLanguage } from "../../../contexts/LanguageContext.jsx";

const difficultyStyles = {
  intermediate: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  advanced: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  master: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

function ModePill({ modeId }) {
  const { t } = useLanguage();

  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
      {t(`masterReplay.mode.${modeId}.short`, modeId)}
    </span>
  );
}

export default function MasterGameCard({ game, onSelect, highlighted = false }) {
  const { t } = useLanguage();
  const hasProgress = Number(game.progress) > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      className={[
        "group flex h-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f16]",
        highlighted
          ? "border-amber-200/35 bg-amber-300/[0.07] shadow-[0_0_34px_rgba(245,158,11,0.14)]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-purple-300/35 hover:bg-purple-500/[0.055] hover:shadow-[0_24px_70px_rgba(88,28,135,0.22)]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={[
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
            difficultyStyles[game.difficulty] || "border-white/10 bg-white/[0.04] text-slate-300",
          ].join(" ")}
        >
          {t(`masterReplay.difficulty.${game.difficulty}`, game.difficulty)}
        </span>
        <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-2.5 py-1 text-[11px] font-medium text-purple-100">
          {game.playerCollection}
        </span>
        {game.recommended ? (
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[11px] font-medium text-amber-100">
            {t("masterReplay.recommendedBadge")}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">{game.title}</h3>
      <p className="mt-2 text-sm text-slate-400">
        {game.white} vs {game.black}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {game.event}, {game.year} · {game.result}
      </p>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
        {t(`masterReplay.game.${game.id}.description`, game.description)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {game.themes.slice(0, 3).map((theme) => (
          <span
            key={theme}
            className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[11px] text-slate-300"
          >
            {theme}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {hasProgress ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t("masterReplay.progress")}</span>
              <span>{game.progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-950/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-200 to-purple-300"
                style={{ width: `${Math.min(100, Math.max(0, game.progress))}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {game.trainingModes.slice(0, 3).map((modeId) => (
            <ModePill key={modeId} modeId={modeId} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">{game.estimatedTime}</span>
          <span className="rounded-xl border border-purple-300/35 bg-purple-300/[0.12] px-4 py-2 text-sm font-semibold text-purple-100 transition group-hover:border-purple-300/55 group-hover:bg-purple-300/[0.18]">
            {hasProgress ? t("masterReplay.continue") : t("masterReplay.startReplay")}
          </span>
        </div>
      </div>
    </button>
  );
}
