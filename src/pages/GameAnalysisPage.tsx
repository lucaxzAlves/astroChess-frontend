import { Chess } from "chess.js";
import { useMemo, useState } from "react";
import AnalysisBoard from "../components/chess/AnalysisBoard";
import AnalysisPanel from "../components/chess/AnalysisPanel";
import PlayerBar from "../components/chess/PlayerBar";
import type { MoveItem } from "../components/chess/MoveList";

type GameAnalysisPageProps = {
  gameId?: string;
  pgn?: string;
  players?: {
    white?: string;
    black?: string;
  };
};

const fallbackPgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7";

export default function GameAnalysisPage({ gameId, pgn, players }: GameAnalysisPageProps) {
  const activePgn = pgn ?? fallbackPgn;

  const replayData = useMemo(() => {
    const parser = new Chess();
    parser.loadPgn(activePgn);
    const history = parser.history();
    const replay = new Chess();
    const builtMoves: MoveItem[] = [];
    const fens: string[] = [replay.fen()];

    history.forEach((san) => {
      replay.move(san);
      builtMoves.push({ san, fen: replay.fen() });
      fens.push(replay.fen());
    });

    return { builtMoves, fens };
  }, [activePgn]);

  const [game, setGame] = useState(() => new Chess());
  const [currentFen, setCurrentFen] = useState(game.fen());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [activeTab, setActiveTab] = useState<"report" | "analysis" | "coach">("analysis");

  const jumpToIndex = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, replayData.fens.length - 1));
    const next = new Chess();

    for (let i = 0; i < safeIndex; i += 1) {
      next.move(replayData.builtMoves[i].san);
    }

    setGame(next);
    setCurrentFen(next.fen());
    setCurrentMoveIndex(safeIndex);
  };

  const handleMove = (source: string, target: string) => {
    const next = new Chess(game.fen());
    const move = next.move({ source, target, promotion: "q" });

    if (!move) return false;

    setGame(next);
    setCurrentFen(next.fen());
    setCurrentMoveIndex(next.history().length);
    return true;
  };

  const resetGame = () => {
    const fresh = new Chess();
    setGame(fresh);
    setCurrentFen(fresh.fen());
    setCurrentMoveIndex(0);
  };

  const report = {
    white: players?.white ?? "AuraPlayer",
    black: players?.black ?? "Opponent",
    accuracy: "87%",
    rating: "1820",
    inaccuracies: 3,
    mistakes: 1,
    blunders: 0,
  };

  return (
    <section className="h-[calc(100vh-4rem)] w-full overflow-hidden rounded-2xl border border-violet-500/10 bg-[#05070d] p-4 sm:p-6">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_clamp(420px,30vw,520px)]">
        <div className="flex min-h-0 items-center justify-center overflow-auto rounded-2xl border border-violet-500/15 bg-gradient-to-br from-[#0b1020] via-[#0a1224] to-[#090d17] p-4 shadow-[inset_0_1px_0_rgba(167,139,250,0.15)] sm:p-6">
          <div className="flex w-full flex-col items-center gap-3 lg:min-w-[420px]">
            <p className="mb-1 text-xs uppercase tracking-[0.14em] text-violet-300/70">
              Análise da Partida {gameId ?? "mock-game"}
            </p>
            <PlayerBar name={report.black} color="black" rating={1810} />
            <AnalysisBoard fen={currentFen} orientation={orientation} onMove={handleMove} />
            <PlayerBar name={report.white} color="white" rating={1840} />

            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setOrientation((prev) => (prev === "white" ? "black" : "white"))}
                className="rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-300/70 hover:bg-violet-400/20"
              >
                Inverter Tabuleiro
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-300/70 hover:bg-violet-400/20"
              >
                Resetar Partida
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-auto">
          <AnalysisPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            report={report}
            moves={replayData.builtMoves}
            currentMoveIndex={currentMoveIndex}
            onSelectMove={jumpToIndex}
            onFirst={() => jumpToIndex(0)}
            onPrev={() => jumpToIndex(currentMoveIndex - 1)}
            onNext={() => jumpToIndex(currentMoveIndex + 1)}
            onLast={() => jumpToIndex(replayData.builtMoves.length)}
          />
        </div>
      </div>
    </section>
  );
}
