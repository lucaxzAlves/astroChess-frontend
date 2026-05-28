import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import "../../styles/gameReview.css";

const fallbackFen = "8/8/8/8/8/8/8/8 w - - 0 1";

function getLineFen(lineStartFen, moves, currentPly) {
  if (currentPly <= 0) return lineStartFen;
  return moves[currentPly - 1]?.fenAfter || lineStartFen;
}

function getSquareStyles(squares = []) {
  return squares.reduce((styles, square) => {
    if (!square) return styles;

    return {
      ...styles,
      [square]: {
        background:
          "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(34, 211, 238, 0.12))",
        boxShadow: "inset 0 0 0 3px rgba(196, 181, 253, 0.48), 0 0 14px rgba(139, 92, 246, 0.14)",
      },
    };
  }, {});
}

function MoveButton({ move, index, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "grid min-w-0 gap-1 rounded-xl border px-3 py-2 text-left text-sm transition sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-3",
        active
          ? "border-violet-300/35 bg-violet-300/[0.08] text-white"
          : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-violet-300/25 hover:text-white",
      ].join(" ")}
    >
      <span className="whitespace-nowrap font-semibold">{index + 1}. {move.san || move.uci}</span>
      {move.comment ? <span className="min-w-0 truncate text-xs text-slate-500">{move.comment}</span> : null}
    </button>
  );
}

