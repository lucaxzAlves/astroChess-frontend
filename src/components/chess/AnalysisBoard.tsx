import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";

type Props = {
  fen: string;
  orientation: "white" | "black";
  onMove: (source: string, target: string) => boolean;
};

export default function AnalysisBoard({ fen, orientation, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(560);

  useEffect(() => {
    if (!containerRef.current) return;

    const computeBoardWidth = () => {
      const viewportMax = Math.min(window.innerHeight * 0.72, 720);
      const viewportMin = window.innerWidth >= 768 ? 420 : 280;
      const containerWidth = containerRef.current?.clientWidth ?? 560;
      const nextWidth = Math.max(
        viewportMin,
        Math.min(Math.floor(containerWidth - 24), Math.floor(viewportMax))
      );
      setBoardWidth(nextWidth);
    };

    computeBoardWidth();
    const resizeObserver = new ResizeObserver(computeBoardWidth);
    resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", computeBoardWidth);

    return () => {
      window.removeEventListener("resize", computeBoardWidth);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[720px] md:min-w-[420px] rounded-2xl border border-violet-400/20 bg-[#0b1220] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.65)]"
    >
      <Chessboard
        id="analysis-board"
        position={fen}
        boardWidth={boardWidth}
        boardOrientation={orientation}
        customDarkSquareStyle={{ backgroundColor: "#4c1d95" }}
        customLightSquareStyle={{ backgroundColor: "#ddd6fe" }}
        onPieceDrop={(sourceSquare, targetSquare) => {
          if (!targetSquare) return false;
          return onMove(sourceSquare, targetSquare);
        }}
      />
    </div>
  );
}
