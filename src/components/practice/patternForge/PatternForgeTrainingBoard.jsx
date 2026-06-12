import { Chess } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import {
  getCurrentRound,
  getRoundPhase,
  getThemeTitle,
  mockForgePuzzles,
} from "../../../data/mockPatternForge.js";
import ReviewBoard from "../../review/ReviewBoard.js";
import ForgeLeaderboard from "./ForgeLeaderboard.jsx";
import ForgeRightPanel from "./ForgeRightPanel.jsx";
import "../../../styles/gameReview.css";

function getId(value) {
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
}

function buildCompletedPuzzleCountMap(todaySession) {
  const counts = new Map();
  const completedPuzzleIds = Array.isArray(todaySession?.completedPuzzleIds)
    ? todaySession.completedPuzzleIds
    : [];

  completedPuzzleIds.forEach((puzzleId) => {
    const id = getId(puzzleId);
    if (!id) return;
    counts.set(id, (counts.get(id) || 0) + 1);
  });

  return counts;
}

function getFirstPendingPuzzleIndex(sessionPuzzles = [], todaySession) {
  const backendIndex = Number(todaySession?.currentPuzzleIndex);
  if (Number.isInteger(backendIndex) && backendIndex >= 0) {
    return Math.max(0, Math.min(backendIndex, Math.max(0, sessionPuzzles.length - 1)));
  }

  const completedCounts = buildCompletedPuzzleCountMap(todaySession);
  const seenCounts = new Map();

  for (let index = 0; index < sessionPuzzles.length; index += 1) {
    const puzzleId = getId(sessionPuzzles[index]);
    if (!puzzleId) return index;

    const occurrence = seenCounts.get(puzzleId) || 0;
    seenCounts.set(puzzleId, occurrence + 1);

    if (occurrence >= (completedCounts.get(puzzleId) || 0)) {
      return index;
    }
  }

  return Math.max(0, sessionPuzzles.length - 1);
}

function formatReasonConfidence(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  return Math.round(numericValue <= 1 ? numericValue * 100 : numericValue);
}

function formatThemeReasonSource(sourceField = "", language = "pt-BR") {
  const normalized = String(sourceField || "").toLowerCase();
  const isPt = String(language || "").toLowerCase().startsWith("pt");

  if (normalized.includes("skillmap")) return isPt ? "Mapa de habilidades" : "Skill map";
  if (normalized.includes("recurringmistakes")) return isPt ? "Erros recorrentes" : "Recurring mistakes";
  if (normalized.includes("openingrepertoire")) return isPt ? "Repertório de aberturas" : "Opening repertoire";
  if (normalized.includes("recommendations") || normalized.includes("goals") || normalized.includes("decisionpatterns")) {
    return isPt ? "Plano do coach" : "Coach plan";
  }

  return isPt ? "Perfil do jogador" : "Player profile";
}

