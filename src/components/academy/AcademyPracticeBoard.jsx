import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import ReviewBoard from "../review/ReviewBoard";
import "../../styles/gameReview.css";

const fallbackFen = "8/8/8/8/8/8/8/8 w - - 0 1";

function moveToUci(move) {
  if (!move) return "";
  return `${move.from}${move.to}${move.promotion || ""}`.toLowerCase();
}

function getPuzzleId(puzzle, index = 0) {
  return puzzle?._id || puzzle?.id || `academy-puzzle-${index + 1}`;
}

function normalizeSolution(rawSolution) {
  const source = Array.isArray(rawSolution)
    ? rawSolution
    : String(rawSolution || "")
        .split(/\s+/)
        .filter(Boolean);

  return source
    .map((move) => {
      if (typeof move === "string") return move;
      return move?.uci || move?.san || move?.move || move?.notation || "";
    })
    .map((move) => String(move).trim())
    .filter(Boolean);
}

function normalizePuzzle(puzzle, index) {
  const solution = normalizeSolution(
    puzzle?.solutionMoves || puzzle?.solution || puzzle?.solutionLine || puzzle?.moves,
  );
  const themes = Array.isArray(puzzle?.themes)
    ? puzzle.themes
    : [puzzle?.theme, ...(Array.isArray(puzzle?.tags) ? puzzle.tags : [])].filter(Boolean);

  return {
    ...puzzle,
    id: getPuzzleId(puzzle, index),
    title: puzzle?.title || puzzle?.theme || `Puzzle ${index + 1}`,
    fen: puzzle?.playableFen || puzzle?.fen || fallbackFen,
    orientation:
      puzzle?.orientation ||
      (String(puzzle?.playableFen || puzzle?.fen || "").split(" ")[1] === "b" ? "black" : "white"),
    solution,
    themes,
    theme: themes[0] || puzzle?.theme || "Practice",
    difficulty: puzzle?.difficulty || puzzle?.normalizedDifficulty || "",
    rating: puzzle?.rating || puzzle?.elo || null,
    explanation: puzzle?.explanation || puzzle?.comment || "",
    prompt: puzzle?.prompt || puzzle?.question || "",
  };
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

function getSideToMoveLabel(fen, language) {
  const isBlack = String(fen || "").split(" ")[1] === "b";
  const isPt = String(language || "").toLowerCase().startsWith("pt");
  if (isPt) return isBlack ? "Pretas jogam" : "Brancas jogam";
  return isBlack ? "Black to move" : "White to move";
}

function AcademyPuzzleCard({ puzzle, active, solved, onSelect }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        active
          ? "border-cyan-300/45 bg-cyan-300/[0.08] shadow-[0_0_22px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-slate-950/35 hover:border-violet-300/30 hover:bg-violet-300/[0.04]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{puzzle.title}</p>
          <p className="mt-1 text-xs text-slate-500">{puzzle.theme}</p>
        </div>
        {solved ? (
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
            OK
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {puzzle.difficulty ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
            {puzzle.difficulty}
          </span>
        ) : null}
        {puzzle.rating ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
            {puzzle.rating}
          </span>
        ) : null}
        <span className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-2.5 py-1 text-xs text-violet-100">
          {t("academy.solvePuzzle")}
        </span>
      </div>
    </button>
  );
}

