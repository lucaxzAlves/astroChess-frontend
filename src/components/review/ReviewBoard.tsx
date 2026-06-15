import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getClassificationMeta } from "../../utils/reviewClassification";
import BrilliantMeteorEffect from "./BrilliantMeteorEffect";
import MoveQualityIcon from "./MoveQualityIcon";

type ReviewBoardProps = {
  fen: string;
  orientation: "white" | "black";
  onMove: (source: string, target: string) => boolean;
  highlightedSquare?: string | null;
  highlightedClassification?: string | null;
  neutralHighlightedSquare?: string | null;
  brilliantEffectTargetSquare?: string | null;
  brilliantEffectTriggerKey?: string | number | null;
  soundEnabled?: boolean;
  disabled?: boolean;
  maxBoardWidth?: number;
  shellMaxWidth?: number;
  viewportHeightRatio?: number;
};

function getSquareMarkerPosition(square: string, orientation: "white" | "black") {
  const file = square[0];
  const rank = Number(square[1]);
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const fileIndex = files.indexOf(file);

  if (fileIndex < 0 || Number.isNaN(rank)) {
    return null;
  }

  const column = orientation === "white" ? fileIndex : 7 - fileIndex;
  const row = orientation === "white" ? 8 - rank : rank - 1;

  return {
    left: `${((column + 0.82) / 8) * 100}%`,
    top: `${((row + 0.18) / 8) * 100}%`,
  };
}

function getSquareOverlayPosition(square: string, orientation: "white" | "black") {
  const file = square[0];
  const rank = Number(square[1]);
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const fileIndex = files.indexOf(file);

  if (fileIndex < 0 || Number.isNaN(rank)) {
    return null;
  }

  const column = orientation === "white" ? fileIndex : 7 - fileIndex;
  const row = orientation === "white" ? 8 - rank : rank - 1;

  return {
    left: `${(column / 8) * 100}%`,
    top: `${(row / 8) * 100}%`,
    width: "12.5%",
    height: "12.5%",
  };
}

