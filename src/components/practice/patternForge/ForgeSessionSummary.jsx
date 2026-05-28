import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { getThemeTitle } from "../../../data/mockPatternForge.js";

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ForgeSessionSummary({
  summary,
  onRestart,
  onReconfigure,
  onBackToPractice,
}) {
  const { language, t } = useLanguage();
  const report = summary?.backendReport || null;
  const themes = report
    ? [...(report.strongestThemes || []), ...(report.weakestThemes || [])]
    : summary?.themesTrained || [];
  const strongestTheme = themes[0] ? getThemeTitle(themes[0], language) : t("common.na");
  const weakestTheme = themes[1] ? getThemeTitle(themes[1], language) : t("common.na");
  const isRoundComplete = summary?.type === "round";
  const solvedToday = report?.completed ?? summary.solvedToday ?? summary.totalPuzzles;
  const dailyTarget = report?.targetPuzzles ?? summary.dailyTarget;
  const correct = report?.correct ?? summary.correct;
  const wrong = report?.wrong ?? summary.wrong;
  const skipped = report?.skipped ?? 0;
  const accuracy = report?.accuracy ?? summary.accuracy;
  const averageSolveTime = report?.averageSolveTimeSeconds ?? summary.averageSolveTime;
  const mistakesQueued = report?.mistakesQueued ?? summary.mistakesQueued;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="relative overflow-hidden rounded-[30px] border border-rose-200/20 bg-[linear-gradient(135deg,rgba(35,12,22,0.96),rgba(18,12,38,0.96),rgba(8,12,18,0.98))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.23),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_34%)]" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200">
            {isRoundComplete ? t("patternForge.roundSummaryEyebrow") : t("patternForge.dailySummaryEyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {isRoundComplete ? t("patternForge.roundSummaryTitle") : t("patternForge.dailySummaryTitle")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {isRoundComplete ? t("patternForge.roundSummaryDescription") : t("patternForge.dailySummaryDescription")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label={t("patternForge.solvedToday")} value={solvedToday} />
        <SummaryStat label={t("patternForge.dailyTarget")} value={dailyTarget} />
        <SummaryStat label={t("patternForge.correct")} value={correct} />
        <SummaryStat label={t("patternForge.wrong")} value={wrong} />
        <SummaryStat label={t("patternForge.skipped")} value={skipped} />
        <SummaryStat label={t("patternForge.accuracy")} value={`${accuracy}%`} />
        <SummaryStat
          label={t("patternForge.averageSolveTime")}
          value={t("patternForge.seconds", undefined, { count: averageSolveTime })}
        />
        <SummaryStat label={t("patternForge.mistakesQueued")} value={mistakesQueued} />
        <SummaryStat
          label={t("patternForge.progressInCurrentRound")}
          value={`${summary.progressInRound || 0} / ${summary.patternSetSize || 0}`}
        />
        <SummaryStat label={t("patternForge.remainingInRound")} value={summary.remainingInRound ?? 0} />
      </div>

      {isRoundComplete ? (
        <section className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/[0.07] p-5">
          <h2 className="text-xl font-semibold text-white">
            {t("patternForge.nextRoundPreview")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50/90">
            {summary.nextRound
              ? t("patternForge.nextRoundLine", undefined, {
                  round: summary.nextRound.round,
                  days: summary.nextRound.targetDays,
                  count: summary.nextRound.dailyTarget,
                })
              : t("patternForge.allRoundsComplete")}
          </p>
        </section>
      ) : null}

      {report?.nextRecommendation ? (
        <section className="rounded-[28px] border border-purple-300/20 bg-purple-300/[0.07] p-5">
          <h2 className="text-xl font-semibold text-white">{t("patternForge.nextRecommendation")}</h2>
          <p className="mt-2 text-sm leading-6 text-purple-50/90">{report.nextRecommendation}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-xl font-semibold text-white">{t("patternForge.themesTrained")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {themes.map((themeId, index) => (
            <span
              key={`${themeId}-${index}`}
              className="rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-sm font-medium text-purple-100"
            >
              {getThemeTitle(themeId, language)}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SummaryStat label={t("patternForge.strongestTheme")} value={strongestTheme} />
          <SummaryStat label={t("patternForge.weakestTheme")} value={weakestTheme} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200"
        >
          {isRoundComplete ? t("patternForge.startNextRound") : t("patternForge.continueTraining")}
        </button>
        <button
          type="button"
          onClick={onBackToPractice}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-rose-300/35 hover:text-white"
        >
          {t("patternForge.finishForToday")}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("patternForge.reviewMistakes")}
        </button>
      </div>
    </section>
  );
}
