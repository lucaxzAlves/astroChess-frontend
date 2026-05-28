import { useMemo, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import { localizeItem } from "../../../data/mockPersonalReplay.js";

export default function ReplaySession({ moment, attemptNumber, onSubmitAttempt, onExit }) {
  const { language, t } = useLanguage();
  const [selectedCandidateMove, setSelectedCandidateMove] = useState("");
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const replayAttemptDraft = useMemo(
    () =>
      selectedCandidateMove
        ? {
            momentId: moment.id,
            selectedMove: selectedCandidateMove,
            correctMove: moment.bestMove,
            isCorrect: selectedCandidateMove === moment.bestMove,
            timeSpentSeconds: 42,
            attemptNumber,
            createdAt: new Date().toISOString(),
          }
        : null,
    [attemptNumber, moment.bestMove, moment.id, selectedCandidateMove]
  );

  const revealAnswer = () => {
    setIsAnswerRevealed(true);
    if (replayAttemptDraft) {
      onSubmitAttempt(replayAttemptDraft);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.96),rgba(9,12,18,0.98))] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              {t("personalReplay.sessionTitle")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              {localizeItem(moment, "theme", language)}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t("personalReplay.moveNumber", undefined, { move: moment.moveNumber })} ·{" "}
              {t(`personalReplay.phase.${moment.phase}`, moment.phase)} ·{" "}
              {t(`personalReplay.difficulty.${moment.difficulty}`, moment.difficulty)}
            </p>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-300/35 hover:text-white"
          >
            {t("personalReplay.exitReplay")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="grid aspect-square max-h-[640px] place-items-center rounded-[24px] border border-dashed border-cyan-300/25 bg-slate-950/65">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                  <path d="M8.25 8.25h7.5v7.5h-7.5v-7.5Z" />
                  <path d="M4.5 4.5h15v15h-15v-15Z" />
                  <path d="M8.25 4.5v15M15.75 4.5v15M4.5 8.25h15M4.5 15.75h15" />
                </svg>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">
                {t("personalReplay.boardPlaceholder")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{moment.fen}</p>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
            {t("personalReplay.question")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {t("personalReplay.whatWouldYouPlay")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {localizeItem(moment, "prompt", language)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {moment.candidateMoves.map((move) => (
              <button
                key={move}
                type="button"
                onClick={() => setSelectedCandidateMove(move)}
                disabled={isAnswerRevealed}
                className={[
                  "rounded-xl border px-4 py-3 font-mono text-sm font-semibold transition",
                  selectedCandidateMove === move
                    ? "border-purple-300 bg-purple-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-purple-300/35",
                ].join(" ")}
              >
                {move}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={revealAnswer}
            disabled={!selectedCandidateMove || isAnswerRevealed}
            className="mt-5 w-full rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("personalReplay.revealAnswer")}
          </button>

          {isAnswerRevealed ? (
            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm text-slate-400">
                  {t("personalReplay.youPlayed")}:{" "}
                  <span className="font-mono font-semibold text-white">{moment.playedMove}</span>
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {t("personalReplay.bestMove")}:{" "}
                  <span className="font-mono font-semibold text-emerald-200">{moment.bestMove}</span>
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                {localizeItem(moment, "explanation", language)}
              </p>
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-200/8 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">
                  {t("personalReplay.lesson")}
                </p>
                <p className="mt-2 text-sm leading-6 text-cyan-50/90">
                  {localizeItem(moment, "lesson", language)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {moment.solutionLine.map((move) => (
                  <span key={move} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-slate-200">
                    {move}
                  </span>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => { setSelectedCandidateMove(""); setIsAnswerRevealed(false); }} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300">
                  {t("personalReplay.tryAgain")}
                </button>
                <button type="button" className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                  {t("personalReplay.markLearned")}
                </button>
                <button type="button" onClick={onExit} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300">
                  {t("personalReplay.nextMoment")}
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
