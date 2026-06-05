import { extractMoveCountFromPgn, extractOpeningFromPgn } from "../services/chessComApi.js";

const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

function getNormalizedUsername(username = "") {
  return String(username || "").trim().toLowerCase();
}

export function getGameAnalysisId(game) {
  return String(game?.uuid || game?.url || "").trim();
}

function buildGameIdSet(gameIds = []) {
  return new Set((gameIds || []).map((id) => String(id || "").trim()).filter(Boolean));
}

function getPlayerColor(game, username) {
  const normalizedUsername = getNormalizedUsername(username);
  const whiteUsername = getNormalizedUsername(game?.white?.username);
  const blackUsername = getNormalizedUsername(game?.black?.username);

  if (whiteUsername && whiteUsername === normalizedUsername) return "white";
  if (blackUsername && blackUsername === normalizedUsername) return "black";
  return null;
}

function getPlayerAndOpponent(game, username) {
  const color = getPlayerColor(game, username);

  if (color === "white") {
    return {
      color,
      player: game?.white || {},
      opponent: game?.black || {},
    };
  }

  if (color === "black") {
    return {
      color,
      player: game?.black || {},
      opponent: game?.white || {},
    };
  }

  return {
    color: null,
    player: {},
    opponent: {},
  };
}

function getResultTypeForPlayer(game, username) {
  const { player, opponent } = getPlayerAndOpponent(game, username);
  const playerResult = String(player?.result || "").toLowerCase();
  const opponentResult = String(opponent?.result || "").toLowerCase();

  if (playerResult === "win") return "win";
  if (DRAW_RESULTS.has(playerResult) || DRAW_RESULTS.has(opponentResult)) return "draw";
  return "loss";
}

function extractPgnHeader(pgn = "", header) {
  const match = String(pgn || "").match(new RegExp(`\\[${header} "([^"]+)"\\]`));
  return match?.[1] || "";
}

function extractEcoFromPgn(pgn = "") {
  return extractPgnHeader(pgn, "ECO");
}

function formatBackendDateFromTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function resolveGameDate(game) {
  const pgn = game?.pgn || "";

  return (
    extractPgnHeader(pgn, "UTCDate") ||
    extractPgnHeader(pgn, "Date") ||
    formatBackendDateFromTimestamp(game?.end_time)
  );
}