export default function AcademyPracticeBoard({ puzzles = [] }) {
  const { language, t } = useLanguage();
  const audioContextRef = useRef(null);
  const replyTimerRef = useRef(null);
  const normalizedPuzzles = useMemo(
    () => puzzles.map((puzzle, index) => normalizePuzzle(puzzle, index)).filter((puzzle) => puzzle.fen),
    [puzzles],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [boardFen, setBoardFen] = useState("");
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [playedLine, setPlayedLine] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState([]);
  const [lastMoveSquare, setLastMoveSquare] = useState(null);

  const activePuzzle = normalizedPuzzles[activeIndex] || normalizedPuzzles[0];
  const solvedSet = useMemo(() => new Set(solvedPuzzleIds), [solvedPuzzleIds]);
  const correctLineLabel = useMemo(
    () => (activePuzzle ? formatLineAsSan(activePuzzle.fen, activePuzzle.solution) : ""),
    [activePuzzle],
  );

  const playPracticeSound = (type = "move") => {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type === "wrong" ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(type === "wrong" ? 220 : 560, now);
    oscillator.frequency.exponentialRampToValueAtTime(type === "correct" ? 780 : 380, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "wrong" ? 0.075 : 0.055, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.14);
  };

  const resetPuzzle = (index = activeIndex) => {
    const nextPuzzle = normalizedPuzzles[index] || normalizedPuzzles[0];
    if (!nextPuzzle) return;
    window.clearTimeout(replyTimerRef.current);
    setActiveIndex(index);
    setBoardFen(nextPuzzle.fen);
    setCurrentSolutionIndex(0);
    setPlayedLine([]);
    setFeedback(null);
    setIsBoardLocked(false);
    setLastMoveSquare(null);
  };

  useEffect(() => {
    resetPuzzle(activeIndex);
    return () => window.clearTimeout(replyTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePuzzle?.id]);

  if (!normalizedPuzzles.length) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-6">
        <p className="text-sm font-semibold text-white">{t("academy.targetedPractice")}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {language?.startsWith("pt")
            ? "Nenhum puzzle foi cadastrado para esta aula ainda."
            : "No puzzles have been added to this lesson yet."}
        </p>
      </div>
    );
  }

  const solvingColor = (() => {
    try {
      return new Chess(activePuzzle.fen).turn();
    } catch {
      return String(activePuzzle.fen || "").split(" ")[1] === "b" ? "b" : "w";
    }
  })();

  const markSolved = () => {
    setFeedback("correct");
    setSolvedPuzzleIds((current) =>
      current.includes(activePuzzle.id) ? current : [...current, activePuzzle.id],
    );
    playPracticeSound("correct");
  };

  const autoPlayOpponentReply = (fenAfterUserMove, nextIndex, nextLine) => {
    const opponentMove = activePuzzle.solution[nextIndex];
    if (!opponentMove) {
      markSolved();
      return;
    }

    let chess;
    try {
      chess = new Chess(fenAfterUserMove);
    } catch {
      markSolved();
      return;
    }

    if (chess.turn() === solvingColor) {
      setCurrentSolutionIndex(nextIndex);
      return;
    }

    setIsBoardLocked(true);
    replyTimerRef.current = window.setTimeout(() => {
      const reply = applySolutionMove(fenAfterUserMove, opponentMove);
      if (!reply) {
        setIsBoardLocked(false);
        markSolved();
        return;
      }

      const lineAfterReply = [...nextLine, reply.uci];
      setBoardFen(reply.fen);
      setPlayedLine(lineAfterReply);
      setCurrentSolutionIndex(nextIndex + 1);
      setLastMoveSquare(reply.move.to);
      setIsBoardLocked(false);
      playPracticeSound("move");

      if (!activePuzzle.solution[nextIndex + 1]) {
        markSolved();
      }
    }, 380);
  };

  const handleBoardMove = (source, target) => {
    if (isBoardLocked || feedback === "correct") return false;

    const expectedMove = activePuzzle.solution[currentSolutionIndex];
    if (!expectedMove) return false;

    const expectedResult = applySolutionMove(boardFen, expectedMove);
    if (!expectedResult) return false;

    const attemptedChess = new Chess(boardFen);
    let attemptedMove = null;
    try {
      attemptedMove = attemptedChess.move({
        from: source,
        to: target,
        promotion: expectedResult.move.promotion || "q",
      });
    } catch {
      attemptedMove = null;
    }

    if (!attemptedMove) return false;

    const attemptedUci = moveToUci(attemptedMove);

    if (attemptedUci !== expectedResult.uci) {
      setBoardFen(attemptedChess.fen());
      setPlayedLine((current) => [...current, attemptedUci]);
      setFeedback("wrong");
      setLastMoveSquare(attemptedMove.to);
      playPracticeSound("wrong");
      return true;
    }

    const nextLine = [...playedLine, expectedResult.uci];
    setBoardFen(expectedResult.fen);
    setPlayedLine(nextLine);
    setFeedback(null);
    setLastMoveSquare(expectedResult.move.to);
    playPracticeSound("move");

    autoPlayOpponentReply(expectedResult.fen, currentSolutionIndex + 1, nextLine);
    return true;
  };

  const goToNextPuzzle = () => {
    resetPuzzle((activeIndex + 1) % normalizedPuzzles.length);
  };

  const revealAnswer = () => {
    setFeedback("revealed");
    playPracticeSound("move");
  };

  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(49,46,129,0.16),rgba(8,8,14,0.92))] p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                {getSideToMoveLabel(boardFen, language)}
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-white">{activePuzzle.title}</h3>
              {activePuzzle.prompt ? (
                <p className="mt-2 text-sm leading-6 text-slate-400">{activePuzzle.prompt}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1 text-xs font-medium text-violet-100">
                {activePuzzle.theme}
              </span>
              {activePuzzle.difficulty ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                  {activePuzzle.difficulty}
                </span>
              ) : null}
            </div>
          </div>

          <ReviewBoard
            fen={boardFen || activePuzzle.fen}
            orientation={activePuzzle.orientation}
            onMove={handleBoardMove}
            neutralHighlightedSquare={lastMoveSquare}
            disabled={isBoardLocked || feedback === "correct"}
          />
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {language?.startsWith("pt") ? "Prática da aula" : "Lesson practice"}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
                style={{ width: `${Math.round(((activeIndex + 1) / normalizedPuzzles.length) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {language?.startsWith("pt")
                ? `Puzzle ${activeIndex + 1} de ${normalizedPuzzles.length}`
                : `Puzzle ${activeIndex + 1} of ${normalizedPuzzles.length}`}
            </p>

            {feedback ? (
              <div
                className={[
                  "mt-4 rounded-2xl border p-4",
                  feedback === "wrong"
                    ? "border-rose-300/35 bg-rose-400/[0.08]"
                    : feedback === "correct"
                      ? "border-emerald-300/35 bg-emerald-400/[0.08]"
                      : "border-cyan-300/30 bg-cyan-400/[0.07]",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-white">
                  {feedback === "wrong"
                    ? language?.startsWith("pt") ? "Não foi esse lance." : "Not quite."
                    : feedback === "correct"
                      ? language?.startsWith("pt") ? "Correto." : "Correct."
                      : language?.startsWith("pt") ? "Linha correta" : "Correct line"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {correctLineLabel || activePuzzle.solution.join(" ")}
                </p>
                {activePuzzle.explanation ? (
                  <p className="mt-3 max-h-36 overflow-y-auto pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
                    {activePuzzle.explanation}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400">
                {language?.startsWith("pt")
                  ? "Jogue o melhor lance no tabuleiro. A resposta do adversário será executada automaticamente quando houver uma linha com mais de um lance."
                  : "Play the best move on the board. Opponent replies are autoplayed when the solution has a longer line."}
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button
                type="button"
                onClick={() => resetPuzzle(activeIndex)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
              >
                {language?.startsWith("pt") ? "Reiniciar" : "Reset"}
              </button>
              <button
                type="button"
                onClick={revealAnswer}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-violet-300/35 hover:text-white"
              >
                {language?.startsWith("pt") ? "Ver resposta" : "Reveal answer"}
              </button>
              <button
                type="button"
                onClick={goToNextPuzzle}
                className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/45 hover:bg-cyan-300/15 sm:col-span-2 xl:col-span-1"
              >
                {language?.startsWith("pt") ? "Próximo puzzle" : "Next puzzle"}
              </button>
            </div>
          </div>

          <div className="max-h-[30rem] overflow-y-auto rounded-[24px] border border-white/10 bg-slate-950/30 p-3 [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.4)_rgba(15,23,42,0.55)]">
            <div className="grid gap-3">
              {normalizedPuzzles.map((puzzle, index) => (
                <AcademyPuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  active={index === activeIndex}
                  solved={solvedSet.has(puzzle.id)}
                  onSelect={() => resetPuzzle(index)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
