import { useLanguage } from "../../../contexts/LanguageContext.jsx";

export default function PlayerCollectionCard({ player, gameCount, selected, onSelect }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onSelect(player)}
      className={[
        "group overflow-hidden rounded-[28px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-purple-300/45 bg-[linear-gradient(180deg,rgba(20,20,32,0.9),rgba(10,10,18,0.96))] shadow-[0_0_28px_rgba(168,85,247,0.13)]"
          : "border-purple-300/[0.16] bg-[linear-gradient(180deg,rgba(20,20,32,0.86),rgba(10,10,18,0.94))] hover:-translate-y-0.5 hover:border-purple-300/38 hover:shadow-[0_18px_46px_rgba(88,28,135,0.14)]",
      ].join(" ")}
    >
      <div className="relative grid h-24 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent" />
        <div
          className={[
            "absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-18 blur-2xl transition group-hover:opacity-30",
            player.gradient,
          ].join(" ")}
        />
        <div
          className={[
            "absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-70",
            selected ? "via-purple-200/80" : "",
          ].join(" ")}
        />
        <div
          className={[
            "relative grid h-16 w-16 place-items-center rounded-full border text-2xl font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.25)]",
            selected
              ? "border-purple-200/35 bg-purple-300/[0.12]"
              : "border-white/15 bg-white/[0.055] group-hover:border-purple-200/25",
          ].join(" ")}
        >
          <span
            className={[
              "absolute -right-1 -top-1 h-4 w-4 rounded-full bg-gradient-to-br opacity-80 shadow-[0_0_18px_rgba(168,85,247,0.45)]",
              player.gradient,
            ].join(" ")}
          />
          {player.name.slice(0, 2).toUpperCase()}
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-semibold text-white">{player.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {t(`masterReplay.player.${player.id}.style`, player.styleSummary)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
          {t("masterReplay.gameCount", undefined, { count: gameCount })}
        </span>
        {player.mainThemes.slice(0, 2).map((theme) => (
          <span
            key={theme}
            className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300"
          >
            {theme}
          </span>
        ))}
      </div>
      <span className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-purple-300/40 group-hover:text-white">
        {t("masterReplay.studyCollection")}
      </span>
    </button>
  );
}