function matchesDateRange(timestamp, dateRange) {
  if (!dateRange || dateRange.type === "all_available" || !timestamp) return true;

  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return false;

  if (dateRange.type === "custom") {
    const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
    const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;

    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  }

  const daysByType = {
    last_7_days: 7,
    last_30_days: 30,
    last_90_days: 90,
  };
  const days = daysByType[dateRange.type];
  if (!days) return true;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

function normalizeTimeClass(game) {
  return String(game?.time_class || "").trim().toLowerCase();
}

function getColorLabel(color) {
  if (color === "white") return "White";
  if (color === "black") return "Black";
  return "Unknown";
}

function buildEstimatedLabel(totalSeconds) {
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

  if (totalMinutes < 60) {
    return `About ${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `About ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `About ${hours}h ${minutes}m`;
}

function buildBreakdownMap(items, getKey, getLabel) {
  const counts = new Map();

  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()].map(([key, count]) => ({
    label: getLabel(key),
    count,
  }));
}

export function filterGamesForGeneralAnalysis(
  games = [],
  connectedUsername = "",
  filters = {},
  excludedGameIds = []
) {
  const normalizedUsername = getNormalizedUsername(connectedUsername);
  const excludedGameIdSet = buildGameIdSet(excludedGameIds);

  if (!normalizedUsername) return [];

  const filtered = games.filter((game) => {
    const gameId = getGameAnalysisId(game);

    if (gameId && excludedGameIdSet.has(gameId)) return false;

    const color = getPlayerColor(game, normalizedUsername);
    if (!color) return false;

    const resultType = getResultTypeForPlayer(game, normalizedUsername);
    const moveCount = Number(extractMoveCountFromPgn(game?.pgn || "")) || 0;
    const timeClass = normalizeTimeClass(game);

    if (Array.isArray(filters.timeControls) && filters.timeControls.length > 0) {
      if (!filters.timeControls.includes(timeClass)) return false;
    }

    if (!matchesDateRange(game?.end_time, filters.dateRange)) {
      return false;
    }

    if (Array.isArray(filters.resultTypes) && filters.resultTypes.length > 0) {
      if (!filters.resultTypes.includes(resultType)) return false;
    }

    if (filters.color && filters.color !== "both" && filters.color !== color) {
      return false;
    }

    if (filters.ratedOnly && game?.rated !== true) {
      return false;
    }

    if (filters.excludeVeryShortGames && moveCount < (Number(filters.minimumMoves) || 20)) {
      return false;
    }

    if (!filters.excludeVeryShortGames && Number(filters.minimumMoves) > 0) {
      if (moveCount < Number(filters.minimumMoves)) return false;
    }

    return true;
  });

  return filtered
    .sort((a, b) => Number(b?.end_time || 0) - Number(a?.end_time || 0))
    .slice(0, Number(filters.maxGames) || filtered.length);
}

export function buildSelectionPreview({
  games = [],
  connectedUsername = "",
  filters = {},
  excludedGameIds = [],
  isEstimated = false,
  note = "",
}) {
  const selectedGames = filterGamesForGeneralAnalysis(
    games,
    connectedUsername,
    filters,
    excludedGameIds
  );
  const matchingGamesBeforeExclusions = filterGamesForGeneralAnalysis(
    games,
    connectedUsername,
    filters,
    []
  );
  const excludedGameIdSet = buildGameIdSet(excludedGameIds);
  const excludedMatchingGamesCount = matchingGamesBeforeExclusions.filter((game) => {
    const gameId = getGameAnalysisId(game);
    return gameId && excludedGameIdSet.has(gameId);
  }).length;
  const selectedGamesCount =
    selectedGames.length > 0
      ? selectedGames.length
      : isEstimated
        ? Math.max(1, Number(filters.maxGames) || 50)
        : 0;
  const estimatedSeconds = selectedGamesCount * 30;

  return {
    selectedGamesCount,
    secondsPerGame: 30,
    estimatedSeconds,
    estimatedLabel: buildEstimatedLabel(estimatedSeconds),
    timeControlBreakdown: selectedGames.length
      ? buildBreakdownMap(
          selectedGames,
          (game) => normalizeTimeClass(game),
          (key) => String(key || "unknown").replace(/^./, (char) => char.toUpperCase())
        )
      : [],
    resultBreakdown: selectedGames.length
      ? buildBreakdownMap(
          selectedGames,
          (game) => getResultTypeForPlayer(game, connectedUsername),
          (key) =>
            key === "win" ? "Wins" : key === "loss" ? "Losses" : key === "draw" ? "Draws" : "Unknown"
        )
      : [],
    colorBreakdown: selectedGames.length
      ? buildBreakdownMap(
          selectedGames,
          (game) => getPlayerColor(game, connectedUsername),
          (key) => getColorLabel(key)
        )
      : [],
    selectedGames,
    excludedAlreadyAnalyzedGamesCount: excludedMatchingGamesCount,
    isEstimated,
    note,
  };
}

export function buildAnalysisBatchGamesInput(selectedGames = [], connectedUsername = "") {
  return selectedGames
    .map((game) => {
      const pgn = game?.pgn || "";
      const playerTarget = getPlayerColor(game, connectedUsername);

      if (!pgn || !playerTarget) {
        return null;
      }

      return {
        id: getGameAnalysisId(game) || undefined,
        pgn,
        playerTarget,
        metadata: {
          white: game?.white?.username || "White",
          black: game?.black?.username || "Black",
          result: extractPgnHeader(pgn, "Result") || "*",
          site: game?.url || "Chess.com",
          date: resolveGameDate(game),
          event: extractPgnHeader(pgn, "Event") || undefined,
          opening: extractOpeningFromPgn(pgn) || undefined,
          eco: extractEcoFromPgn(pgn) || undefined,
          timeControl: normalizeTimeClass(game) || undefined,
        },
      };
    })
    .filter(Boolean);
}
