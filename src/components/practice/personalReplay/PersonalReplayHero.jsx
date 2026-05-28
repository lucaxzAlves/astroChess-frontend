import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { replayProgress } from "../../../data/mockPersonalReplay.js";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function PersonalReplayHero({ onBackToPractice, moments }) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.96),rgba(9,12,18,0.98))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.22),transparent_38%)]" />
      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <button
            type="button"
            onClick={onBackToPractice}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
          >
            {t("personalReplay.backToPractice")}
          </button>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            {t("personalReplay.heroEyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("personalReplay.title")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            {t("personalReplay.subtitle")}
          </p>
          <p className="mt-4 rounded-2xl border border-cyan-200/20 bg-cyan-200/8 px-4 py-3 text-sm font-medium text-cyan-50">
            {t("personalReplay.personalMessage")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[560px]">
          <StatCard label={t("personalReplay.momentsAvailable")} value={moments.length} />
          <StatCard
            label={t("personalReplay.blundersToReview")}
            value={moments.filter((moment) => moment.classification === "blunder").length}
          />
          <StatCard
            label={t("personalReplay.missedChances")}
            value={moments.filter((moment) => moment.category === "missed_chances").length}
          />
          <StatCard label={t("personalReplay.currentStreak")} value={replayProgress.currentStreak} />
          <StatCard label={t("personalReplay.replayAccuracy")} value={`${replayProgress.accuracy}%`} />
        </div>
      </div>
    </div>
  );
}