export default function AcademyConceptBoard({ conceptBoard }) {
  const { t } = useLanguage();
  const wrapperRef = useRef(null);
  const audioContextRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(560);
  const [currentLineType, setCurrentLineType] = useState("main");
  const [activeVariationId, setActiveVariationId] = useState(null);
  const [currentPly, setCurrentPly] = useState(0);

  const initialFen = conceptBoard?.initialFen || fallbackFen;
  const mainLine = Array.isArray(conceptBoard?.mainLine) ? conceptBoard.mainLine : [];
  const variations = Array.isArray(conceptBoard?.variations) ? conceptBoard.variations : [];
  const activeVariation = variations.find((variation) => variation.id === activeVariationId) || null;
  const currentMoves =
    currentLineType === "variation" ? activeVariation?.moves || [] : mainLine;
  const lineStartFen =
    currentLineType === "variation" ? activeVariation?.startFen || initialFen : initialFen;
  const boardFen = getLineFen(lineStartFen, currentMoves, currentPly);
  const currentMove = currentPly > 0 ? currentMoves[currentPly - 1] : null;
  const maxPly = currentMoves.length;

  const playMoveSound = () => {
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
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.exponentialRampToValueAtTime(430, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.12);
  };

  const navigateToPly = (nextPly, shouldPlaySound = true) => {
    const safePly = Math.max(0, Math.min(maxPly, nextPly));

    if (currentPly !== safePly && shouldPlaySound) {
      playMoveSound();
    }

    setCurrentPly(safePly);
  };

  const activeExplanation = useMemo(() => {
    const blocks = Array.isArray(conceptBoard?.explanationBlocks)
      ? conceptBoard.explanationBlocks
      : [];
    const exactBlock = blocks.find((block) => Number(block.movePly) === currentPly);

    if (exactBlock) {
      return exactBlock;
    }

    if (currentMove?.comment) {
      return {
        title: currentMove.san || t("academy.currentPosition"),
        text: currentMove.comment,
      };
    }

    if (currentLineType === "variation" && activeVariation?.description) {
      return {
        title: activeVariation.label || t("academy.alternativeLine"),
        text: activeVariation.description,
      };
    }

    return {
      title: t("academy.beforeTheMove"),
      text: conceptBoard?.description || t("academy.conceptBoardFallback"),
    };
  }, [activeVariation, conceptBoard, currentLineType, currentMove, currentPly, t]);

  const squareStyles = useMemo(
    () => getSquareStyles(currentMove?.highlightSquares || []),
    [currentMove]
  );

  useEffect(() => {
    setCurrentLineType("main");
    setActiveVariationId(null);
    setCurrentPly(0);
  }, [conceptBoard]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const syncBoardWidth = () => {
      const width = wrapperRef.current?.clientWidth || 560;
      const max = Math.min(width, 620);
      const min = window.innerWidth > 900 ? 420 : 280;
      setBoardWidth(Math.max(min, Math.floor(max)));
    };

    syncBoardWidth();
    const observer = new ResizeObserver(syncBoardWidth);
    observer.observe(wrapperRef.current);
    window.addEventListener("resize", syncBoardWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncBoardWidth);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        navigateToPly(currentPly + 1);
      }

      if (event.key === "ArrowLeft") {
        navigateToPly(currentPly - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPly, maxPly]);

  const selectMainLine = () => {
    setCurrentLineType("main");
    setActiveVariationId(null);
    setCurrentPly(0);
  };

  const selectVariation = (variationId) => {
    setCurrentLineType("variation");
    setActiveVariationId(variationId);
    setCurrentPly(0);
  };

  return (
    <section className="grid gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/80">
          {t("academy.conceptPosition")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {t("academy.seeTheIdea")}
        </h2>
        <p className="mt-2 max-h-24 max-w-3xl overflow-y-auto pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
          {t("academy.conceptBoardDescription")}
        </p>
      </div>

      <div className="grid min-w-0 gap-5 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,12,18,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="game-review-board-shell">
            <div ref={wrapperRef} className="game-review-board-wrapper">
              <div
                className="game-review-board-frame"
                style={{ width: `${boardWidth}px`, height: `${boardWidth}px` }}
              >
                <Chessboard
                  id={`academy-concept-board-${conceptBoard?.title || "lesson"}`}
                  position={boardFen}
                  boardWidth={boardWidth}
                  boardOrientation={conceptBoard?.orientation === "black" ? "black" : "white"}
                  customDarkSquareStyle={{ backgroundColor: "#373050" }}
                  customLightSquareStyle={{ backgroundColor: "#b8aecf" }}
                  customSquareStyles={squareStyles}
                  arePiecesDraggable={false}
                  areArrowsAllowed={false}
                  showBoardNotation
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => navigateToPly(0)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white sm:px-4"
              >
                {t("academy.resetLine")}
              </button>
              <button
                type="button"
                onClick={() => navigateToPly(currentPly - 1)}
                disabled={currentPly === 0}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
              >
                {t("academy.previousMove")}
              </button>
              <button
                type="button"
                onClick={() => navigateToPly(currentPly + 1)}
                disabled={currentPly >= maxPly}
                className="rounded-xl border border-violet-200/25 bg-violet-300/12 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:border-violet-200/40 hover:bg-violet-300/18 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
              >
                {t("academy.nextMove")}
              </button>
              <span className="max-w-full rounded-full border border-violet-200/15 bg-violet-200/[0.06] px-3 py-2 text-xs font-semibold text-violet-100">
                {currentLineType === "variation"
                  ? activeVariation?.label || t("academy.alternativeLine")
                  : t("academy.mainIdea")}
              </span>
            </div>
          </div>
        </div>

        <aside className="grid min-w-0 content-start gap-4 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4 sm:p-5 lg:sticky lg:top-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap gap-2">
              <span className="max-w-full break-words rounded-full border border-violet-200/20 bg-violet-200/[0.07] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-100">
                {t("academy.conceptOnBoard")}
              </span>
              {conceptBoard?.sourceGame ? (
                <span className="max-w-full break-words rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                  {conceptBoard.sourceGame.white} - {conceptBoard.sourceGame.black}, {conceptBoard.sourceGame.year}
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 break-words text-xl font-semibold leading-tight text-white sm:text-2xl">
              {conceptBoard?.title || t("academy.conceptOnBoard")}
            </h3>
            <p className="mt-2 max-h-32 overflow-y-auto break-words pr-2 text-sm leading-6 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
              {conceptBoard?.description}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-violet-200/15 bg-violet-200/[0.045] p-4">
            <p className="break-words text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/80">
              {t("academy.whyThisMoveMatters")}
            </p>
            <h4 className="mt-2 break-words text-lg font-semibold leading-snug text-white">{activeExplanation.title}</h4>
            <p className="mt-2 max-h-40 overflow-y-auto break-words pr-2 text-sm leading-6 text-slate-300 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
              {activeExplanation.text}
            </p>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="break-words text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t("academy.moveList")}
              </h4>
              {currentLineType === "variation" ? (
                <button
                  type="button"
                  onClick={selectMainLine}
                  className="text-xs font-semibold text-violet-100 transition hover:text-white"
                >
                  {t("academy.backToMainIdea")}
                </button>
              ) : null}
            </div>
            <div className="grid min-w-0 max-h-56 gap-2 overflow-y-auto overflow-x-hidden pr-1">
              {currentMoves.length ? (
                currentMoves.map((move, index) => (
                  <MoveButton
                    key={`${move.ply || index}-${move.san || move.uci}`}
                    move={move}
                    index={index}
                    active={currentPly === index + 1}
                    onClick={() => navigateToPly(index + 1)}
                  />
                ))
              ) : (
                <p className="break-words rounded-xl border border-white/10 bg-slate-950/35 p-3 text-sm text-slate-400">
                  {t("academy.noConceptMoves")}
                </p>
              )}
            </div>
          </div>

          {variations.length ? (
            <div className="min-w-0">
              <h4 className="break-words text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t("academy.compareAnotherPlan")}
              </h4>
              <div className="mt-3 grid gap-3">
                {variations.map((variation) => (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => selectVariation(variation.id)}
                    className={[
                      "min-w-0 rounded-2xl border p-4 text-left transition",
                      activeVariationId === variation.id
                        ? "border-violet-300/35 bg-violet-300/[0.08]"
                        : "border-white/10 bg-slate-950/35 hover:border-violet-300/25",
                    ].join(" ")}
                  >
                    <span className="block break-words font-semibold text-white">{variation.label}</span>
                    <span className="mt-1 block max-h-24 overflow-y-auto break-words pr-2 text-sm leading-5 text-slate-400 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
                      {variation.description}
                    </span>
                    <span className="mt-3 block text-xs font-semibold text-violet-100">
                      {t("academy.viewLine")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
