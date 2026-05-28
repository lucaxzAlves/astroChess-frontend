const CHESS_COM_BASE_URL = "https://api.chess.com/pub/player";

async function requestJson(url, errorMessage) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function formatUnixDate(timestamp) {
  if (!timestamp) return "N/A";

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp * 1000));
}

export function getCountryCode(countryUrl) {
  if (!countryUrl) return "N/A";

  return countryUrl.split("/").filter(Boolean).pop()?.toUpperCase() || "N/A";
}

export function getCountryDisplay(countryUrl) {
  const countryCode = getCountryCode(countryUrl);

  if (countryCode === "N/A") return countryCode;

  return countryCode;
}

export function getPlayerProfile(username) {
  return requestJson(
    `${CHESS_COM_BASE_URL}/${encodeURIComponent(username.toLowerCase())}`,
    "Não foi possível encontrar este usuário do Chess.com."
  );
}

export function getPlayerStats(username) {
  return requestJson(
    `${CHESS_COM_BASE_URL}/${encodeURIComponent(username.toLowerCase())}/stats`,
    "Não foi possível carregar as estatísticas do Chess.com."
  );
}

export function getPlayerArchives(username) {
  return requestJson(
    `${CHESS_COM_BASE_URL}/${encodeURIComponent(username.toLowerCase())}/games/archives`,
    "Não foi possível carregar as partidas agora."
  );
}

export function getArchiveGames(archiveUrl) {
  return requestJson(archiveUrl, "Não foi possível carregar as partidas agora.");
}

export async function getPlayerGames(username, options = {}) {
  const { archivesToFetch = 2, limit = 30 } = options;
  const archivesData = await getPlayerArchives(username);
  const archiveUrls = [...(archivesData.archives || [])].slice(-archivesToFetch).reverse();
  const archiveResponses = await Promise.all(
    archiveUrls.map((archiveUrl) => getArchiveGames(archiveUrl))
  );

  return archiveResponses
    .flatMap((archive) => archive.games || [])
    .sort((a, b) => (b.end_time || 0) - (a.end_time || 0))
    .slice(0, limit);
}

function getRating(stats, key) {
  const section = stats?.[key];

  return {
    current: section?.last?.rating ?? "N/A",
    best: section?.best?.rating ?? "N/A",
    record: section?.record ?? {},
  };
}

export function parseChessComStats(stats) {
  const bullet = getRating(stats, "chess_bullet");
  const blitz = getRating(stats, "chess_blitz");
  const rapid = getRating(stats, "chess_rapid");
  const daily = getRating(stats, "chess_daily");
  const records = [bullet.record, blitz.record, rapid.record, daily.record];

  const totals = records.reduce(
    (acc, record) => ({
      wins: acc.wins + (record.win || 0),
      losses: acc.losses + (record.loss || 0),
      draws: acc.draws + (record.draw || 0),
    }),
    { wins: 0, losses: 0, draws: 0 }
  );

  const totalGames = totals.wins + totals.losses + totals.draws;

  return {
    ratings: {
      bullet,
      blitz,
      rapid,
      daily,
    },
    totals: {
      ...totals,
      totalGames,
      winRate: totalGames ? `${Math.round((totals.wins / totalGames) * 100)}%` : "N/A",
    },
  };
}

export function extractOpeningFromPgn(pgn = "") {
  const ecoUrl = pgn.match(/\[ECOUrl "([^"]+)"\]/)?.[1];
  const openingFromUrl = ecoUrl?.split("/openings/")?.[1]?.replaceAll("-", " ");
  const eco = pgn.match(/\[Opening "([^"]+)"\]/)?.[1];

  return eco || openingFromUrl || "N/A";
}

export function extractMoveCountFromPgn(pgn = "") {
  const moveNumbers = [...pgn.matchAll(/(?:^|\s)(\d+)\.(?:\.\.)?/g)].map((match) =>
    Number(match[1])
  );

  return moveNumbers.length ? Math.max(...moveNumbers) : "N/A";
}

function normalizeResult(playerResult, opponentResult) {
  if (playerResult === "win") return "Win";

  const drawResults = new Set([
    "agreed",
    "repetition",
    "stalemate",
    "insufficient",
    "50move",
    "timevsinsufficient",
  ]);

  if (drawResults.has(playerResult) || drawResults.has(opponentResult)) {
    return "Draw";
  }

  return "Loss";
}

function formatTimeControl(game) {
  const timeClass = game.time_class
    ? game.time_class.charAt(0).toUpperCase() + game.time_class.slice(1)
    : "N/A";

  return game.time_control ? `${timeClass} ${game.time_control}` : timeClass;
}

export function parseChessComGame(game, username) {
  const normalizedUsername = username.toLowerCase();
  const whiteUsername = game.white?.username || "";
  const blackUsername = game.black?.username || "";
  const isWhite = whiteUsername.toLowerCase() === normalizedUsername;
  const player = isWhite ? game.white : game.black;
  const opponent = isWhite ? game.black : game.white;
  const accuracy = isWhite ? game.accuracies?.white : game.accuracies?.black;

  return {
    id: game.uuid || game.url,
    color: isWhite ? "White" : "Black",
    opponent: opponent?.username || "N/A",
    result: normalizeResult(player?.result, opponent?.result),
    rawResult: player?.result || "N/A",
    timeControl: formatTimeControl(game),
    timeClass: game.time_class
      ? game.time_class.charAt(0).toUpperCase() + game.time_class.slice(1)
      : "N/A",
    rated: game.rated ? "Rated" : "Unrated",
    opening: extractOpeningFromPgn(game.pgn),
    accuracy: typeof accuracy === "number" ? accuracy : null,
    date: formatUnixDate(game.end_time),
    timestamp: game.end_time || 0,
    moves: extractMoveCountFromPgn(game.pgn),
    url: game.url,
    pgn: game.pgn || "",
    whitePlayer: game.white?.username || "White",
    blackPlayer: game.black?.username || "Black",
    whiteRating: game.white?.rating ?? "N/A",
    blackRating: game.black?.rating ?? "N/A",
    whiteAccuracy:
      typeof game.accuracies?.white === "number" ? game.accuracies.white : null,
    blackAccuracy:
      typeof game.accuracies?.black === "number" ? game.accuracies.black : null,
    whiteResult: game.white?.result || "N/A",
    blackResult: game.black?.result || "N/A",
    whiteAvatar: null,
    blackAvatar: null,
  };
}
