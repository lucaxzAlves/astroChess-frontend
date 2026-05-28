type ReviewedMove = {
  ply?: number;
  moveNumber?: number;
  color?: string;
  san?: string;
};

export function normalizeMoveRefInput(moveRef: unknown) {
  if (typeof moveRef === "string") {
    return moveRef.trim();
  }

  if (typeof moveRef === "number") {
    return String(moveRef);
  }

  if (moveRef && typeof moveRef === "object") {
    const value = moveRef as Record<string, unknown>;
    const moveNumber = value.moveNumber ?? value.move ?? value.ply;
    const playedMove = value.playedMove ?? value.san ?? value.moveSan ?? value.move;
    const side = value.side ?? value.color ?? value.sideThatErred;

    if (moveNumber && playedMove) {
      const separator = side === "black" ? "..." : ".";
      return `${String(moveNumber)}${separator} ${String(playedMove).trim()}`.trim();
    }

    if (playedMove) {
      return String(playedMove).trim();
    }

    if (moveNumber) {
      return String(moveNumber).trim();
    }
  }

  return "";
}

function normalizeSanValue(value = "") {
  return value
    .replace(/(\+\+|#|\+)+/g, "")
    .replace(/(\?\?|\?!|!\?|!!|!|\?)+$/g, "")
    .trim();
}

function parseMoveReference(moveRef: unknown) {
  const trimmed = normalizeMoveRefInput(moveRef);
  const match = trimmed.match(/^(\d+)(\.\.\.|\.)\s*([A-Za-z0-9+#=xO\-]+)(?:[!?]{1,2})?$/);

  if (!match) return null;

  const moveNumber = Number(match[1]);
  const color = match[2] === "..." ? "black" : "white";
  const san = normalizeSanValue(match[3] || "");

  if (!moveNumber || !san) return null;

  return { moveNumber, color, san };
}

export function formatMoveReference(move: {
  moveNumber?: number | null;
  color?: string | null;
  san?: string | null;
}) {
  if (!move.moveNumber || !move.san) return "";
  return `${move.moveNumber}${move.color === "black" ? "..." : "."} ${move.san}`;
}

export function findMovePlyByReference(moveRef: unknown, analyzedMoves: ReviewedMove[] = []) {
  const ref = normalizeMoveRefInput(moveRef);

  if (!ref || !Array.isArray(analyzedMoves) || analyzedMoves.length === 0) {
    return null;
  }

  if (/^\d+$/.test(ref)) {
    const moveNumber = Number(ref);
    const fallback = analyzedMoves.find((move) => move.moveNumber === moveNumber);
    return fallback?.ply || null;
  }

  const parsed = parseMoveReference(moveRef);
  if (!parsed) return null;

  const exact = analyzedMoves.find(
    (move) =>
      move.moveNumber === parsed.moveNumber &&
      move.color === parsed.color &&
      normalizeSanValue(move.san || "") === parsed.san
  );

  if (exact?.ply) {
    return exact.ply;
  }

  const fallback = analyzedMoves.find(
    (move) => move.moveNumber === parsed.moveNumber && move.color === parsed.color
  );

  return fallback?.ply || null;
}

export function findMovePlyByPartialReference({
  moveNumber,
  san,
  color,
  analyzedMoves = [],
}: {
  moveNumber?: number | null;
  san?: string | null;
  color?: string | null;
  analyzedMoves?: ReviewedMove[];
}) {
  if (!moveNumber || !Array.isArray(analyzedMoves) || analyzedMoves.length === 0) return null;

  if (san) {
    const ref = `${moveNumber}${color === "black" ? "..." : "."} ${san}`;
    const ply = findMovePlyByReference(ref, analyzedMoves);
    if (ply) return ply;
  }

  const sameColor = color
    ? analyzedMoves.find((move) => move.moveNumber === moveNumber && move.color === color)
    : null;

  if (sameColor?.ply) return sameColor.ply;

  const fallback = analyzedMoves.find((move) => move.moveNumber === moveNumber);
  return fallback?.ply || null;
}

export function splitTextByMoveReferences(text = "") {
  const pattern = /(\b\d+\.(?:\.\.)?\s*[A-Za-z0-9+#=xO\-]+[!?]{0,2})/g;
  const parts = text.split(pattern);

  return parts.filter((part) => part !== "");
}
