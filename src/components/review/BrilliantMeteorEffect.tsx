import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, RefObject } from "react";

type BoardOrientation = "white" | "black";

type Point = {
  x: number;
  y: number;
};

type BrilliantMeteorEffectProps = {
  targetSquare?: string | null;
  movingPiece?: MeteorPiece | null;
  boardOrientation: BoardOrientation;
  boardWrapperRef: RefObject<HTMLDivElement | null>;
  triggerKey?: string | number | null;
  soundEnabled: boolean;
  onComplete?: () => void;
};

type MeteorPiece = {
  color: "w" | "b";
  type: "p" | "n" | "b" | "r" | "q" | "k";
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const pieceGlyphs: Record<MeteorPiece["color"], Record<MeteorPiece["type"], string>> = {
  w: {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕",
    k: "♔",
  },
  b: {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  },
};
const debrisParticles = [
  { dx: -72, dy: -38, delay: 585, color: "#22d3ee", size: 6 },
  { dx: 66, dy: -46, delay: 601, color: "#a855f7", size: 5 },
  { dx: -92, dy: 14, delay: 613, color: "#f8fafc", size: 4 },
  { dx: 92, dy: 22, delay: 625, color: "#22d3ee", size: 5 },
  { dx: -54, dy: 64, delay: 641, color: "#7c3aed", size: 6 },
  { dx: 48, dy: 76, delay: 657, color: "#f8fafc", size: 4 },
  { dx: -22, dy: -88, delay: 673, color: "#a855f7", size: 5 },
  { dx: 24, dy: -96, delay: 689, color: "#22d3ee", size: 4 },
  { dx: -112, dy: -8, delay: 705, color: "#a855f7", size: 4 },
  { dx: 114, dy: -2, delay: 721, color: "#f8fafc", size: 5 },
  { dx: -16, dy: 102, delay: 737, color: "#22d3ee", size: 5 },
  { dx: 8, dy: 116, delay: 753, color: "#7c3aed", size: 4 },
];

function isValidSquare(square?: string | null): square is string {
  if (!square || square.length < 2) return false;
  const file = square[0];
  const rank = Number(square[1]);
  return files.includes(file) && Number.isInteger(rank) && rank >= 1 && rank <= 8;
}

function getSquareTone(square: string) {
  const fileIndex = files.indexOf(square[0]);
  const rank = Number(square[1]);
  return (fileIndex + rank) % 2 === 0 ? "light" : "dark";
}

export function getSquareCenter(
  square: string,
  boardOrientation: BoardOrientation,
  boardRect: DOMRect,
): Point | null {
  if (!isValidSquare(square)) return null;

  const fileIndex = files.indexOf(square[0]);
  const rank = Number(square[1]);
  const squareSize = boardRect.width / 8;
  const column = boardOrientation === "white" ? fileIndex : 7 - fileIndex;
  const row = boardOrientation === "white" ? 8 - rank : rank - 1;

  return {
    x: column * squareSize + squareSize / 2,
    y: row * squareSize + squareSize / 2,
  };
}

function getNearbySquares(square: string) {
  if (!isValidSquare(square)) return [];

  const fileIndex = files.indexOf(square[0]);
  const rank = Number(square[1]);
  const nearby: string[] = [];

  for (let fileOffset = -1; fileOffset <= 1; fileOffset += 1) {
    for (let rankOffset = -1; rankOffset <= 1; rankOffset += 1) {
      if (fileOffset === 0 && rankOffset === 0) continue;

      const nextFile = files[fileIndex + fileOffset];
      const nextRank = rank + rankOffset;

      if (nextFile && nextRank >= 1 && nextRank <= 8) {
        nearby.push(`${nextFile}${nextRank}`);
      }
    }
  }

  return nearby;
}

function playBrilliantSound(soundEnabled: boolean) {
  if (!soundEnabled || typeof window === "undefined") return;

  const soundCandidates = [
    "/sounds/brilliant-impact.mp3",
    "/sounds/brilliant.mp3",
    "/sounds/move.mp3",
  ];

  const playFallbackTone = () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.exponentialRampToValueAtTime(92, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.34);
  };

  const tryPlay = (index: number) => {
    const src = soundCandidates[index];
    if (!src) {
      playFallbackTone();
      return;
    }

    const audio = new Audio(src);
    audio.volume = index === 0 ? 0.62 : 0.48;
    audio.currentTime = 0;
    audio.addEventListener("error", () => tryPlay(index + 1), { once: true });
    audio.play().catch(() => tryPlay(index + 1));
  };

  tryPlay(0);
}