function formatThemeReasonText(reason, language = "pt-BR") {
  const rawReason = String(reason?.reason || "").trim();
  const sourceLabel = formatThemeReasonSource(reason?.sourceField, language);
  const themeLabel = getThemeTitle(reason?.theme, language);
  const isPt = String(language || "").toLowerCase().startsWith("pt");
  const lowerReason = rawReason.toLowerCase();

  if (!rawReason) {
    return isPt
      ? `${themeLabel} foi escolhido a partir dos sinais do seu perfil.`
      : `${themeLabel} was selected from signals in your profile.`;
  }

  if (lowerReason.includes("low tactical pattern score")) {
    return isPt
      ? "Seu mapa de habilidades indica que padrões táticos precisam de reforço."
      : "Your skill map suggests tactical patterns need reinforcement.";
  }

  if (lowerReason.includes("low calculation score")) {
    return isPt
      ? "Seu perfil aponta cálculo como uma prioridade de treino."
      : "Your profile marks calculation as a training priority.";
  }

  if (lowerReason.includes("endgame score")) {
    return isPt
      ? "Sua pontuação de finais sugere treino técnico adicional."
      : "Your endgame score suggests additional technical training.";
  }

  if (lowerReason.includes("opening score")) {
    return isPt
      ? "Seu repertório de aberturas precisa de revisão guiada."
      : "Your opening repertoire needs guided review.";
  }

  if (lowerReason.includes("time management score")) {
    return isPt
      ? "O perfil detectou dificuldade em decisões sob pressão de tempo."
      : "Your profile detected difficulty making decisions under time pressure.";
  }

  if (lowerReason.includes("low resilience score")) {
    return isPt
      ? "O perfil indica que recursos defensivos sob pressão merecem atenção."
      : "Your profile indicates defensive resources under pressure need attention.";
  }

  const compactReason = rawReason.length > 150 ? `${rawReason.slice(0, 147).trim()}...` : rawReason;
  return isPt ? `${sourceLabel}: ${compactReason}` : `${sourceLabel}: ${compactReason}`;
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

function getDisplayRoundGoal(goal, language = "pt-BR") {
  const rawGoal = String(goal || "").trim();
  const isPt = String(language || "").toLowerCase().startsWith("pt");

  if (!isPt || !rawGoal) return rawGoal;

  const normalized = rawGoal.toLowerCase();
  if (normalized.includes("understand")) return "Entender os padrões";
  if (normalized.includes("recognize faster")) return "Reconhecer mais rápido";
  if (normalized.includes("compress calculation")) return "Comprimir o cálculo";
  if (normalized.includes("automatic recognition")) return "Reconhecimento automático";
  if (normalized.includes("instinct")) return "Teste de instinto";

  return rawGoal;
}

function MobileStatScroller({ items = [] }) {
  return (
    <div className="pattern-forge-mobile-scroll max-w-full min-w-0 overflow-x-auto overflow-y-hidden pb-1">
      <div className="flex w-max max-w-none snap-x gap-3">
        {items.map(([label, value, detail]) => (
          <div
            key={label}
            className="w-[142px] min-w-0 shrink-0 snap-start rounded-3xl border border-white/10 bg-slate-950/50 p-4"
          >
            <p className="break-words text-[10px] uppercase tracking-[0.08em] text-slate-500">{label}</p>
            <p className="mt-2 break-words text-2xl font-semibold text-white">{value}</p>
            {detail ? <p className="mt-1 break-words text-xs leading-5 text-slate-500">{detail}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileCycleTimeline({ rounds = [], currentRound, currentDay, t, language }) {
  const activeRound = rounds.find((round) => round.round === currentRound.round) || currentRound;
  const activeRoundProgress = activeRound.targetDays
    ? Math.min(100, Math.round((currentDay / activeRound.targetDays) * 100))
    : 0;

  return (
    <section className="max-w-full min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-[10px] font-bold uppercase tracking-[0.1em] text-rose-200">
            {t("patternForge.compressionSchedule")}
          </p>
          <h2 className="mt-1 break-words text-xl font-semibold text-white">
            {t("patternForge.roundNumber", undefined, { round: activeRound.round })}
          </h2>
          <p className="mt-1 break-words text-sm leading-5 text-slate-400">
            {t("patternForge.scheduleCompactHint", "Same puzzle set, less time each round.")}
          </p>
        </div>
        <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-xs font-semibold text-rose-100">
          {activeRound.targetDays}d
        </span>
      </div>

      <div className="mt-5 rounded-3xl border border-rose-300/15 bg-slate-950/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {t("patternForge.currentDay", "Current day")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {currentDay}/{activeRound.targetDays || 1}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {t("patternForge.dailyWorkload", "Daily workload")}
            </p>
            <p className="mt-1 break-words text-lg font-semibold leading-tight text-rose-100">
              {activeRound.dailyTarget || currentRound.dailyTarget || 0} {t("patternForge.perDayShort", "/dia")}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-300 via-purple-300 to-cyan-300"
            style={{ width: `${activeRoundProgress}%` }}
          />
        </div>
      </div>

      <div className="pattern-forge-mobile-scroll mt-4 max-w-full min-w-0 overflow-x-auto overflow-y-hidden pb-1">
        <div className="flex w-max max-w-none snap-x gap-3">
          {rounds.map((round) => {
            const isActive = round.round === activeRound.round;
            const isPast = round.round < activeRound.round;
            return (
              <article
                key={round.round}
                className={[
                  "w-[190px] shrink-0 snap-start rounded-3xl border p-4",
                  isActive
                    ? "border-rose-300/35 bg-rose-300/10"
                    : isPast
                      ? "border-emerald-300/20 bg-emerald-300/10"
                      : "border-white/10 bg-slate-950/45",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="break-words text-sm font-semibold text-white">
                    {t("patternForge.roundNumber", undefined, { round: round.round })}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                    {round.targetDays}d
                  </span>
                </div>
                <p className="mt-3 break-words text-2xl font-semibold text-white">
                  {round.dailyTarget || 0}
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    {t("patternForge.puzzlesPerDayShort", "puzzles/day")}
                  </span>
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                  {getDisplayRoundGoal(round.goal, language) || t("patternForge.patternBuilding", "Pattern building")}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MobileFeedbackCard({
  feedback,
  feedbackSelectedLineSan,
  feedbackSolutionLineSan,
  puzzle,
  t,
  language,
  onNext,
  onReviewLine,
  onRepeatLater,
  dailyGoalReached,
}) {
  if (!feedback) return null;

  return (
    <section
      className={[
        "rounded-[28px] border p-5 shadow-lg",
        feedback.isCorrect
          ? "border-emerald-300/30 bg-emerald-300/10 shadow-emerald-950/20"
          : "border-rose-300/35 bg-rose-400/10 shadow-rose-950/25",
      ].join(" ")}
    >
      <p className="break-words text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">
        {feedback.isCorrect ? t("patternForge.correctTitle") : t("patternForge.notQuiteTitle")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        {feedback.isCorrect ? t("patternForge.correctTitle") : t("patternForge.incorrectMoveTitle")}
      </h2>
      <p className="mt-2 break-words text-sm leading-6 text-slate-300">
        {feedback.isCorrect
          ? t("patternForge.patternRecognized", "Theme learned. Keep the recognition loop moving.")
          : feedback.explanation || puzzle.explanation || t("patternForge.mistakeDetected")}
      </p>

      <details className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4" open={!feedback.isCorrect}>
        <summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">
          {t("patternForge.correctLine")}
        </summary>
        <div className="mt-3 grid gap-3">
          {!feedback.isCorrect ? (
            <div className="rounded-xl border border-rose-300/25 bg-rose-950/25 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-rose-200">
                {t("patternForge.yourMove", "Your move")}
              </p>
              <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-white">
                {feedbackSelectedLineSan || feedback.wrongMove || t("common.na")}
              </p>
            </div>
          ) : null}
          <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/25 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-200">
              {t("patternForge.correctContinuation", "Correct continuation")}
            </p>
            <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-emerald-100">
              {feedbackSolutionLineSan || t("common.na")}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {t("patternForge.tacticalMotif", "Tactical motif")}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {getThemeTitle(puzzle.theme, language)}
            </p>
          </div>
        </div>
      </details>

      <div className="mt-4 grid gap-2">
        {!dailyGoalReached ? (
          <button
            type="button"
            onClick={onNext}
            className={[
              "min-h-[52px] rounded-2xl px-5 py-3 text-sm font-bold",
              feedback.isCorrect ? "bg-emerald-300 text-slate-950" : "bg-rose-300 text-slate-950",
            ].join(" ")}
          >
            {t("patternForge.nextPuzzle")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onReviewLine}
          className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200"
        >
          {t("patternForge.reviewLineOnBoard")}
        </button>
        {!feedback.isCorrect ? (
          <button
            type="button"
            onClick={onRepeatLater}
            className="min-h-12 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-100"
          >
            {t("patternForge.repeatLater")}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function ForgeViewTabs({ activeView, onChange, t }) {
  const tabs = [
    ["training", t("patternForge.trainingTab", "Training")],
    ["leaderboards", t("patternForge.leaderboardsTab", "Leaderboards")],
  ];

  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
      {tabs.map(([id, label]) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              "min-h-11 rounded-xl px-2 text-xs font-bold transition sm:text-sm",
              isActive
                ? "bg-gradient-to-r from-rose-300 via-purple-300 to-cyan-200 text-slate-950 shadow-[0_0_24px_rgba(168,85,247,0.22)]"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
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
  calendarProgress,
  puzzles = [],
  themeReasons = [],
  leaderboards = null,
  onSubmitAttempt,
  onCompleteDailySession,
  onCompleteCycle,
  onRefreshLeaderboards,
  leaderboardsLoading = false,
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
  const [boardOrientation, setBoardOrientation] = useState("white");
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
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [activeForgeView, setActiveForgeView] = useState("training");
  const audioContextRef = useRef(null);

  const currentRound = getCurrentRound(cycleDraft);
  const totalRounds = cycleDraft?.repetitionPlan?.rounds?.length || 1;
  const dayProgress =
    calendarProgress?.currentDay ||
    cycleDraft?.progress?.currentDay ||
    cycleDraft?.progress?.currentDayInRound ||
    1;
  const completedTodayBase =
    todaySession?.completedPuzzleIds?.length || cycleDraft?.progress?.completedToday || 0;
  const completedInRoundBase = cycleDraft?.progress?.completedPuzzlesInRound || 0;
  const dailyTarget =
    todaySession?.dailyTarget ||
    calendarProgress?.requiredDailyPace ||
    currentRound.dailyTarget;
  const originalDailyTarget = calendarProgress?.originalDailyTarget || currentRound.dailyTarget;
  const daysRemaining = calendarProgress?.daysRemaining ?? Math.max(0, (currentRound.targetDays || 1) - dayProgress + 1);
  const isBehindSchedule = Boolean(calendarProgress?.isBehindSchedule);
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
  const firstPendingPuzzleIndex = useMemo(
    () => getFirstPendingPuzzleIndex(sessionPuzzles, todaySession),
    [sessionPuzzles, todaySession]
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
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobileLayout(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

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
    setBoardOrientation(puzzle?.sideToMove || "white");
    setPuzzleStartedAt(Date.now());
  }, [puzzle?.sessionPuzzleId, puzzle?.fen]);

  useEffect(() => {
    setCurrentPuzzleIndex(firstPendingPuzzleIndex);
  }, [firstPendingPuzzleIndex, todaySession?._id, todaySession?.id]);

  useEffect(() => {
    setDailyGoalPromptDismissed(false);
  }, [todaySession?._id, todaySession?.id]);

  useEffect(() => {
    if (activeForgeView !== "leaderboards") return;
    onRefreshLeaderboards?.();
  }, [activeForgeView, onRefreshLeaderboards]);

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

  const resetCurrentPuzzlePosition = () => {
    setBoardFen(puzzle?.fen || "8/8/8/8/8/8/8/8 w - - 0 1");
    setCurrentSolutionIndex(0);
    setPlayedLine([]);
    setSelectedMove("");
    setFeedback(null);
    setIsAnswerRevealed(false);
    setIsBoardLocked(false);
    setLastMoveSquare(null);
    setLastMoveLabel("");
    setPuzzleStartedAt(Date.now());
  };

  if (isMobileLayout) {
    const accuracy = sessionStats.attempted
      ? Math.round((sessionStats.correct / sessionStats.attempted) * 100)
      : 0;
    const estimatedRemaining = remainingToday
      ? `${Math.max(1, Math.round(remainingToday * 1.5))} min`
      : t("patternForge.complete", "Complete");
    const mobileStats = [
      [t("patternForge.currentStreak", "Current streak"), sessionStats.currentStreak, `${t("patternForge.bestStreak", "Best streak")}: ${sessionStats.bestStreak}`],
      [t("patternForge.accuracyToday", "Accuracy today"), `${accuracy}%`, `${sessionStats.correct}/${sessionStats.attempted || 0} ${t("patternForge.correct", "correct")}`],
      [t("patternForge.mistakesQueued"), mistakesQueue.length, t("patternForge.mistakeReturn", "Mistake return")],
      [t("patternForge.recognitionTimer", "Recognition timer"), elapsedSeconds < 60 ? `${elapsedSeconds}s` : `${Math.floor(elapsedSeconds / 60)}m`, t("patternForge.sessionTime", "Session time")],
      [t("patternForge.remainingToday"), remainingToday, estimatedRemaining],
      [t("patternForge.daysRemaining", "Days remaining"), daysRemaining, isBehindSchedule ? t("patternForge.behindSchedule", "Adjusted pace") : t("patternForge.onSchedule", "On schedule")],
    ];

    return (
      <section className="mx-auto grid w-full max-w-[460px] min-w-0 gap-5 pb-28 md:hidden">
        <header className="rounded-[30px] border border-rose-300/20 bg-[radial-gradient(circle_at_90%_0%,rgba(244,63,94,0.18),transparent_34%),linear-gradient(145deg,rgba(35,12,22,0.94),rgba(9,12,18,0.98))] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200">
                {t("patternForge.activeMultiDayCycle")}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                {t("patternForge.roundNumber", undefined, { round: currentRound.round })}
              </h1>
              <p className="mt-1 break-words text-sm text-slate-400">
                {t("patternForge.dayProgress")} {dayProgress} / {currentRound.targetDays}
              </p>
              {isBehindSchedule ? (
                <p className="mt-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                  {t("patternForge.adjustedTarget", "Meta ajustada")}: {dailyTarget}
                </p>
              ) : null}
            </div>
            <span className="max-w-[46%] break-words rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-xs font-semibold leading-5 text-purple-100">
              {phase.label}
            </span>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-white">{cycleProgress}%</span>
              <span className="text-slate-400">{estimatedRemaining}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-300 via-purple-300 to-cyan-200"
                style={{ width: `${cycleProgress}%` }}
              />
            </div>
          </div>
        </header>

        <ForgeViewTabs activeView={activeForgeView} onChange={setActiveForgeView} t={t} />

        {activeForgeView === "leaderboards" ? (
          <ForgeLeaderboard
            leaderboards={leaderboards || undefined}
            currentUserId={leaderboards?.currentUserId}
            loading={leaderboardsLoading}
          />
        ) : null}

        {activeForgeView !== "training" ? null : (
        <>
        <section className="rounded-[28px] border border-purple-300/18 bg-white/[0.035] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
            {t("patternForge.todaysTraining", "Today's training")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {t("patternForge.puzzleProgress", undefined, {
              current: currentPuzzleIndex + 1,
              total,
            })}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
              <p className="break-words text-[10px] uppercase tracking-[0.08em] text-slate-500">{t("patternForge.todaysTarget")}</p>
              <p className="mt-1 text-xl font-semibold text-white">{dailyTarget}</p>
              {dailyTarget !== originalDailyTarget ? (
                <p className="mt-1 text-[11px] text-amber-100/80">
                  {t("patternForge.originalTarget", "Original")}: {originalDailyTarget}
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
              <p className="break-words text-[10px] uppercase tracking-[0.08em] text-slate-500">{t("patternForge.remainingToday")}</p>
              <p className="mt-1 text-xl font-semibold text-white">{remainingToday}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("pattern-forge-mobile-board")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-4 min-h-[52px] w-full rounded-2xl bg-gradient-to-r from-rose-400 via-purple-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_38px_rgba(244,63,94,0.22)]"
          >
            {t("patternForge.startTodaysSession", "Start Today's Session")}
          </button>
        </section>

        <main id="pattern-forge-mobile-board" className="grid gap-4">
          <section
            className={[
              "pattern-forge-mobile-board rounded-[30px] border bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_40%),rgba(2,6,23,0.58)] p-2 transition-all duration-300",
              boardEffectClasses[boardEffect] || boardEffectClasses.idle,
            ].join(" ")}
          >
            <div className="mb-3 flex items-start justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  {t(`patternForge.side.${puzzle.sideToMove}`, puzzle.sideToMove)}
                </p>
                <h2 className="mt-1 truncate text-xl font-semibold text-white">
                  {getThemeTitle(puzzle.theme, language)}
                </h2>
              </div>
              <span
                className={[
                  "max-w-[48%] shrink-0 break-words rounded-full border px-3 py-1 text-[10px] font-bold leading-4",
                  boardEffect === "wrong"
                    ? "border-rose-300/35 bg-rose-300/12 text-rose-100"
                    : boardEffect === "correct"
                      ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                      : "border-purple-300/25 bg-purple-300/10 text-purple-100",
                ].join(" ")}
              >
                {boardEffectLabel}
              </span>
            </div>

            {puzzles.length ? (
              <ReviewBoard
                fen={boardFen || puzzle.fen}
                orientation={boardOrientation}
                onMove={handleBoardMove}
                neutralHighlightedSquare={lastMoveSquare}
                disabled={isAnswerRevealed || isSubmittingAttempt || isBoardLocked}
                maxBoardWidth={470}
                shellMaxWidth={490}
                viewportHeightRatio={0.64}
              />
            ) : (
              <div className="grid min-h-[280px] place-items-center rounded-[24px] border border-dashed border-rose-300/25 bg-slate-950/50 p-6 text-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">{t("patternForge.noPuzzlesTitle")}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{t("patternForge.noPuzzlesDescription")}</p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-950/45 p-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1 text-xs font-semibold text-rose-100">
                {getThemeTitle(puzzle.theme, language)}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                {puzzle.difficulty}
              </span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                {currentPuzzleIndex + 1}/{total}
              </span>
            </div>
            <p className="mt-4 break-words text-sm leading-6 text-slate-300">{puzzle.prompt}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {t("patternForge.moveTrail", "Move trail")}
              </p>
              <p className="mt-2 min-h-6 break-words font-mono text-sm font-semibold text-white">
                {playedLine.length ? playedLineSan : t("patternForge.dragMoveHint")}
              </p>
            </div>
          </section>

          <MobileFeedbackCard
            feedback={feedback}
            feedbackSelectedLineSan={feedbackSelectedLineSan}
            feedbackSolutionLineSan={feedbackSolutionLineSan}
            puzzle={puzzle}
            t={t}
            language={language}
            onNext={() => goNext()}
            onReviewLine={reviewLineOnBoard}
            onRepeatLater={handleRepeatLater}
            dailyGoalReached={shouldShowDailyGoalPrompt}
          />

          {shouldShowDailyGoalPrompt ? (
            <section className="rounded-[28px] border border-purple-300/35 bg-purple-400/10 p-5 text-purple-50 shadow-lg shadow-purple-950/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200">
                {t("patternForge.dailyGoalReached", "Meta diária atingida")}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {t("patternForge.dailyGoalCongrats", "Great work. You hit today's Pattern Forge target.")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-purple-100/80">
                {t("patternForge.dailyGoalChoice", "You can finish now or continue training.")}
              </p>
              <div className="mt-4 grid gap-2">
                {canContinueAfterDailyGoal ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDailyGoalPromptDismissed(true);
                      if (feedback) goNext();
                    }}
                    className="min-h-12 rounded-2xl bg-purple-300 px-4 py-3 text-sm font-bold text-slate-950"
                  >
                    {t("patternForge.keepTraining", "Keep training")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={finishToday}
                  className="min-h-12 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white"
                >
                  {t("patternForge.finishForToday")}
                </button>
              </div>
            </section>
          ) : null}
        </main>

        <section className="grid gap-4">
          <h2 className="px-1 text-xl font-semibold text-white">{t("patternForge.trainingStats", "Training statistics")}</h2>
          <MobileStatScroller items={mobileStats} />
        </section>

        <MobileCycleTimeline
          rounds={cycleDraft.repetitionPlan.rounds}
          currentRound={currentRound}
          currentDay={dayProgress}
          t={t}
          language={language}
        />

        <details className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <summary className="min-h-11 cursor-pointer text-lg font-semibold text-white">
            {t("patternForge.configuration", "Configuration")}
          </summary>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {t("patternForge.patternSetCount", undefined, { count: patternSetSize })}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {cycleDraft.patternSet?.themes?.map((theme) => getThemeTitle(theme, language)).join(" · ") || getThemeTitle(puzzle.theme, language)}
              </p>
            </div>
            <button
              type="button"
              onClick={onConfigureNew}
              className="min-h-12 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-100"
            >
              {t("patternForge.configureNewCycle")}
            </button>
            <button
              type="button"
              onClick={onResetSetup}
              className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200"
            >
              {t("patternForge.resetCycleSetup")}
            </button>
            <button
              type="button"
              onClick={onBackToPractice}
              className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200"
            >
              {t("patternForge.backToPractice")}
            </button>
          </div>
        </details>

        <details className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <summary className="min-h-11 cursor-pointer text-lg font-semibold text-white">
            {t("patternForge.history", "History")}
          </summary>
          <div className="mt-4 grid gap-3">
            {attempts.length ? (
              attempts.slice(-6).reverse().map((attempt, index) => (
                <div key={`${attempt.puzzleId}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-sm font-semibold text-white">
                    {attempt.isCorrect ? t("patternForge.correctTitle") : t("patternForge.notQuiteTitle")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{attempt.selectedMove || t("common.na")}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-400">
                {t("patternForge.noHistoryYet", "No previous attempts in this session yet.")}
              </p>
            )}
          </div>
        </details>
        </>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(35,12,22,0.94),rgba(9,12,18,0.98))] p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="break-words text-xs font-semibold uppercase tracking-[0.1em] text-rose-200">
              {t("patternForge.activeMultiDayCycle")}
            </p>
            <h1 className="mt-2 break-words text-3xl font-semibold text-white">{t("patternForge.title")}</h1>
            <p className="mt-2 break-words text-sm leading-6 text-slate-400">
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

      <ForgeViewTabs activeView={activeForgeView} onChange={setActiveForgeView} t={t} />

      {activeForgeView === "leaderboards" ? (
        <ForgeLeaderboard
          leaderboards={leaderboards || undefined}
          currentUserId={leaderboards?.currentUserId}
          loading={leaderboardsLoading}
        />
      ) : (
      <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["patternForge.currentRound", t("patternForge.roundOf", undefined, { current: currentRound.round, total: totalRounds })],
          ["patternForge.dayProgress", `${dayProgress} / ${currentRound.targetDays}`],
          [
            "patternForge.todaysTarget",
            dailyTarget !== originalDailyTarget
              ? `${dailyTarget} (${t("patternForge.originalTarget", "Original")}: ${originalDailyTarget})`
              : dailyTarget,
          ],
          ["patternForge.daysRemaining", daysRemaining],
          ["patternForge.completedToday", todayCompleted],
          ["patternForge.forgeProgress", `${cycleProgress}%`],
          ["patternForge.currentPhase", phase.label],
        ].map(([key, value]) => (
          <div key={key} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="break-words text-xs uppercase tracking-[0.08em] text-slate-500">{t(key)}</p>
            <p className="mt-1 break-words text-xl font-semibold leading-tight text-white">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(244,63,94,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(88,28,135,0.09),rgba(15,23,42,0.45))] p-4 shadow-2xl shadow-black/20 sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.055),transparent)] opacity-60" />
          <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-purple-500/14 blur-3xl" />
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="break-words text-xs uppercase tracking-[0.08em] text-slate-500">
                {t(`patternForge.side.${puzzle.sideToMove}`, puzzle.sideToMove)}
              </p>
              <h2 className="mt-1 break-words text-2xl font-semibold leading-tight text-white">
                {getThemeTitle(puzzle.theme, language)}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "max-w-full break-words rounded-full border px-3 py-1 text-xs font-semibold leading-5 transition duration-300",
                  boardEffect === "wrong"
                    ? "border-rose-300/35 bg-rose-300/12 text-rose-100"
                    : boardEffect === "correct"
                      ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                      : "border-purple-300/25 bg-purple-300/10 text-purple-100",
                ].join(" ")}
              >
                {boardEffectLabel}
              </span>
              <span className="break-words rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-semibold leading-5 text-slate-300">
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
                  <p className="break-words text-xs font-semibold uppercase tracking-[0.08em]">
                    {feedback.isCorrect ? t("patternForge.correctTitle") : t("patternForge.notQuiteTitle")}
                  </p>
                  <p className="mt-1 break-words text-base font-semibold leading-6 text-white">
                    {feedback.isCorrect
                      ? t("patternForge.patternRecognized", "Padrão reconhecido. Continue o ciclo.")
                      : t("patternForge.mistakeDetected", "Mistake detected. Compare your move with the correct line.")}
                  </p>
                  {!feedback.isCorrect ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-rose-300/30 bg-rose-950/35 px-3 py-2">
                        <p className="break-words text-[11px] font-bold uppercase tracking-[0.08em] text-rose-200">
                          {t("patternForge.yourMove", "Your move")}
                        </p>
                        <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-white">
                          {feedbackSelectedLineSan || feedback.wrongMove || t("common.na")}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/25 px-3 py-2">
                        <p className="break-words text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-200">
                          {t("patternForge.correctLine")}
                        </p>
                        <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-emerald-100">
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
                  <p className="break-words text-xs font-bold uppercase tracking-[0.08em] text-purple-200">
                    {t("patternForge.dailyGoalReached", "Meta diária atingida")}
                  </p>
                  <h3 className="mt-1 break-words text-lg font-semibold leading-snug text-white">
                    {t("patternForge.dailyGoalCongrats", "Great work. You hit today's Pattern Forge target.")}
                  </h3>
                  <p className="mt-1 break-words text-sm leading-6 text-purple-100/80">
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
              <p className="break-words text-xs uppercase tracking-[0.08em] text-slate-500">
                {t("patternForge.moveTrail", "Move trail")}
              </p>
              <p className="mt-2 min-h-6 break-words font-mono text-sm font-semibold text-white">
                {playedLine.length ? playedLineSan : t("patternForge.dragMoveHint")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="break-words text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  {t("patternForge.lastMove", "Last move")}
                </p>
                <p className="mt-1 break-words font-mono text-sm font-semibold leading-6 text-purple-100">
                  {lastMoveSan || t("common.na")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="break-words text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  {t("patternForge.streak")}
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-100">
                  {sessionStats.currentStreak}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="break-words text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  {t("patternForge.recognitionSpeed", "Recognition")}
                </p>
                <p className="mt-1 text-sm font-semibold text-rose-100">
                  {elapsedSeconds < 60 ? `${elapsedSeconds}s` : `${Math.floor(elapsedSeconds / 60)}m`}
                </p>
              </div>
            </div>
          </div>
          <details className="mt-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-400">
            <summary className="cursor-pointer break-words text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
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
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold text-white">{t("patternForge.compressionSchedule")}</h2>
            <p className="mt-1 break-words text-sm leading-6 text-slate-400">{t("patternForge.scheduleDashboardHint")}</p>
          </div>
          <span className="max-w-full break-words rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-xs font-semibold leading-5 text-rose-100">
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
              <p className="break-words text-xs uppercase tracking-[0.08em] text-rose-200">
                {t("patternForge.roundNumber", undefined, { round: round.round })}
              </p>
              <p className="mt-2 break-words text-lg font-semibold leading-snug text-white">
                {t("patternForge.scheduleLine", undefined, {
                  days: round.targetDays,
                  count: round.dailyTarget,
                })}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-slate-400">{getDisplayRoundGoal(round.goal, language)}</p>
            </div>
          ))}
        </div>
      </section>

      {themeReasons.length ? (
        <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
          <h2 className="break-words text-xl font-semibold text-white">{t("patternForge.whyThemesTitle")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {themeReasons.map((reason) => {
              const confidence = formatReasonConfidence(reason.confidence);
              return (
                <div key={`${reason.theme}-${reason.sourceField}`} className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="break-words font-semibold text-cyan-100">{getThemeTitle(reason.theme, language)}</p>
                  <p className="mt-2 break-words text-sm leading-6 text-slate-300">
                    {formatThemeReasonText(reason, language)}
                  </p>
                  <p className="mt-3 break-words text-xs leading-5 text-cyan-200">
                    {formatThemeReasonSource(reason.sourceField, language)}
                    {confidence ? ` · ${confidence}%` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
      </>
      )}
    </section>
  );
}
