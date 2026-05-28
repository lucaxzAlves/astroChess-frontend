import { Chess } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import EvaluationBar from "../components/review/EvaluationBar";
import MoveControls from "../components/review/MoveControls";
import ReviewBoard from "../components/review/ReviewBoard";
import ReviewPanel from "../components/review/ReviewPanel";
import ReviewPlayerBar from "../components/review/ReviewPlayerBar";
import type { ReviewMove, ReviewMoveRow } from "../components/review/ReviewMoveList";
import {
  analyzePgnGame,
  normalizeGameAnalysisResponse,
} from "../services/analysisApi";
import { getUserFriendlyError } from "../utils/userFriendlyErrors";
import {
  buildVariationFromPv,
  getVariationSources,
  groupMovesWithVariations,
  type BuiltVariation,
} from "../utils/reviewVariations";
import "../styles/gameReview.css";

type ReviewPlayerMeta = {
  username?: string;
  rating?: number | string | null;
  avatar?: string | null;
  accuracy?: number | null;
};

type GameMeta = {
  result?: string;
  rawResult?: string;
  date?: string;
  timeControl?: string;
  opening?: string;
  rated?: string;
  url?: string;
  whitePlayer?: string;
  blackPlayer?: string;
  whiteRating?: number | string | null;
  blackRating?: number | string | null;
  whiteAccuracy?: number | null;
  blackAccuracy?: number | null;
  whiteAvatar?: string | null;
  blackAvatar?: string | null;
};

type GameReviewPageProps = {
  gameId?: string;
  pgn?: string;
  players?: {
    white?: string;
    black?: string;
  };
  gameMeta?: GameMeta;
  connectedUsername?: string;
};

type AnalysisResult = ReturnType<typeof normalizeGameAnalysisResponse>;
type ReviewMode = "mainline" | "backendVariation" | "freeAnalysis";

const fallbackPgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;

  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable
  );
}

function formatPlayer(player: ReviewPlayerMeta | undefined, fallbackName: string) {
  return {
    username: player?.username || fallbackName || "Desconhecido",
    rating: player?.rating ?? "N/A",
    avatar: player?.avatar || "",
    accuracy: player?.accuracy ?? null,
  };
}

function buildMoveRows(
  replayMoves: ReviewMove[],
  moveClassifications: AnalysisResult["moveClassifications"] = []
) {
  const classificationMap = new Map(moveClassifications.map((move) => [move.ply, move]));
  const totalRows = Math.ceil(replayMoves.length / 2);

  return Array.from({ length: totalRows }).map((_, rowIndex) => {
    const whitePly = rowIndex * 2 + 1;
    const blackPly = whitePly + 1;
    const whiteReplayMove = replayMoves[whitePly - 1];
    const blackReplayMove = replayMoves[blackPly - 1];
    const whiteAnalysis = classificationMap.get(whitePly);
    const blackAnalysis = classificationMap.get(blackPly);

    return {
      moveNumber: rowIndex + 1,
      white: whiteReplayMove
        ? {
            san: whiteAnalysis?.san || whiteReplayMove.san,
            classification: whiteAnalysis?.classification,
          }
        : undefined,
      black: blackReplayMove
        ? {
            san: blackAnalysis?.san || blackReplayMove.san,
            classification: blackAnalysis?.classification,
          }
        : undefined,
    };
  });
}

