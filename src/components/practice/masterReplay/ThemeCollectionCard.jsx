import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function ThemeCollectionCard({ theme, gameCount, selected, onSelect }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onSelect(theme)}
      className={[
        "group rounded-[28px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-purple-300/50 bg-purple-500/[0.10]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-purple-300/35 hover:bg-purple-500/[0.06]",
      ].join(" ")}
    >
      <div
        className={[
          "relative h-28 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br",
          theme.gradient,
        ].join(" ")}
      >
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-slate-950/40 text-lg font-semibold text-white">
          {t(`masterReplay.theme.${theme.id}.title`, theme.title).charAt(0)}
        </div>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        {t(`masterReplay.theme.${theme.id}.title`, theme.title)}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {t(`masterReplay.theme.${theme.id}.description`, theme.description)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
          {t("masterReplay.gameCount", undefined, { count: gameCount })}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
          {t(`masterReplay.theme.${theme.id}.difficultyRange`, theme.difficultyRange)}
        </span>
      </div>
      <span className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-purple-300/40 group-hover:text-white">
        {t("masterReplay.exploreTheme")}
      </span>
    </button>
  );
}
