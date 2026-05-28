import { useLanguage } from "../../../contexts/LanguageContext.jsx";

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export default function MasterReplayHero({ onBackToPractice }) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(22,14,36,0.96),rgba(9,11,18,0.98))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_30%),radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.22),transparent_38%)]" />
      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <button
            type="button"
            onClick={onBackToPractice}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
          >
            {t("masterReplay.backToPractice")}
          </button>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
            {t("masterReplay.heroEyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("masterReplay.title")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            {t("masterReplay.subtitle")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
          <StatCard label={t("masterReplay.gamesCompleted")} value="18" detail="+3 this week" />
          <StatCard label={t("masterReplay.guessAccuracy")} value="74%" detail="critical moments" />
          <StatCard label={t("masterReplay.favoriteTheme")} value="Conversion" detail="last 30 days" />
          <StatCard label={t("masterReplay.currentStreak")} value="6" detail="days" />
        </div>
      </div>
    </div>
  );
}