export default function GameReviewPage({
  gameId,
  pgn,
  players,
  gameMeta,
  connectedUsername,
}: GameReviewPageProps) {
  const sourcePgn = pgn || "";
  const activePgn = sourcePgn || fallbackPgn;

  const replayData = useMemo(() => {
    const parser = new Chess();
    parser.loadPgn(activePgn);
    const history = parser.history();
    const replay = new Chess();
    const builtMoves: ReviewMove[] = [];
    const fens: string[] = [replay.fen()];

    history.forEach((san) => {
      const move = replay.move(san);
      const uci = move ? `${move.from}${move.to}${move.promotion || ""}` : undefined;
      builtMoves.push({ san, fen: replay.fen(), uci });
      fens.push(replay.fen());
    });

    return { builtMoves, fens, startingFen: fens[0] };
  }, [activePgn]);

  const [currentFen, setCurrentFen] = useState(replayData.startingFen);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("mainline");
  const [activeVariation, setActiveVariation] = useState<BuiltVariation | null>(null);
  const [variationPly, setVariationPly] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [activeTab, setActiveTab] = useState<"report" | "analysis" | "coach">("report");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [freeLineStartFen, setFreeLineStartFen] = useState(replayData.startingFen);
  const [freeLineMoves, setFreeLineMoves] = useState<string[]>([]);
  const [freeLineFens, setFreeLineFens] = useState<string[]>([replayData.startingFen]);
  const [freeLinePly, setFreeLinePly] = useState(0);
  const [freeLineHighlightSquare, setFreeLineHighlightSquare] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBrilliantAnimationPlyRef = useRef<number | null>(null);
  const [brilliantMeteorTargetSquare, setBrilliantMeteorTargetSquare] = useState<string | null>(null);
  const [brilliantMeteorTriggerKey, setBrilliantMeteorTriggerKey] = useState<string | number | null>(null);

  const playMoveSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

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

  useEffect(() => {
    setCurrentFen(replayData.startingFen);
    setCurrentMoveIndex(0);
    setReviewMode("mainline");
    setActiveVariation(null);
    setVariationPly(0);
    setAnalysisResult(null);
    setAnalysisError("");
    setIsAnalyzing(false);
    setFreeLineStartFen(replayData.startingFen);
    setFreeLineMoves([]);
    setFreeLineFens([replayData.startingFen]);
    setFreeLinePly(0);
    setFreeLineHighlightSquare(null);
    lastBrilliantAnimationPlyRef.current = null;
    setBrilliantMeteorTargetSquare(null);
    setBrilliantMeteorTriggerKey(null);
  }, [replayData]);

  const playersData = useMemo(() => {
    const white = formatPlayer(
      {
        username: gameMeta?.whitePlayer,
        rating: gameMeta?.whiteRating,
        avatar: gameMeta?.whiteAvatar,
        accuracy: gameMeta?.whiteAccuracy,
      },
      players?.white || "White"
    );

    const black = formatPlayer(
      {
        username: gameMeta?.blackPlayer,
        rating: gameMeta?.blackRating,
        avatar: gameMeta?.blackAvatar,
        accuracy: gameMeta?.blackAccuracy,
      },
      players?.black || "Black"
    );

    return { white, black };
  }, [gameMeta, players]);

  const playerTarget = useMemo(() => {
    const normalizedConnectedUsername = connectedUsername?.trim().toLowerCase();
    if (!normalizedConnectedUsername) return null;

    if (playersData.white.username.trim().toLowerCase() === normalizedConnectedUsername) {
      return "white";
    }

    if (playersData.black.username.trim().toLowerCase() === normalizedConnectedUsername) {
      return "black";
    }

    return null;
  }, [connectedUsername, playersData]);

  const selectedGameForAnalysis = useMemo(
    () => ({
      id: gameId || gameMeta?.url || "game-1",
      pgn: sourcePgn,
      result: gameMeta?.result || "*",
      rawResult: gameMeta?.rawResult || "*",
      date: gameMeta?.date || "????.??.??",
      url: gameMeta?.url || "Chess.com",
      whitePlayer: playersData.white.username,
      blackPlayer: playersData.black.username,
      whiteAvatar: playersData.white.avatar,
      blackAvatar: playersData.black.avatar,
      white: {
        username: playersData.white.username,
        avatar: playersData.white.avatar,
      },
      black: {
        username: playersData.black.username,
        avatar: playersData.black.avatar,
      },
      playerTarget,
    }),
    [gameId, gameMeta, playerTarget, playersData, sourcePgn]
  );

  const hasAnalysis = Boolean(
    analysisResult?.moveClassifications?.length || analysisResult?.analyzedMoves?.length
  );

  const goToMainlinePly = (index: number, options: { playSound?: boolean } = {}) => {
    const safeIndex = Math.max(0, Math.min(index, replayData.fens.length - 1));
    if (reviewMode === "mainline" && safeIndex === currentMoveIndex) return;

    setReviewMode("mainline");
    setActiveVariation(null);
    setVariationPly(0);
    setCurrentMoveIndex(safeIndex);
    setCurrentFen(replayData.fens[safeIndex] || replayData.startingFen);
    setFreeLineHighlightSquare(null);

    if (options.playSound !== false) {
      playMoveSound();
    }
  };

  const goToVariationPly = (index: number, options: { playSound?: boolean } = {}) => {
    if (!activeVariation) return;

    const safeIndex = Math.max(0, Math.min(index, activeVariation.positions.length - 1));
    if (reviewMode === "backendVariation" && safeIndex === variationPly) return;

    setReviewMode("backendVariation");
    setVariationPly(safeIndex);
    setCurrentFen(activeVariation.positions[safeIndex]?.fen || activeVariation.startFen);
    setFreeLineHighlightSquare(
      safeIndex > 0 ? activeVariation.positions[safeIndex]?.toSquare || null : null
    );

    if (options.playSound !== false) {
      playMoveSound();
    }
  };

  const goToFreeLinePly = (index: number, options: { playSound?: boolean } = {}) => {
    const safeIndex = Math.max(0, Math.min(index, freeLineFens.length - 1));
    if (reviewMode === "freeAnalysis" && safeIndex === freeLinePly) return;

    setReviewMode("freeAnalysis");
    setFreeLinePly(safeIndex);
    setCurrentFen(freeLineFens[safeIndex] || freeLineStartFen);

    if (options.playSound !== false) {
      playMoveSound();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (reviewMode === "backendVariation" && activeVariation) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goToVariationPly(variationPly + 1);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToVariationPly(variationPly - 1);
        }

        if (event.key === "Home") {
          event.preventDefault();
          goToVariationPly(0);
        }

        if (event.key === "End") {
          event.preventDefault();
          goToVariationPly(activeVariation.positions.length - 1);
        }

        return;
      }

      if (reviewMode === "freeAnalysis") {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goToFreeLinePly(freeLinePly + 1);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToFreeLinePly(freeLinePly - 1);
        }

        if (event.key === "Home") {
          event.preventDefault();
          goToFreeLinePly(0);
        }

        if (event.key === "End") {
          event.preventDefault();
          goToFreeLinePly(freeLineFens.length - 1);
        }

        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToMainlinePly(currentMoveIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToMainlinePly(currentMoveIndex - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToMainlinePly(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goToMainlinePly(replayData.builtMoves.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeVariation,
    currentMoveIndex,
    freeLineFens.length,
    freeLinePly,
    replayData.builtMoves.length,
    reviewMode,
    variationPly,
  ]);

  const handleMove = (source: string, target: string) => {
    const next = new Chess(currentFen);
    const move = next.move({ from: source, to: target, promotion: "q" });
    if (!move) return false;

    const nextFens =
      reviewMode === "freeAnalysis"
        ? [...freeLineFens.slice(0, freeLinePly + 1), next.fen()]
        : [currentFen, next.fen()];
    const nextMoves =
      reviewMode === "freeAnalysis"
        ? [...freeLineMoves.slice(0, freeLinePly), move.san]
        : [move.san];

    setReviewMode("freeAnalysis");
    setActiveVariation(null);
    setFreeLineStartFen(reviewMode === "freeAnalysis" ? freeLineStartFen : currentFen);
    setFreeLineFens(nextFens);
    setFreeLineMoves(nextMoves);
    setFreeLinePly(nextFens.length - 1);
    setCurrentFen(next.fen());
    setFreeLineHighlightSquare(move.to);
    playMoveSound();
    return true;
  };

  const resetPosition = () => {
    if (reviewMode === "backendVariation" && activeVariation) {
      goToVariationPly(0, { playSound: false });
      return;
    }

    if (reviewMode === "freeAnalysis") {
      goToFreeLinePly(0, { playSound: false });
      return;
    }

    goToMainlinePly(0, { playSound: false });
  };

  const backToMainLine = () => {
    goToMainlinePly(currentMoveIndex, { playSound: false });
  };

  const clearFreeLine = () => {
    setFreeLineMoves([]);
    setFreeLineFens([currentFen]);
    setFreeLinePly(0);
    backToMainLine();
  };

  const handleStartReview = async () => {
    if (!sourcePgn) {
      setAnalysisError("Nenhum PGN disponível para esta partida.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      const response = await analyzePgnGame({
        game: selectedGameForAnalysis,
        includeAiReview: true,
      });

      const normalized = normalizeGameAnalysisResponse(response, selectedGameForAnalysis);
      setAnalysisResult(normalized);
      setActiveTab("report");
      goToMainlinePly(0, { playSound: false });
    } catch (error) {
      setAnalysisError(
        getUserFriendlyError(error, "Não foi possível analisar essa partida agora.")
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAnalyzedMove = useMemo(() => {
    if (!analysisResult || reviewMode !== "mainline" || currentMoveIndex <= 0) return null;

    return (
      analysisResult.analyzedMoves.find((move) => move.ply === currentMoveIndex) ||
      analysisResult.moveClassifications.find((move) => move.ply === currentMoveIndex) ||
      null
    );
  }, [analysisResult, currentMoveIndex, reviewMode]);

  const variationSources = useMemo(
    () =>
      analysisResult
        ? getVariationSources(analysisResult.analyzedMoves, analysisResult.criticalMoments)
        : [],
    [analysisResult]
  );

  const moveRows = useMemo(() => {
    if (!analysisResult) return [];
    const grouped = buildMoveRows(replayData.builtMoves, analysisResult.moveClassifications);
    return groupMovesWithVariations(grouped, variationSources) as ReviewMoveRow[];
  }, [analysisResult, replayData.builtMoves, variationSources]);

  const handleStartVariation = (source: {
    ply?: number;
    moveNumber?: number;
    color?: string;
    bestMove?: string;
    classification?: string;
    pv?: string[];
    comment?: string;
    fenBefore?: string;
    fenAfter?: string;
  }) => {
    if (!analysisResult) return;

    const variation = buildVariationFromPv(source, analysisResult.analyzedMoves);
    if (!variation) return;

    setReviewMode("backendVariation");
    setActiveVariation(variation);
    setVariationPly(0);
    setCurrentFen(variation.startFen);
    setFreeLineHighlightSquare(null);
  };

  const gameInfo = {
    result: gameMeta?.result || "N/A",
    timeControl: gameMeta?.timeControl || "N/A",
    date: gameMeta?.date || "N/A",
    opening: gameMeta?.opening || "Abertura desconhecida",
    rated: gameMeta?.rated || "N/A",
  };

  const boardPlayerBars = useMemo(() => {
    const whitePlayer = {
      color: "white" as const,
      name: playersData.white.username,
      rating: playersData.white.rating,
    };
    const blackPlayer = {
      color: "black" as const,
      name: playersData.black.username,
      rating: playersData.black.rating,
    };

    return orientation === "white"
      ? { top: blackPlayer, bottom: whitePlayer }
      : { top: whitePlayer, bottom: blackPlayer };
  }, [orientation, playersData]);

  const boardStatus = useMemo(() => {
    if (reviewMode === "backendVariation" && activeVariation) {
      return `Linha sugerida a partir de ${activeVariation.moveNumber}${activeVariation.color === "black" ? "..." : "."} ${activeVariation.bestMove || activeVariation.pv[0]}`;
    }

    if (reviewMode === "freeAnalysis") {
      return "Modo de análise livre";
    }

    return "Linha principal";
  }, [activeVariation, reviewMode]);

  const currentEvaluation = useMemo(() => {
    if (reviewMode === "backendVariation") {
      return null;
    }

    if (reviewMode === "freeAnalysis") {
      return null;
    }

    return currentAnalyzedMove?.evalAfter ?? currentAnalyzedMove?.evalBefore ?? null;
  }, [currentAnalyzedMove, reviewMode]);

  const evalLabelOverride =
    reviewMode === "backendVariation"
      ? "Linha"
      : reviewMode === "freeAnalysis"
        ? "Sem avaliação"
        : undefined;

  const boardHighlight = useMemo(() => {
    if (reviewMode === "mainline") {
      return {
        square: currentAnalyzedMove?.uci?.slice(2, 4) || null,
        classification: currentAnalyzedMove?.classification || null,
        neutralSquare: null,
      };
    }

    if (reviewMode === "backendVariation" && activeVariation && variationPly > 0) {
      return {
        square: null,
        classification: null,
        neutralSquare: activeVariation.positions[variationPly]?.toSquare || null,
      };
    }

    if (reviewMode === "freeAnalysis") {
      return {
        square: null,
        classification: null,
        neutralSquare: freeLineHighlightSquare,
      };
    }

    return {
      square: null,
      classification: null,
      neutralSquare: null,
    };
  }, [activeVariation, currentAnalyzedMove, freeLineHighlightSquare, reviewMode, variationPly]);

  useEffect(() => {
    if (
      reviewMode !== "mainline" ||
      !currentAnalyzedMove ||
      currentAnalyzedMove.classification !== "brilliant" ||
      !currentAnalyzedMove.uci ||
      currentMoveIndex <= 0
    ) {
      return;
    }

    if (lastBrilliantAnimationPlyRef.current === currentMoveIndex) {
      return;
    }

    const targetSquare = currentAnalyzedMove.uci.slice(2, 4);
    lastBrilliantAnimationPlyRef.current = currentMoveIndex;
    setBrilliantMeteorTargetSquare(targetSquare);
    setBrilliantMeteorTriggerKey(`brilliant-${currentMoveIndex}`);
  }, [currentAnalyzedMove, currentMoveIndex, reviewMode]);

  const latestMoveTargetSquare = useMemo(() => {
    if (reviewMode === "backendVariation" && activeVariation && variationPly > 0) {
      return activeVariation.positions[variationPly]?.toSquare || null;
    }

    if (reviewMode === "freeAnalysis") {
      return freeLineHighlightSquare;
    }

    return (
      currentAnalyzedMove?.uci?.slice(2, 4) ||
      replayData.builtMoves[currentMoveIndex - 1]?.uci?.slice(2, 4) ||
      null
    );
  }, [
    activeVariation,
    currentAnalyzedMove,
    currentMoveIndex,
    freeLineHighlightSquare,
    replayData.builtMoves,
    reviewMode,
    variationPly,
  ]);

  const triggerMeteorTest = () => {
    if (!latestMoveTargetSquare) return;
    setBrilliantMeteorTargetSquare(latestMoveTargetSquare);
    setBrilliantMeteorTriggerKey(`test-${currentMoveIndex}-${Date.now()}`);
  };

  return (
    <div className="game-review-page">
      <div className="game-review-layout">
        <section className="game-review-board-card">
          <ReviewPlayerBar
            name={boardPlayerBars.top.name}
            rating={boardPlayerBars.top.rating}
            color={boardPlayerBars.top.color}
          />

          <div className="game-review-board-with-eval">
            <ReviewBoard
              fen={currentFen}
              orientation={orientation}
              onMove={handleMove}
              highlightedSquare={boardHighlight.square}
              highlightedClassification={boardHighlight.classification}
              neutralHighlightedSquare={boardHighlight.neutralSquare}
              brilliantEffectTargetSquare={brilliantMeteorTargetSquare}
              brilliantEffectTriggerKey={brilliantMeteorTriggerKey}
              soundEnabled={soundEnabled}
            />
            <EvaluationBar evaluation={currentEvaluation} labelOverride={evalLabelOverride} />
          </div>

          <ReviewPlayerBar
            name={boardPlayerBars.bottom.name}
            rating={boardPlayerBars.bottom.rating}
            color={boardPlayerBars.bottom.color}
          />

          <div className="game-review-mode-row">
            <span className="game-review-mode-badge">{boardStatus}</span>
            {reviewMode === "backendVariation" ? (
              <button type="button" className="game-review-mode-button" onClick={backToMainLine}>
                Back to main line
              </button>
            ) : null}
            {reviewMode === "freeAnalysis" ? (
              <>
                <button type="button" className="game-review-mode-button" onClick={clearFreeLine}>
                  Clear free line
                </button>
                <button type="button" className="game-review-mode-button" onClick={backToMainLine}>
                  Back to main line
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="game-review-mode-button brilliant-test-button"
              onClick={triggerMeteorTest}
              disabled={!latestMoveTargetSquare}
            >
              Testar meteoro
            </button>
          </div>

          {reviewMode === "mainline" && analysisResult && currentAnalyzedMove ? (
            <div className="game-review-board-status">
              <span className="game-review-board-status-kicker">Marcador do tabuleiro</span>
              <strong>
                {currentAnalyzedMove.moveNumber}
                {currentAnalyzedMove.color === "black" ? "..." : "."} {currentAnalyzedMove.san}
              </strong>
              <span>{currentAnalyzedMove.comment || "Classificação sincronizada com o lance atual."}</span>
            </div>
          ) : null}

          <MoveControls
            onPrev={() => {
              if (reviewMode === "backendVariation") {
                goToVariationPly(variationPly - 1);
                return;
              }

              if (reviewMode === "freeAnalysis") {
                goToFreeLinePly(freeLinePly - 1);
                return;
              }

              goToMainlinePly(currentMoveIndex - 1);
            }}
            onNext={() => {
              if (reviewMode === "backendVariation" && activeVariation) {
                goToVariationPly(variationPly + 1);
                return;
              }

              if (reviewMode === "freeAnalysis") {
                goToFreeLinePly(freeLinePly + 1);
                return;
              }

              goToMainlinePly(currentMoveIndex + 1);
            }}
            onReset={resetPosition}
            onFlip={() => setOrientation((prev) => (prev === "white" ? "black" : "white"))}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
          />
        </section>

        <ReviewPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          summary={analysisResult?.reviewSummary || null}
          gameInfo={gameInfo}
          moveRows={moveRows}
          currentMoveIndex={currentMoveIndex}
          onSelectMove={goToMainlinePly}
          onStartVariation={handleStartVariation}
          analyzedMoves={analysisResult?.analyzedMoves || []}
          reviewMode={reviewMode}
          activeVariationPly={activeVariation?.sourcePly || null}
          freeLineMoves={freeLineMoves}
          aiReview={analysisResult?.aiReview || null}
          hasAnalysis={hasAnalysis}
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
          onStartReview={handleStartReview}
          currentMoveLabel={
            reviewMode === "mainline" && currentAnalyzedMove
              ? {
                  san: currentAnalyzedMove.san,
                  classification: currentAnalyzedMove.classification,
                  moveNumber: currentAnalyzedMove.moveNumber,
                  color: currentAnalyzedMove.color,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
