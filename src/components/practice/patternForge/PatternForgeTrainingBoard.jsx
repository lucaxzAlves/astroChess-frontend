import { Chess } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import {
  getCurrentRound,
  getRoundPhase,
  getThemeTitle,
  mockForgePuzzles,
} from "../../../data/mockPatternForge.js";
import ReviewBoard from "../../review/ReviewBoard";
import ForgeRightPanel from "./ForgeRightPanel.jsx";
import "../../../styles/gameReview.css";

function getId(value) {
  return value?._id || value?.id || "";
}

function moveToUci(move) {
  if (!move) return "";
  return `${move.from}${move.to}${move.promotion || ""}`.toLowerCase();
}

function applySolutionMove(fen, notation) {
  const moveText = String(notation || "").trim();
  if (!moveText) return null;

  const chess = new Chess(fen);
  let move = null;

  try {
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(moveText)) {
      move = chess.move({
        from: moveText.slice(0, 2),
        to: moveText.slice(2, 4),
        promotion: moveText[4] || "q",
      });
    } else {
      move = chess.move(moveText);
    }
  } catch {
    move = null;
  }

  return move ? { fen: chess.fen(), move, uci: moveToUci(move) } : null;
}

function buildSolutionUciLine(fen, solution = []) {
  const line = [];
  let nextFen = fen;

  for (const move of solution) {
    const result = applySolutionMove(nextFen, move);
    if (!result) return [];
    line.push(result.uci);
    nextFen = result.fen;
  }

  return line;
}

function formatLineAsSan(fen, line = []) {
  const sanMoves = [];
  let nextFen = fen;

  for (const move of line) {
    const result = applySolutionMove(nextFen, move);
    if (!result) {
      sanMoves.push(String(move));
      continue;
    }

    sanMoves.push(result.move.san || result.uci);
    nextFen = result.fen;
  }

  return sanMoves.join(" ");
}

function normalizePuzzle(puzzle) {
  const rawSolution = puzzle?.solutionMoves || puzzle?.solution || puzzle?.solutionLine || [];
  const solution = (Array.isArray(rawSolution) ? rawSolution : String(rawSolution).split(/\s+/))
    .map((move) => {
      if (typeof move === "string") return move;
      return move?.uci || move?.move || move?.san || "";
    })
    .map((move) => String(move).trim())
    .filter(Boolean);
  const candidateMoves =
    puzzle?.candidateMoves || (solution.length ? [solution.join(" ")] : []);

  return {
    ...puzzle,
    id: getId(puzzle),
    fen: puzzle?.playableFen || puzzle?.fen || "8/8/8/8/8/8/8/8 w - - 0 1",
    sideToMove:
      String(puzzle?.playableFen || puzzle?.fen || "").split(" ")[1] === "b" ? "black" : "white",
    theme: puzzle?.themes?.[0] || puzzle?.theme || "tactics",
    difficulty: puzzle?.normalizedDifficulty || puzzle?.difficulty || "intermediate",
    prompt: puzzle?.prompt || "Find the best continuation.",
    solution,
    candidateMoves,
    explanation:
      puzzle?.explanation ||
      (puzzle?.solutionMoves?.length ? `Sequência correta: ${puzzle.solutionMoves.join(" ")}` : ""),
    tags: puzzle?.themes || puzzle?.tags || [],
  };
}

