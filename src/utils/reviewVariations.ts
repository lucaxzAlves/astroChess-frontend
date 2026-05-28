import { Chess } from "chess.js";
import { getClassificationMeta, normalizeClassification } from "./reviewClassification";

type VariationSource = {
  ply?: number;
  moveNumber?: number;
  color?: string;
  san?: string;
  playedMove?: string;
  bestMove?: string;
  classification?: string;
  pv?: string[];
  comment?: string;
  fenBefore?: string;
  fenAfter?: string;
};

type MainlineMove = {
  ply?: number;
  moveNumber?: number;
  color?: string;
  san?: string;
  fenAfter?: string;
  fenBefore?: string;
};

export type BuiltVariation = {
  id: string;
  sourcePly: number;
  moveNumber: number;
  color: "white" | "black";
  startFen: string;
  originEval: number | string | null;
  bestMove: string;
  pv: string[];
  positions: Array<{
    ply: number;
    san?: string;
    fen: string;
    toSquare?: string;
  }>;
  comment: string;
  classification?: string;
  label: string;
};

function getFallbackFenBefore(source: VariationSource, mainlineMoves: MainlineMove[]) {
  if (source.fenBefore) return source.fenBefore;
  if (!source.ply) return "";

  const fallbackMove = mainlineMoves.find((move) => move.ply === source.ply);
  return fallbackMove?.fenBefore || "";
}

export function getVariationSources(
  analyzedMoves: MainlineMove[] = [],
  criticalMoments: VariationSource[] = []
) {
  const merged = [...criticalMoments, ...analyzedMoves];
  const byPly = new Map<number, VariationSource>();

  merged.forEach((item) => {
    const ply = Number(item?.ply || 0);
    const pv = Array.isArray(item?.pv) ? item.pv.filter(Boolean) : [];
    if (!ply || pv.length === 0) return;
    if (!byPly.has(ply)) {
      byPly.set(ply, item);
    }
  });

  return [...byPly.values()].sort((a, b) => Number(a.ply || 0) - Number(b.ply || 0));
}

export function applySanMovesToFen(startFen: string, pv: string[] = []) {
  if (!startFen) return [{ ply: 0, fen: "" }];

  const chess = new Chess(startFen);
  const positions = [{ ply: 0, fen: startFen }];

  pv.forEach((san, index) => {
    try {
      const move = chess.move(san);
      if (!move) return;
      positions.push({
        ply: index + 1,
        san: move.san,
        fen: chess.fen(),
        toSquare: move.to,
      });
    } catch {
      // Ignore invalid pv continuation and keep partial variation.
    }
  });

  return positions;
}

export function buildVariationFromPv(
  source: VariationSource,
  analyzedMoves: MainlineMove[] = []
): BuiltVariation | null {
  const pv = Array.isArray(source.pv) ? source.pv.filter(Boolean) : [];
  const sourcePly = Number(source.ply || 0);
  const moveNumber = Number(source.moveNumber || 0);
  const color = source.color === "black" ? "black" : "white";
  const startFen = getFallbackFenBefore(source, analyzedMoves);

  if (!sourcePly || !moveNumber || !startFen || pv.length === 0) {
    return null;
  }

  const positions = applySanMovesToFen(startFen, pv);
  if (positions.length <= 1) {
    return null;
  }

  const classification = normalizeClassification(source.classification || "") || undefined;
  const meta = classification ? getClassificationMeta(classification) : null;
  const label = meta ? `${meta.label} line` : "Suggested line";

  return {
    id: `variation-${sourcePly}-${moveNumber}-${color}`,
    sourcePly,
    moveNumber,
    color,
    startFen,
    originEval: (source as { evalBefore?: number | string | null }).evalBefore ?? null,
    bestMove: source.bestMove || pv[0] || "",
    pv,
    positions,
    comment: source.comment || "",
    classification,
    label,
  };
}

export function groupMovesWithVariations(
  moveRows: Array<{
    moveNumber: number;
    white?: { san: string; classification?: string };
    black?: { san: string; classification?: string };
  }>,
  variationSources: VariationSource[] = []
) {
  return moveRows.map((row, rowIndex) => {
    const whitePly = rowIndex * 2 + 1;
    const blackPly = whitePly + 1;

    return {
      ...row,
      whiteVariation: variationSources.find((source) => Number(source.ply || 0) === whitePly) || null,
      blackVariation: variationSources.find((source) => Number(source.ply || 0) === blackPly) || null,
    };
  });
}
