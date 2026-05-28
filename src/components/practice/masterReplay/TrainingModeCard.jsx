import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function TrainingModeCard({ mode, selected, compatibleGamesCount, onSelect }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onSelect(mode.id)}
      className={[
        "group rounded-[28px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-amber-200/40 bg-amber-300/[0.08] shadow-[0_0_34px_rgba(245,158,11,0.14)]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-purple-300/35 hover:bg-purple-500/[0.06]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            {t("masterReplay.trainingMode")}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {t(`masterReplay.mode.${mode.id}.title`, mode.title)}
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-amber-200/25 bg-amber-200/10 text-amber-100">
          {compatibleGamesCount}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        {t(`masterReplay.mode.${mode.id}.description`, mode.description)}
      </p>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
          <span className="text-slate-500">{t("masterReplay.bestFor")}: </span>
          <span className="font-medium text-slate-200">
            {t(`masterReplay.mode.${mode.id}.bestFor`, mode.bestFor)}
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
          <span className="text-slate-500">{t("masterReplay.sessionLength")}: </span>
          <span className="font-medium text-slate-200">{mode.estimatedLength}</span>
        </div>
      </div>
      <span className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-purple-300/40 group-hover:text-white">
        {t("masterReplay.useMode")}
      </span>
    </button>
  );
}