export default function PatternForgeTrainingBoard({
  cycleDraft,
  onResetSetup,
  onConfigureNew,
  onBackToPractice,
  todaySession,
  puzzles = [],
  themeReasons = [],
  onSubmitAttempt,
  onCompleteDailySession,
  onCompleteCycle,
}) {
  const { language, t } = useLanguage();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedMove, setSelectedMove] = useState("");
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [boardFen, setBoardFen] = useState("");
  const [boardEffect, setBoardEffect] = useState("idle");
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [lastMoveSquare, setLastMoveSquare] = useState(null);
  const [lastMoveLabel, setLastMoveLabel] = useState("");
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [playedLine, setPlayedLine] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [dailyGoalPromptDismissed, setDailyGoalPromptDismissed] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    wrong: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalSolveSeconds: 0,
  });
  const [mistakesQueue, setMistakesQueue] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [startedAt] = useState(() => Date.now());
  const [puzzleStartedAt, setPuzzleStartedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const audioContextRef = useRef(null);

  const currentRound = getCurrentRound(cycleDraft);
  const totalRounds = cycleDraft?.repetitionPlan?.rounds?.length || 1;
  const dayProgress = cycleDraft?.progress?.currentDay || cycleDraft?.progress?.currentDayInRound || 1;
  const completedTodayBase =
    todaySession?.completedPuzzleIds?.length || cycleDraft?.progress?.completedToday || 0;
  const completedInRoundBase = cycleDraft?.progress?.completedPuzzlesInRound || 0;
  const dailyTarget = todaySession?.dailyTarget || currentRound.dailyTarget;
  const sessionTargetPuzzles = todaySession?.targetPuzzles || dailyTarget;
  const total = Math.max(1, puzzles.length || sessionTargetPuzzles - completedTodayBase);
  const patternSetSize = cycleDraft?.patternSet?.puzzleCount || 100;
  const sessionPuzzles = useMemo(
    () => {
      const source = puzzles.length ? puzzles : mockForgePuzzles;
      return Array.from({ length: total }, (_, index) => ({
        ...normalizePuzzle(source[index % source.length]),
        sessionPuzzleId: `${getId(source[index % source.length]) || index}-${index}`,
      }));
    },
    [puzzles, total]
  );

  const puzzle = sessionPuzzles[currentPuzzleIndex] || sessionPuzzles[0];
  const phase = getRoundPhase(currentRound.round, totalRounds, language);

  const triggerBoardEffect = (effect) => {
    setBoardEffect(effect);
    window.setTimeout(() => {
      setBoardEffect((current) => (current === effect ? "idle" : current));
    }, 720);
  };

  const playForgeSound = (type = "move") => {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const soundMap = {
      move: [
        { frequency: 620, endFrequency: 420, duration: 0.11, delay: 0, gain: 0.08 },
      ],
      auto: [
        { frequency: 420, endFrequency: 560, duration: 0.1, delay: 0, gain: 0.055 },
      ],
      correct: [
        { frequency: 520, endFrequency: 720, duration: 0.1, delay: 0, gain: 0.075 },
        { frequency: 720, endFrequency: 960, duration: 0.12, delay: 0.08, gain: 0.055 },
      ],
      wrong: [
        { frequency: 210, endFrequency: 130, duration: 0.17, delay: 0, gain: 0.09, type: "sawtooth" },
      ],
      reveal: [
        { frequency: 320, endFrequency: 520, duration: 0.12, delay: 0, gain: 0.055 },
        { frequency: 520, endFrequency: 390, duration: 0.12, delay: 0.11, gain: 0.045 },
      ],
      complete: [
        { frequency: 560, endFrequency: 740, duration: 0.1, delay: 0, gain: 0.06 },
        { frequency: 740, endFrequency: 980, duration: 0.1, delay: 0.08, gain: 0.055 },
        { frequency: 980, endFrequency: 1240, duration: 0.13, delay: 0.16, gain: 0.045 },
      ],
    };

    (soundMap[type] || soundMap.move).forEach((note) => {
      const now = context.currentTime + note.delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = note.type || "triangle";
      oscillator.frequency.setValueAtTime(note.frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(note.endFrequency, now + note.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(note.gain, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + note.duration + 0.02);
    });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    setBoardFen(puzzle?.fen || "8/8/8/8/8/8/8/8 w - - 0 1");
    setCurrentSolutionIndex(0);
    setPlayedLine([]);
    setSelectedMove("");
    setIsAnswerRevealed(false);
    setFeedback(null);
    setBoardEffect("idle");
    setIsBoardLocked(false);
    setLastMoveSquare(null);
    setLastMoveLabel("");
    setPuzzleStartedAt(Date.now());
  }, [puzzle?.sessionPuzzleId, puzzle?.fen]);

  useEffect(() => {
    setDailyGoalPromptDismissed(false);
  }, [todaySession?._id, todaySession?.id]);

  const finishIfNeeded = async (nextIndex, nextStats, nextMistakes, nextAttempts) => {
    if (nextIndex >= total) {
      let backendReport = null;
      if (todaySession && onCompleteDailySession) {
        backendReport = await onCompleteDailySession(getId(todaySession));
      }
      const solvedToday = completedTodayBase + nextStats.attempted;
      const completedPuzzlesInRound = Math.min(
        patternSetSize,
        completedInRoundBase + nextStats.attempted
      );
      const isRoundComplete = completedPuzzlesInRound >= patternSetSize;
      const nextRound =
        cycleDraft?.repetitionPlan?.rounds?.find((round) => round.round === currentRound.round + 1) || null;

      onCompleteCycle({
        type: isRoundComplete ? "round" : "daily",
        round: currentRound.round,
        totalRounds,
        targetDays: currentRound.targetDays,
        dailyTarget: currentRound.dailyTarget,
        solvedToday,
        completedToday: solvedToday,
        totalPuzzles: nextStats.attempted,
        correct: nextStats.correct,
        wrong: nextStats.wrong,
        accuracy: nextStats.attempted ? Math.round((nextStats.correct / nextStats.attempted) * 100) : 0,
        averageSolveTime: nextStats.attempted
          ? Math.round(nextStats.totalSolveSeconds / nextStats.attempted)
          : 0,
        mistakesQueued: nextMistakes.length,
        attempts: nextAttempts,
        themesTrained: [...new Set(sessionPuzzles.map((item) => item.theme))],
        progressInRound: completedPuzzlesInRound,
        remainingInRound: Math.max(0, patternSetSize - completedPuzzlesInRound),
        patternSetSize,
        nextRound,
        backendReport,
      });
      return true;
    }

    return false;
  };

  const registerAttempt = async ({
    selectedMoves,
    forcedResult = null,
    usedReveal = false,
    wrongMove = "",
  }) => {
    const solveSeconds = Math.max(1, Math.round((Date.now() - puzzleStartedAt) / 1000));
    const solutionUciLine = buildSolutionUciLine(puzzle.fen, puzzle.solution || []);
    const isCorrect =
      forcedResult === null
        ? selectedMoves.join(" ").toLowerCase() === solutionUciLine.join(" ").toLowerCase()
        : forcedResult;
    const patternForgeAttemptDraft = {
      cycleId: getId(cycleDraft),
      sessionId: getId(todaySession),
      puzzleId: puzzle.id,
      selectedMoves,
      selectedMove: selectedMoves.join(" ") || wrongMove || null,
      correctMove: solutionUciLine[0] || puzzle.solution?.[0],
      solutionMoves: solutionUciLine.length ? solutionUciLine : puzzle.solution || [],
      isCorrect,
      isComplete: isCorrect,
      timeSpentSeconds: solveSeconds,
      usedReveal,
      theme: puzzle.theme,
      difficulty: puzzle.difficulty,
      createdAt: new Date().toISOString(),
    };

    console.log("patternForgeAttemptDraft", patternForgeAttemptDraft);

    let backendResult = null;
    if (todaySession && onSubmitAttempt) {
      backendResult = await onSubmitAttempt({
        cycleId: patternForgeAttemptDraft.cycleId,
        sessionId: patternForgeAttemptDraft.sessionId,
        puzzleId: patternForgeAttemptDraft.puzzleId,
        selectedMoves: patternForgeAttemptDraft.selectedMoves,
        timeSpentSeconds: solveSeconds,
        usedReveal,
      });
    }

    const nextStats = {
      attempted: sessionStats.attempted + 1,
      correct: backendResult?.sessionProgress?.correctCount ?? sessionStats.correct + (isCorrect ? 1 : 0),
      wrong: backendResult?.sessionProgress?.wrongCount ?? sessionStats.wrong + (isCorrect ? 0 : 1),
      currentStreak: (backendResult?.isCorrect ?? isCorrect) ? sessionStats.currentStreak + 1 : 0,
      bestStreak: (backendResult?.isCorrect ?? isCorrect)
        ? Math.max(sessionStats.bestStreak, sessionStats.currentStreak + 1)
        : sessionStats.bestStreak,
      totalSolveSeconds: sessionStats.totalSolveSeconds + solveSeconds,
    };
    const nextMistakes =
      !(backendResult?.isCorrect ?? isCorrect) && cycleDraft?.rules?.repeatMissedPuzzles
        ? [...mistakesQueue, puzzle]
        : mistakesQueue;
    const nextAttempts = [...attempts, { ...patternForgeAttemptDraft, backendResult }];

    setSessionStats(nextStats);
    setMistakesQueue(nextMistakes);
    setAttempts(nextAttempts);
    setIsAnswerRevealed(true);
    setFeedback({
      isCorrect: backendResult?.isCorrect ?? isCorrect,
      selectedMoves,
      wrongMove,
      solutionMoves: backendResult?.solutionMoves || solutionUciLine || puzzle.solution || [],
      explanation: backendResult?.explanation || puzzle.explanation,
      puzzle,
      backendResult,
    });

    return { nextStats, nextMistakes, nextAttempts };
  };

  const goNext = async (stats = sessionStats, mistakes = mistakesQueue, nextAttempts = attempts) => {
    const nextIndex = currentPuzzleIndex + 1;
    if (await finishIfNeeded(nextIndex, stats, mistakes, nextAttempts)) return;
    setCurrentPuzzleIndex(nextIndex);
    setSelectedMove("");
    setIsAnswerRevealed(false);
    setFeedback(null);
    setPlayedLine([]);
    setCurrentSolutionIndex(0);
    setPuzzleStartedAt(Date.now());
  };

  const handleReveal = async () => {
    if (!isAnswerRevealed) {
      triggerBoardEffect("reveal");
      playForgeSound("reveal");
      await registerAttempt({
        selectedMoves: playedLine,
        forcedResult: false,
        usedReveal: true,
        wrongMove: "revealed",
      });
    }
  };

  const handleSkip = async () => {
    triggerBoardEffect("wrong");
    playForgeSound("wrong");
    const result = await registerAttempt({
      selectedMoves: playedLine,
      forcedResult: false,
      usedReveal: true,
      wrongMove: "skipped",
    });
    await goNext(result.nextStats, result.nextMistakes, result.nextAttempts);
  };

  const handleRepeatLater = async () => {
    const nextMistakes = [...mistakesQueue, puzzle];
    setMistakesQueue(nextMistakes);
    await goNext(sessionStats, nextMistakes, attempts);
  };

  const finishToday = async () => {
    await finishIfNeeded(total, sessionStats, mistakesQueue, attempts);
  };

  const submitCompletedPuzzle = async (line) => {
    setIsSubmittingAttempt(true);
    try {
      await registerAttempt({ selectedMoves: line, forcedResult: true });
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  const submitWrongPuzzle = async (line, wrongMove) => {
    setIsSubmittingAttempt(true);
    try {
      await registerAttempt({
        selectedMoves: [...line, wrongMove].filter(Boolean),
        forcedResult: false,
        wrongMove,
      });
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  const handleBoardMove = (source, target) => {
    if (isAnswerRevealed || isSubmittingAttempt) return false;

    const expectedMove = puzzle.solution?.[currentSolutionIndex];
    if (!expectedMove) return false;

    const expectedResult = applySolutionMove(boardFen, expectedMove);
    if (!expectedResult) return false;

    const attemptedChess = new Chess(boardFen);
    const attemptedMove = attemptedChess.move({
      from: source,
      to: target,
      promotion: expectedResult.move.promotion || "q",
    });

    if (!attemptedMove) {
      try {
        const fallbackAttempt = attemptedChess.move({
          from: source,
          to: target,
          promotion: "q",
        });

        if (!fallbackAttempt) return false;
      } catch {
        return false;
      }
    }

    const finalAttemptMove = attemptedMove || attemptedChess.history({ verbose: true }).at(-1);
    const attemptedUci = moveToUci(finalAttemptMove);
    const expectedUci = expectedResult.uci;

    if (attemptedUci !== expectedUci) {
      const wrongUci = attemptedUci;
      setBoardFen(attemptedChess.fen());
      setSelectedMove(wrongUci);
      setLastMoveSquare(finalAttemptMove.to);
      setLastMoveLabel(wrongUci);
      triggerBoardEffect("wrong");
      playForgeSound("wrong");
      submitWrongPuzzle(playedLine, wrongUci);
      return true;
    }

    const nextLine = [...playedLine, expectedUci];
    setBoardFen(expectedResult.fen);
    setPlayedLine(nextLine);
    setSelectedMove(nextLine.join(" "));
    setCurrentSolutionIndex(currentSolutionIndex + 1);
    setLastMoveSquare(expectedResult.move.to);
    setLastMoveLabel(expectedUci);
    triggerBoardEffect("correct");
    playForgeSound("correct");

    const opponentMove = puzzle.solution?.[currentSolutionIndex + 1];
    if (!opponentMove) {
      playForgeSound("complete");
      submitCompletedPuzzle(nextLine);
      return true;
    }

    setIsBoardLocked(true);
    window.setTimeout(() => {
      const replyResult = applySolutionMove(expectedResult.fen, opponentMove);
      if (!replyResult) {
        setIsBoardLocked(false);
        submitCompletedPuzzle(nextLine);
        return;
      }

      const lineAfterReply = [...nextLine, replyResult.uci];
      setBoardFen(replyResult.fen);
      setPlayedLine(lineAfterReply);
      setSelectedMove(lineAfterReply.join(" "));
      setCurrentSolutionIndex(currentSolutionIndex + 2);
      setLastMoveSquare(replyResult.move.to);
      setLastMoveLabel(replyResult.uci);
      triggerBoardEffect("auto");
      playForgeSound("auto");
      setIsBoardLocked(false);

      if (!puzzle.solution?.[currentSolutionIndex + 2]) {
        playForgeSound("complete");
        submitCompletedPuzzle(lineAfterReply);
      }
    }, 420);

    return true;
  };

  const reviewLineOnBoard = () => {
    setBoardFen(puzzle.fen);
    let nextFen = puzzle.fen;

    (puzzle.solution || []).forEach((move, index) => {
      window.setTimeout(() => {
        const result = applySolutionMove(nextFen, move);
        if (!result) return;
        nextFen = result.fen;
        setBoardFen(result.fen);
        setLastMoveSquare(result.move.to);
        setLastMoveLabel(result.uci);
        triggerBoardEffect("auto");
        playForgeSound("auto");
      }, index * 520);
    });
  };

  const cycleProgress = Math.round(
    ((currentRound.round - 1 + completedInRoundBase / Math.max(1, patternSetSize)) / totalRounds) * 100
  );
  const todayCompleted = completedTodayBase + sessionStats.attempted;
  const remainingToday = Math.max(0, dailyTarget - todayCompleted);
  const canContinueAfterDailyGoal = currentPuzzleIndex + 1 < total;
  const shouldShowDailyGoalPrompt =
    todayCompleted >= dailyTarget && !dailyGoalPromptDismissed;
  const roundProgress = Math.round(
    ((completedInRoundBase + sessionStats.attempted) / Math.max(1, patternSetSize)) * 100
  );
  const boardEffectClasses = {
    idle: "border-white/10 shadow-black/20",
    correct: "border-emerald-300/45 shadow-emerald-500/20 ring-2 ring-emerald-300/25",
    wrong: "border-rose-300/45 shadow-rose-500/25 ring-2 ring-rose-300/25",
    reveal: "border-amber-300/45 shadow-amber-500/20 ring-2 ring-amber-300/20",
    auto: "border-purple-300/45 shadow-purple-500/20 ring-2 ring-purple-300/20",
  };
  const boardEffectLabel = {
    idle: t("patternForge.boardReady", "Recognition board ready"),
    correct: t("patternForge.boardCorrectPulse", "Pattern locked"),
    wrong: t("patternForge.boardWrongPulse", "Mistake captured"),
    reveal: t("patternForge.boardRevealPulse", "Solution revealed"),
    auto: t("patternForge.boardAutoPulse", "Master line continuing"),
  }[boardEffect];
  const playedLineSan = formatLineAsSan(puzzle.fen, playedLine);
  const lastMoveLine =
    lastMoveLabel && playedLine.at(-1) !== lastMoveLabel ? [...playedLine, lastMoveLabel] : playedLine;
  const lastMoveSan = lastMoveLabel
    ? formatLineAsSan(puzzle.fen, lastMoveLine).split(/\s+/).filter(Boolean).at(-1) || lastMoveLabel
    : "";
  const feedbackSelectedLineSan = feedback
    ? formatLineAsSan(puzzle.fen, feedback.selectedMoves?.length ? feedback.selectedMoves : [feedback.wrongMove].filter(Boolean))
    : "";
  const feedbackSolutionLineSan = feedback
    ? formatLineAsSan(puzzle.fen, feedback.solutionMoves?.length ? feedback.solutionMoves : puzzle.solution || [])
    : "";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(35,12,22,0.94),rgba(9,12,18,0.98))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
              {t("patternForge.activeMultiDayCycle")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t("patternForge.title")}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {t("patternForge.roundOf", undefined, { current: currentRound.round, total: totalRounds })} ·{" "}
              {phase.label} · {t("patternForge.patternSetCount", undefined, { count: patternSetSize })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onConfigureNew}
              className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300/40"
            >
              {t("patternForge.configureNewCycle")}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("pattern-forge-schedule")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
            >
              {t("patternForge.viewCycleSchedule")}
            </button>
            <button
              type="button"
              onClick={onResetSetup}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-300/35 hover:text-white"
            >
              {t("patternForge.resetCycleSetup")}
            </button>
            <button
              type="button"
              onClick={onBackToPractice}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
            >
              {t("patternForge.backToPractice")}
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["patternForge.currentRound", t("patternForge.roundOf", undefined, { current: currentRound.round, total: totalRounds })],
          ["patternForge.dayProgress", `${dayProgress} / ${currentRound.targetDays}`],
          ["patternForge.todaysTarget", dailyTarget],
          ["patternForge.completedToday", todayCompleted],
          ["patternForge.forgeProgress", `${cycleProgress}%`],
          ["patternForge.currentPhase", phase.label],
        ].map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t(key)}</p>
            <p className="mt-1 text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(244,63,94,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(88,28,135,0.09),rgba(15,23,42,0.45))] p-4 shadow-2xl shadow-black/20 sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.055),transparent)] opacity-60" />
          <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-purple-500/14 blur-3xl" />
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {t(`patternForge.side.${puzzle.sideToMove}`, puzzle.sideToMove)}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {getThemeTitle(puzzle.theme, language)}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold transition duration-300",
                  boardEffect === "wrong"
                    ? "border-rose-300/35 bg-rose-300/12 text-rose-100"
                    : boardEffect === "correct"
                      ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                      : "border-purple-300/25 bg-purple-300/10 text-purple-100",
                ].join(" ")}
              >
                {boardEffectLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-300">
                {t("patternForge.liveBoard", "Live board")}
              </span>
            </div>
          </div>
          <div
            className={[
              "relative grid place-items-center rounded-[30px] border bg-slate-950/55 p-3 shadow-2xl transition-all duration-300 sm:p-4",
              boardEffectClasses[boardEffect] || boardEffectClasses.idle,
            ].join(" ")}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_42%)]" />
            <div
              className={[
                "pointer-events-none absolute inset-3 rounded-[24px] opacity-0 transition-opacity duration-300",
                boardEffect !== "idle" ? "animate-pulse opacity-100" : "",
                boardEffect === "wrong"
                  ? "bg-rose-500/10"
                  : boardEffect === "correct"
                    ? "bg-emerald-400/10"
                    : "bg-purple-400/10",
              ].join(" ")}
            />
            {puzzles.length ? (
              <div className="relative z-10 w-full">
                <ReviewBoard
                  fen={boardFen || puzzle.fen}
                  orientation={puzzle.sideToMove}
                  onMove={handleBoardMove}
                  neutralHighlightedSquare={lastMoveSquare}
                  disabled={isAnswerRevealed || isSubmittingAttempt || isBoardLocked}
                />
              </div>
            ) : (
              <div className="grid min-h-[360px] place-items-center rounded-[24px] border border-dashed border-rose-300/25 bg-slate-950/50 p-8 text-center">
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {t("patternForge.noPuzzlesTitle")}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    {t("patternForge.noPuzzlesDescription")}
                  </p>
                </div>
              </div>
            )}
          </div>
          {feedback ? (
            <div
              className={[
                "mt-4 rounded-2xl border px-4 py-3 text-sm shadow-lg",
                feedback.isCorrect
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100 shadow-emerald-950/20"
                  : "border-rose-300/35 bg-rose-400/10 text-rose-100 shadow-rose-950/25",
              ].join(" ")}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                    {feedback.isCorrect ? t("patternForge.correctTitle") : t("patternForge.notQuiteTitle")}
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {feedback.isCorrect
                      ? t("patternForge.patternRecognized", "Padrão reconhecido. Continue o ciclo.")
                      : t("patternForge.mistakeDetected", "Mistake detected. Compare your move with the correct line.")}
                  </p>
                  {!feedback.isCorrect ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-rose-300/30 bg-rose-950/35 px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-200">
                          {t("patternForge.yourMove", "Your move")}
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {feedbackSelectedLineSan || feedback.wrongMove || t("common.na")}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/25 px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                          {t("patternForge.correctLine")}
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-emerald-100">
                          {feedbackSolutionLineSan || t("common.na")}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
                {!shouldShowDailyGoalPrompt ? (
                  <button
                    type="button"
                    onClick={() => goNext()}
                    className={[
                      "rounded-xl px-5 py-3 text-sm font-bold transition hover:scale-[1.02]",
                      feedback.isCorrect
                        ? "bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-950/25"
                        : "bg-rose-300 text-slate-950 shadow-lg shadow-rose-950/25",
                    ].join(" ")}
                  >
                    {t("patternForge.nextPuzzle")}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          {shouldShowDailyGoalPrompt ? (
            <div className="mt-4 rounded-2xl border border-purple-300/35 bg-purple-400/10 px-5 py-4 text-purple-50 shadow-lg shadow-purple-950/20">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
                    {t("patternForge.dailyGoalReached", "Meta diária atingida")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {t("patternForge.dailyGoalCongrats", "Great work. You hit today's Pattern Forge target.")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-purple-100/80">
                    {t("patternForge.dailyGoalChoice", "You can finish the session now or keep training with the extra non-repeated puzzles prepared for this round.")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {canContinueAfterDailyGoal ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDailyGoalPromptDismissed(true);
                        if (feedback) {
                          goNext();
                        }
                      }}
                      className="rounded-xl bg-purple-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-purple-200"
                    >
                      {t("patternForge.keepTraining", "Keep training")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={finishToday}
                    className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:border-purple-200/50"
                  >
                    {t("patternForge.finishForToday")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {t("patternForge.moveTrail", "Move trail")}
              </p>
              <p className="mt-2 min-h-6 break-words font-mono text-sm font-semibold text-white">
                {playedLine.length ? playedLineSan : t("patternForge.dragMoveHint")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {t("patternForge.lastMove", "Last move")}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-purple-100">
                  {lastMoveSan || t("common.na")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {t("patternForge.streak")}
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-100">
                  {sessionStats.currentStreak}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {t("patternForge.recognitionSpeed", "Recognition")}
                </p>
                <p className="mt-1 text-sm font-semibold text-rose-100">
                  {elapsedSeconds < 60 ? `${elapsedSeconds}s` : `${Math.floor(elapsedSeconds / 60)}m`}
                </p>
              </div>
            </div>
          </div>
          <details className="mt-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-400">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t("patternForge.positionFen", "Position FEN")}
            </summary>
            <p className="mt-2 break-words font-mono text-xs leading-5">{puzzle.fen}</p>
          </details>
        </main>

        <ForgeRightPanel
          puzzle={puzzle}
          cycleDraft={cycleDraft}
          phase={phase}
          currentNumber={currentPuzzleIndex + 1}
          total={total}
          currentRound={currentRound}
          totalRounds={totalRounds}
          todaysTarget={dailyTarget}
          completedToday={todayCompleted}
          remainingToday={remainingToday}
          roundProgress={roundProgress}
          elapsedSeconds={elapsedSeconds}
          selectedMove={selectedMove}
          playedLine={playedLine}
          playedLineSan={playedLineSan}
          feedback={feedback}
          feedbackSelectedLineSan={feedbackSelectedLineSan}
          feedbackSolutionLineSan={feedbackSolutionLineSan}
          dailyGoalReached={shouldShowDailyGoalPrompt}
          isSubmittingAttempt={isSubmittingAttempt}
          isAnswerRevealed={isAnswerRevealed}
          sessionStats={sessionStats}
          mistakesQueue={mistakesQueue}
          onReveal={handleReveal}
          onSkip={handleSkip}
          onNext={() => goNext()}
          onRepeatLater={handleRepeatLater}
          onFinishToday={finishToday}
          onReviewLine={reviewLineOnBoard}
        />
      </div>

      <section id="pattern-forge-schedule" className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{t("patternForge.compressionSchedule")}</h2>
            <p className="mt-1 text-sm text-slate-400">{t("patternForge.scheduleDashboardHint")}</p>
          </div>
          <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-xs font-semibold text-rose-100">
            {t("patternForge.patternSetCount", undefined, { count: patternSetSize })}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cycleDraft.repetitionPlan.rounds.map((round) => (
            <div
              key={round.round}
              className={[
                "rounded-2xl border p-4",
                round.round === currentRound.round
                  ? "border-rose-300/45 bg-rose-300/[0.08]"
                  : "border-white/10 bg-slate-950/35",
              ].join(" ")}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-rose-200">
                {t("patternForge.roundNumber", undefined, { round: round.round })}
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {t("patternForge.scheduleLine", undefined, {
                  days: round.targetDays,
                  count: round.dailyTarget,
                })}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{round.goal}</p>
            </div>
          ))}
        </div>
      </section>

      {themeReasons.length ? (
        <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
          <h2 className="text-xl font-semibold text-white">{t("patternForge.whyThemesTitle")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {themeReasons.map((reason) => (
              <div key={`${reason.theme}-${reason.sourceField}`} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <p className="font-semibold text-cyan-100">{getThemeTitle(reason.theme, language)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{reason.reason}</p>
                <p className="mt-3 text-xs text-cyan-200">
                  {reason.sourceField} · {Math.round((reason.confidence || 0) * 100)}%
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