export default function BrilliantMeteorEffect({
  targetSquare,
  movingPiece,
  boardOrientation,
  boardWrapperRef,
  triggerKey,
  soundEnabled,
  onComplete,
}: BrilliantMeteorEffectProps) {
  const [effect, setEffect] = useState<{
    key: string | number;
    target: Point;
    targetSquare: string;
    squareTone: "light" | "dark";
    nearby: Array<{ square: string; point: Point }>;
    squareSize: number;
  } | null>(null);

  useEffect(() => {
    const boardElement = boardWrapperRef.current;
    if (!boardElement || !isValidSquare(targetSquare) || triggerKey === null || triggerKey === undefined) {
      return;
    }

    const boardRect = boardElement.getBoundingClientRect();
    if (!boardRect.width || !boardRect.height) return;

    const target = getSquareCenter(targetSquare, boardOrientation, boardRect);
    if (!target) return;

    const nearby = getNearbySquares(targetSquare)
      .map((square) => {
        const point = getSquareCenter(square, boardOrientation, boardRect);
        return point ? { square, point } : null;
      })
      .filter((value): value is { square: string; point: Point } => Boolean(value));

    setEffect({
      key: triggerKey,
      target,
      targetSquare,
      squareTone: getSquareTone(targetSquare),
      nearby,
      squareSize: boardRect.width / 8,
    });
    boardElement.classList.remove("brilliant-board-shake");
    window.requestAnimationFrame(() => {
      boardElement.classList.add("brilliant-board-shake");
    });
    playBrilliantSound(soundEnabled);

    const timeout = window.setTimeout(() => {
      setEffect(null);
      boardElement.classList.remove("brilliant-board-shake");
      onComplete?.();
    }, 1750);

    return () => {
      boardElement.classList.remove("brilliant-board-shake");
      window.clearTimeout(timeout);
    };
  }, [boardOrientation, boardWrapperRef, onComplete, soundEnabled, targetSquare, triggerKey]);

  const style = useMemo(() => {
    if (!effect) return undefined;

    return {
      "--board-square-size": `${effect.squareSize}px`,
    } as CSSProperties;
  }, [effect]);

  if (!effect) return null;

  return (
    <div key={effect.key} className="brilliant-effect-layer" style={style}>
      <div
        className={`brilliant-piece-mask ${effect.squareTone}`}
        style={{ left: effect.target.x, top: effect.target.y }}
      />
      <div
        className="brilliant-meteor"
        style={{ left: effect.target.x, top: effect.target.y }}
      >
        <span className="brilliant-meteor-flame flame-a" />
        <span className="brilliant-meteor-flame flame-b" />
        <span className="brilliant-meteor-flame flame-c" />
        <img
          src="/assets/effects/astro-meteor.svg"
          className="brilliant-meteor-img"
          alt=""
          draggable={false}
        />
        {movingPiece ? (
          <span
            className={`brilliant-meteor-piece ${movingPiece.color === "w" ? "white" : "black"}`}
            aria-hidden="true"
          >
            {pieceGlyphs[movingPiece.color][movingPiece.type]}
          </span>
        ) : null}
      </div>
      <div
        className="brilliant-target-square-impact"
        style={{ left: effect.target.x, top: effect.target.y }}
      />
      <div
        className="brilliant-crater"
        style={{ left: effect.target.x, top: effect.target.y }}
      />
      <div
        className="brilliant-impact"
        style={{ left: effect.target.x, top: effect.target.y }}
      />
      <div
        className="brilliant-cracks"
        style={{
          left: effect.target.x,
          top: effect.target.y,
          width: effect.squareSize * 1.7,
          height: effect.squareSize * 1.7,
        }}
      />
      <div
        className="brilliant-shockwave"
        style={{ left: effect.target.x, top: effect.target.y }}
      />
      {debrisParticles.map((particle, index) => (
        <span
          key={`${effect.key}-debris-${index}`}
          className="brilliant-debris"
          style={
            {
              left: effect.target.x,
              top: effect.target.y,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              "--dx": `${particle.dx}px`,
              "--dy": `${particle.dy}px`,
              "--delay": `${particle.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
      {effect.nearby.map(({ square, point }, index) => (
        <div
          key={`${effect.key}-${square}`}
          className="brilliant-nearby-pulse"
          style={{
            left: point.x,
            top: point.y,
            animationDelay: `${580 + index * 24}ms`,
          }}
        />
      ))}
    </div>
  );
}