export default function ReviewBoard({
  fen,
  orientation,
  onMove,
  highlightedSquare,
  highlightedClassification,
  neutralHighlightedSquare,
  brilliantEffectTargetSquare,
  brilliantEffectTriggerKey,
  soundEnabled = true,
  disabled = false,
  maxBoardWidth = 680,
  shellMaxWidth = 780,
  viewportHeightRatio = 0.76,
}: ReviewBoardProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const boardFrameRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(620);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const syncBoardWidth = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperWidth = wrapperRect.width || wrapper.clientWidth || 620;
      const visualViewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const viewportWidthLimit = Math.max(0, visualViewportWidth - 24);
      const viewportHeightLimit = Math.floor(window.innerHeight * viewportHeightRatio);
      const availableWidth = Math.min(wrapperWidth, viewportWidthLimit, viewportHeightLimit, maxBoardWidth);
      const safeWidth = Math.max(0, Math.floor(availableWidth) - 2);

      if (safeWidth <= 0) {
        setBoardWidth(Math.min(280, maxBoardWidth));
        return;
      }

      setBoardWidth(Math.max(Math.min(280, safeWidth), safeWidth));
    };

    syncBoardWidth();
    const observer = new ResizeObserver(syncBoardWidth);
    observer.observe(wrapperRef.current);
    window.addEventListener("resize", syncBoardWidth);
    window.visualViewport?.addEventListener("resize", syncBoardWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncBoardWidth);
      window.visualViewport?.removeEventListener("resize", syncBoardWidth);
    };
  }, [maxBoardWidth, viewportHeightRatio]);

  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  useEffect(() => {
    if (disabled) {
      setSelectedSquare(null);
    }
  }, [disabled]);

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);

  const canSelectSquare = (square: string) => {
    if (disabled) return false;
    if (!chess) return false;
    const piece = chess.get(square as never);
    return Boolean(piece && piece.color === chess.turn());
  };

  const legalTargets = useMemo(() => {
    if (disabled || !chess || !selectedSquare) return [];

    try {
      return chess
        .moves({ square: selectedSquare as never, verbose: true })
        .map((move) => move.to);
    } catch {
      return [];
    }
  }, [chess, disabled, selectedSquare]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};

    if (!highlightedSquare || !highlightedClassification) {
      if (neutralHighlightedSquare) {
        styles[neutralHighlightedSquare] = {
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.34), rgba(15, 15, 20, 0.12))",
          boxShadow: "inset 0 0 0 3px rgba(168, 85, 247, 0.7), 0 0 20px rgba(168, 85, 247, 0.18)",
        };
      }
    } else {
      const meta = getClassificationMeta(highlightedClassification);

      styles[highlightedSquare] = {
        background:
          `linear-gradient(135deg, ${meta.squareColor}, rgba(15, 15, 20, 0.16))`,
        boxShadow: `inset 0 0 0 3px ${meta.color}, 0 0 22px ${meta.squareColor}`,
      };
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        ...(styles[selectedSquare] || {}),
        background:
          "linear-gradient(135deg, rgba(14, 165, 233, 0.34), rgba(15, 23, 42, 0.26))",
        boxShadow:
          "inset 0 0 0 4px rgba(37, 99, 235, 0.78), 0 0 22px rgba(14, 165, 233, 0.24)",
      };
    }

    legalTargets.forEach((square) => {
      const hasPiece = Boolean(chess?.get(square as never));
      styles[square] = {
        ...(styles[square] || {}),
        background: hasPiece
          ? "radial-gradient(circle, transparent 48%, rgba(14, 165, 233, 0.42) 50%, rgba(37, 99, 235, 0.28) 64%, transparent 66%)"
          : "radial-gradient(circle, rgba(14, 165, 233, 0.72) 0 16%, transparent 18%)",
      };
    });

    return styles;
  }, [
    chess,
    highlightedClassification,
    highlightedSquare,
    legalTargets,
    neutralHighlightedSquare,
    selectedSquare,
  ]);

  const markerMeta = highlightedClassification
    ? getClassificationMeta(highlightedClassification)
    : null;
  const markerPosition =
    highlightedSquare && markerMeta
      ? getSquareMarkerPosition(highlightedSquare, orientation)
      : null;
  const selectedSquarePosition =
    selectedSquare ? getSquareOverlayPosition(selectedSquare, orientation) : null;
  const brilliantEffectPiece = useMemo(() => {
    if (!chess || !brilliantEffectTargetSquare) return null;

    try {
      const piece = chess.get(brilliantEffectTargetSquare as never);
      return piece ? { color: piece.color, type: piece.type } : null;
    } catch {
      return null;
    }
  }, [brilliantEffectTargetSquare, chess]);

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    if (!selectedSquare) {
      if (canSelectSquare(square)) {
        setSelectedSquare(square);
      }
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    if (canSelectSquare(square)) {
      setSelectedSquare(square);
      return;
    }

    const moved = onMove(selectedSquare, square);
    if (moved) {
      setSelectedSquare(null);
      return;
    }

    setSelectedSquare(canSelectSquare(square) ? square : null);
  };

  return (
    <div className="game-review-board-shell" style={{ maxWidth: `${shellMaxWidth}px` }}>
      <div
        ref={wrapperRef}
        className="game-review-board-wrapper"
        style={{ width: `min(100%, ${Math.round(viewportHeightRatio * 100)}vh, ${maxBoardWidth}px)` }}
      >
        <div
          ref={boardFrameRef}
          className="game-review-board-frame"
          style={{ width: `${boardWidth}px`, height: `${boardWidth}px` }}
        >
          <Chessboard
            id="game-review-board"
            position={fen}
            boardWidth={boardWidth}
            boardOrientation={orientation}
            animationDuration={110}
            customDarkSquareStyle={{ backgroundColor: "#4c1d95" }}
            customLightSquareStyle={{ backgroundColor: "#ddd6fe" }}
            customSquareStyles={squareStyles}
            customDropSquareStyle={{
              boxShadow:
                "inset 0 0 0 4px rgba(37, 99, 235, 0.78), 0 0 24px rgba(14, 165, 233, 0.26)",
            }}
            areArrowsAllowed={false}
            arePiecesDraggable={!disabled}
            showBoardNotation
            isDraggablePiece={({ sourceSquare }) => canSelectSquare(sourceSquare)}
            onPieceDragBegin={(_, sourceSquare) => {
              if (canSelectSquare(sourceSquare)) {
                setSelectedSquare(sourceSquare);
              }
            }}
            onPieceClick={(_, square) => {
              handleSquareClick(square);
            }}
            onPieceDrop={(sourceSquare, targetSquare) => {
              if (!targetSquare) return false;
              const moved = onMove(sourceSquare, targetSquare);
              setSelectedSquare(moved ? null : selectedSquare);
              return moved;
            }}
            onSquareClick={(square) => {
              handleSquareClick(square);
            }}
          />

          {selectedSquarePosition ? (
            <div
              className="game-review-selected-square-pulse"
              style={selectedSquarePosition}
            />
          ) : null}

          <BrilliantMeteorEffect
            targetSquare={brilliantEffectTargetSquare}
            movingPiece={brilliantEffectPiece}
            boardOrientation={orientation}
            boardWrapperRef={boardFrameRef}
            triggerKey={brilliantEffectTriggerKey}
            soundEnabled={soundEnabled}
          />

          {markerMeta && markerPosition ? (
            <div
              className={`game-review-board-marker ${markerMeta.cssClass}`}
              style={markerPosition}
            >
              <MoveQualityIcon classification={highlightedClassification} size="board" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
