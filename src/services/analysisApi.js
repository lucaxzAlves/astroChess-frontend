import {
  emptyReviewClassificationSummary,
  normalizeClassification,
} from "../utils/reviewClassification";
import { API_URL } from "../config/api";
import { getUserFriendlyError } from "../utils/userFriendlyErrors";

function extractPgnResult(pgn = "") {
  return pgn.match(/\[Result "([^"]+)"\]/)?.[1] || "*";
}

function formatGameDate(date) {
  if (!date) return "????.??.??";
  return String(date);
}

function normalizeSummary(summary = {}) {
  const next = { ...emptyReviewClassificationSummary };

  Object.entries(summary || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeClassification(key);
    if (!normalizedKey) return;
    next[normalizedKey] = Number(value) || 0;
  });

  return next;
}

function normalizeMoveItem(item = {}) {
  return {
    ...item,
    classification: normalizeClassification(item.classification) || "good",
  };
}

function sortByPly(items = []) {
  return [...items].sort((a, b) => (a?.ply || 0) - (b?.ply || 0));
}

function buildRequestBody({ game, includeAiReview = true }) {
  const pgn = game?.pgn || "";
  const playerTarget = game?.playerTarget === "black" ? "black" : "white";

  return {
    games: [
      {
        id: game?.id || game?.url || "game-1",
        pgn,
        playerTarget,
        metadata: {
          white: game?.white?.username || game?.whitePlayer || "White",
          black: game?.black?.username || game?.blackPlayer || "Black",
          result: game?.result || extractPgnResult(pgn) || "*",
          site: game?.url || "Chess.com",
          date: formatGameDate(game?.date),
        },
      },
    ],
    options: {
      includeAiReview,
    },
  };
}

export async function analyzePgnGame({ game, includeAiReview = true }) {
  let response;
  try {
    response = await fetch(`${API_URL}/analysis/pgn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildRequestBody({ game, includeAiReview })),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor para analisar essa partida.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      "Não foi possível analisar essa partida agora.";

    throw new Error(getUserFriendlyError(message, "Não foi possível analisar essa partida agora."));
  }

  return payload;
}

export function normalizeGameAnalysisResponse(response, selectedGame) {
  const analyzedGame = response?.results?.[0];

  if (!analyzedGame) {
    throw new Error("The analysis response did not include any reviewed game.");
  }

  const whiteSummary = normalizeSummary(analyzedGame.moveClassificationSummary?.white);
  const blackSummary = normalizeSummary(analyzedGame.moveClassificationSummary?.black);
  const moveClassifications = sortByPly(
    (analyzedGame.moveClassifications || []).map(normalizeMoveItem)
  );
  const analyzedMoves = sortByPly((analyzedGame.analyzedMoves || []).map(normalizeMoveItem));
  const structuredSummary =
    analyzedGame.aiReview?.structuredSummary &&
    typeof analyzedGame.aiReview.structuredSummary === "object"
      ? analyzedGame.aiReview.structuredSummary
      : analyzedGame.structuredSummary && typeof analyzedGame.structuredSummary === "object"
        ? analyzedGame.structuredSummary
        : null;
  const aiReview = analyzedGame.aiReview
    ? {
        success: analyzedGame.aiReview.success !== false,
        error: analyzedGame.aiReview.error || null,
        reviewText:
          typeof analyzedGame.aiReview.reviewText === "string"
            ? analyzedGame.aiReview.reviewText
            : "",
        structuredSummary,
      }
    : null;

  return {
    accuracy: {
      white: analyzedGame.accuracy?.white ?? null,
      black: analyzedGame.accuracy?.black ?? null,
    },
    reviewSummary: {
      white: {
        username: selectedGame?.white?.username || selectedGame?.whitePlayer || "White",
        avatar: selectedGame?.white?.avatar || selectedGame?.whiteAvatar || "",
        accuracy: analyzedGame.accuracy?.white ?? null,
        classifications: whiteSummary,
      },
      black: {
        username: selectedGame?.black?.username || selectedGame?.blackPlayer || "Black",
        avatar: selectedGame?.black?.avatar || selectedGame?.blackAvatar || "",
        accuracy: analyzedGame.accuracy?.black ?? null,
        classifications: blackSummary,
      },
    },
    moveClassifications,
    analyzedMoves,
    criticalMoments: analyzedGame.criticalMoments || [],
    annotatedPgn: analyzedGame.annotatedPgn || selectedGame?.pgn || "",
    analysisDepth: response?.analysisDepth ?? null,
    aiReview,
  };
}
