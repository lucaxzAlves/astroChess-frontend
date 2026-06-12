import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { getThemeTitle, localizeForgeItem } from "../../../data/mockPatternForge.js";
import ForgeProgressBar from "./ForgeProgressBar.jsx";

export default function ForgeRightPanel({
  puzzle,
  cycleDraft,
  phase,
  currentNumber,
  total,
  currentRound,
  totalRounds,
  todaysTarget,
  completedToday,
  remainingToday,
  roundProgress,
  elapsedSeconds,
  playedLine = [],
  playedLineSan = "",
  feedback,
  feedbackSelectedLineSan = "",
  feedbackSolutionLineSan = "",
  dailyGoalReached = false,
  isSubmittingAttempt,
  isAnswerRevealed,
  sessionStats,
  mistakesQueue,
  onReveal,
  onSkip,
  onNext,
  onRepeatLater,
  onFinishToday,
  onReviewLine,
}) {
  const { language, t } = useLanguage();
  const progress = total ? (currentNumber / total) * 100 : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  const tags = localizeForgeItem(puzzle, "tags", language) || puzzle.tags;
  const accuracy =
    sessionStats.attempted > 0
      ? Math.round((sessionStats.correct / sessionStats.attempted) * 100)
      : 0;

  return (
    <aside className="min-w-0 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 xl:max-h-[calc(100vh-112px)] xl:overflow-y-auto">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase tracking-[0.1em] text-rose-200">
            {t("patternForge.cycleStatus")}
          </p>
          <h2 className="mt-2 break-words text-xl font-semibold leading-tight text-white">
            {t("patternForge.puzzleProgress", undefined, { current: currentNumber, total })}
          </h2>
        </div>
        <span className="max-w-full break-words rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs font-semibold leading-5 text-purple-100">
          {phase.label}
        </span>
      </div>
      <ForgeProgressBar value={progress} className="mt-4" />

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["patternForge.timer", `${minutes}:${seconds}`],
          ["patternForge.accuracyThisRound", `${accuracy}%`],
          ["patternForge.mistakesQueued", mistakesQueue.length],
          ["patternForge.remainingToday", remainingToday],
        ].map(([key, value]) => (
          <div key={key} className="min-w-0 rounded-xl border border-white/10 bg-slate-950/45 p-3">
            <p className="break-words text-[11px] uppercase tracking-[0.08em] text-slate-500">{t(key)}</p>
            <p className="mt-1 break-words text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-rose-200/20 bg-rose-200/[0.07] p-4">
        <p className="break-words text-xs uppercase tracking-[0.1em] text-rose-200">
          {t("patternForge.todaysSession")}
        </p>
        <h3 className="mt-2 break-words text-lg font-semibold text-white">
          {t("patternForge.roundOf", undefined, { current: currentRound.round, total: totalRounds })}
        </h3>
        <div className="mt-3 grid gap-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className="min-w-0 break-words">{t("patternForge.todaysTarget")}</span>
            <span className="shrink-0 font-semibold text-white">{todaysTarget}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className="min-w-0 break-words">{t("patternForge.completedToday")}</span>
            <span className="shrink-0 font-semibold text-white">{completedToday}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className="min-w-0 break-words">{t("patternForge.roundProgress")}</span>
            <span className="shrink-0 font-semibold text-white">{roundProgress}%</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onFinishToday}
          className="mt-4 w-full rounded-xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:border-rose-300/50"
        >
          {t("patternForge.finishToday")}
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
        <p className="break-words text-xs uppercase tracking-[0.1em] text-slate-500">
          {t("patternForge.currentPuzzle")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="max-w-full break-words rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-xs leading-5 text-rose-100">
            {getThemeTitle(puzzle.theme, language)}
          </span>
          <span className="break-words rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs leading-5 text-slate-300">
            {t(`patternForge.difficulty.${puzzle.difficulty}`, puzzle.difficulty)}
          </span>
          <span className="break-words rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs leading-5 text-slate-300">
            {t(`patternForge.side.${puzzle.sideToMove}`, puzzle.sideToMove)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="max-w-full break-words rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] leading-5 text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <p className="break-words text-xs font-semibold uppercase tracking-[0.1em] text-purple-300">
          {t("patternForge.answerArea")}
        </p>
        <h3 className="mt-2 break-words text-lg font-semibold text-white">{t("patternForge.whatMove")}</h3>
        <p className="mt-2 break-words text-sm leading-6 text-slate-400">
          {localizeForgeItem(puzzle, "prompt", language)}
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="break-words text-xs uppercase tracking-[0.1em] text-slate-500">
            {t("patternForge.playedLine")}
          </p>
          <p className="mt-2 min-h-6 break-words font-mono text-sm font-semibold leading-6 text-white">
            {playedLine.length ? playedLineSan : t("patternForge.dragMoveHint")}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onReveal}
            disabled={isAnswerRevealed || isSubmittingAttempt}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("patternForge.reveal")}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmittingAttempt}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
          >
            {t("patternForge.skip")}
          </button>
        </div>
      </section>

      {feedback ? (
        <section
          className={[
            "mt-4 rounded-2xl border p-4",
            feedback.isCorrect
              ? "border-emerald-300/20 bg-emerald-300/[0.07]"
              : "border-rose-300/35 bg-rose-400/[0.10] shadow-lg shadow-rose-950/20",
          ].join(" ")}
        >
          <p className={`break-words text-xs uppercase tracking-[0.1em] ${feedback.isCorrect ? "text-emerald-200" : "text-rose-200"}`}>
            {feedback.isCorrect ? t("patternForge.correctTitle") : t("patternForge.notQuiteTitle")}
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
              <p className="break-words text-xs uppercase tracking-[0.1em] text-slate-500">
                {t("patternForge.selectedLine")}
              </p>
              <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-white">
                {feedbackSelectedLineSan || feedback.wrongMove || t("common.na")}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
              <p className="break-words text-xs uppercase tracking-[0.1em] text-slate-500">
                {t("patternForge.correctLine")}
              </p>
              <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-emerald-100">
                {feedbackSolutionLineSan || t("common.na")}
              </p>
            </div>
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-slate-200">
            {feedback.explanation || localizeForgeItem(puzzle, "explanation", language)}
          </p>
          {!feedback.isCorrect ? (
            <div className="mt-3 rounded-xl border border-rose-300/30 bg-rose-950/30 px-3 py-3">
              <p className="text-sm font-semibold text-rose-100">
                {t("patternForge.incorrectMoveTitle", "Incorrect move")}
              </p>
              <p className="mt-1 text-sm leading-6 text-rose-100/85">
                {t("patternForge.willReturnLater")}
              </p>
            </div>
          ) : null}
          <div className="mt-4 grid gap-3">
            {!dailyGoalReached ? (
              <button
                type="button"
                onClick={onNext}
                className={[
                  "rounded-xl px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01]",
                  feedback.isCorrect ? "bg-emerald-300 shadow-emerald-950/25" : "bg-rose-300 shadow-rose-950/25",
                ].join(" ")}
              >
                {t("patternForge.nextPuzzle")}
              </button>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onReviewLine}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-emerald-50"
              >
                {t("patternForge.reviewLine")}
              </button>
              <button
                type="button"
                onClick={onRepeatLater}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-emerald-50"
              >
                {t("patternForge.repeatLater")}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </aside>
  );
}
