import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import {
  extractMoveCountFromPgn,
  extractOpeningFromPgn,
  parseChessComGame,
} from "../services/chessComApi.js";

const IMPORTED_GAMES_STORAGE_KEY = "astrochess_imported_games";

const insights = [
  { key: "games.insight.history" },
  { key: "games.insight.review" },
  { key: "games.insight.openings" },
];

const timeControls = ["All", "Bullet", "Blitz", "Rapid", "Daily"];
const results = ["All", "Wins", "Losses", "Draws"];
const dateRanges = ["Last 7 days", "Last 30 days", "All time"];

function extractPgnHeader(pgn = "", header) {
  return String(pgn || "").match(new RegExp(`\\[${header} "([^"]*)"\\]`))?.[1] || "";
}

function splitPgnGames(rawText = "") {
  const cleaned = String(rawText || "").trim();
  if (!cleaned) return [];

  const eventMatches = [...cleaned.matchAll(/(?:^|\n)\s*\[Event\s+"/g)];
  if (eventMatches.length <= 1) return [cleaned];

  return eventMatches
    .map((match, index) => {
      const start = match.index || 0;
      const end = eventMatches[index + 1]?.index ?? cleaned.length;
      return cleaned.slice(start, end).trim();
    })
    .filter(Boolean);
}

function normalizePgnDate(dateText = "") {
  const normalized = String(dateText || "").replace(/\?/g, "").trim();
  if (!normalized) return "N/A";

  const [year, month, day] = normalized.split(".");
  if (year && month && day) {
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  }

  return dateText;
}

function resultFromPgn(result = "*") {
  if (result === "1-0") return "White win";
  if (result === "0-1") return "Black win";
  if (result === "1/2-1/2") return "Draw";
  return "Imported";
}

function buildImportedGameFromPgn(pgn, index = 0) {
  const chess = new Chess();
  chess.loadPgn(pgn);

  const headers = {
    event: extractPgnHeader(pgn, "Event"),
    site: extractPgnHeader(pgn, "Site"),
    date: extractPgnHeader(pgn, "Date") || extractPgnHeader(pgn, "UTCDate"),
    white: extractPgnHeader(pgn, "White") || "White",
    black: extractPgnHeader(pgn, "Black") || "Black",
    result: extractPgnHeader(pgn, "Result") || "*",
    eco: extractPgnHeader(pgn, "ECO"),
    opening: extractOpeningFromPgn(pgn),
    timeControl: extractPgnHeader(pgn, "TimeControl"),
  };
  const importedAt = new Date().toISOString();
  const idSeed = `${headers.white}-${headers.black}-${headers.date}-${headers.result}-${index}-${importedAt}`;

  return {
    id: `pgn-import-${btoa(unescape(encodeURIComponent(idSeed))).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}`,
    source: "PGN_IMPORT",
    color: "Imported",
    opponent: `${headers.white} vs ${headers.black}`,
    result: resultFromPgn(headers.result),
    rawResult: headers.result,
    timeControl: headers.timeControl || "PGN",
    timeClass: "Imported",
    rated: "Imported",
    opening: headers.opening || "N/A",
    date: normalizePgnDate(headers.date),
    timestamp: Math.floor(Date.now() / 1000),
    moves: extractMoveCountFromPgn(pgn),
    url: headers.site || "",
    pgn,
    whitePlayer: headers.white,
    blackPlayer: headers.black,
    whiteRating: extractPgnHeader(pgn, "WhiteElo") || "N/A",
    blackRating: extractPgnHeader(pgn, "BlackElo") || "N/A",
    whiteAccuracy: null,
    blackAccuracy: null,
    whiteResult: headers.result === "1-0" ? "win" : headers.result === "0-1" ? "loss" : headers.result,
    blackResult: headers.result === "0-1" ? "win" : headers.result === "1-0" ? "loss" : headers.result,
    whiteAvatar: null,
    blackAvatar: null,
    event: headers.event,
    site: headers.site,
    eco: headers.eco,
    importedAt,
  };
}

function parsePgnImport(rawText = "") {
  const chunks = splitPgnGames(rawText);
  if (!chunks.length) {
    throw new Error("Cole ou envie um PGN antes de importar.");
  }

  const importedGames = [];
  const errors = [];

  chunks.forEach((chunk, index) => {
    try {
      importedGames.push(buildImportedGameFromPgn(chunk, index));
    } catch {
      errors.push(index + 1);
    }
  });

  if (!importedGames.length) {
    throw new Error("Não foi possível reconhecer uma partida válida nesse PGN.");
  }

  return { importedGames, errors };
}

function loadImportedGamesFromStorage() {
  try {
    const storedGames = JSON.parse(localStorage.getItem(IMPORTED_GAMES_STORAGE_KEY) || "[]");
    return Array.isArray(storedGames) ? storedGames : [];
  } catch {
    return [];
  }
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`astro-card transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

function SelectFilter({ label, value, onChange, options, getOptionLabel }) {
  return (
    <label className="grid gap-2 text-sm text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-slate-200 outline-none transition duration-200 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
      >
        {options.map((option) => (
          <option key={option}>{getOptionLabel ? getOptionLabel(option) : option}</option>
        ))}
      </select>
    </label>
  );
}

function ResultBadge({ result }) {
  const { t } = useLanguage();
  const styles = {
    Win: "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100 before:bg-emerald-300",
    Loss: "border-rose-300/25 bg-rose-300/[0.08] text-rose-100 before:bg-rose-300",
    Draw: "border-slate-300/20 bg-slate-300/[0.07] text-slate-200 before:bg-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium before:h-1.5 before:w-1.5 before:rounded-full ${
        styles[result] || styles.Draw
      }`}
    >
      {t(`games.${String(result).toLowerCase()}`, result)}
    </span>
  );
}

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    purple: "border-purple-300/25 bg-purple-300/[0.08] text-purple-100 before:bg-purple-300",
    cyan: "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100 before:bg-cyan-300",
    slate: "border-slate-300/20 bg-slate-300/[0.07] text-slate-200 before:bg-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium before:h-1.5 before:w-1.5 before:rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function SourceBadge({ source }) {
  const isImported = source === "PGN_IMPORT";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium before:h-1.5 before:w-1.5 before:rounded-full",
        isImported
          ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100 before:bg-cyan-300"
          : "border-purple-300/25 bg-purple-300/[0.08] text-purple-100 before:bg-purple-300",
      ].join(" ")}
    >
      {isImported ? "Imported" : "Chess.com"}
    </span>
  );
}

function PgnImportCard({ onImportGames }) {
  const [activeTab, setActiveTab] = useState("paste");
  const [pgnText, setPgnText] = useState("");
  const [previewGames, setPreviewGames] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const parseAndPreview = (text, successMessage = "") => {
    setError("");
    setNotice("");

    try {
      const { importedGames, errors } = parsePgnImport(text);
      setPreviewGames(importedGames);
      setSelectedIds(importedGames.map((game) => game.id));
      setNotice(
        successMessage ||
          `${importedGames.length} partida${importedGames.length === 1 ? "" : "s"} detectada${
            importedGames.length === 1 ? "" : "s"
          }.${errors.length ? ` ${errors.length} bloco(s) inválido(s) foram ignorados.` : ""}`
      );
    } catch (parseError) {
      setPreviewGames([]);
      setSelectedIds([]);
      setError(parseError instanceof Error ? parseError.message : "PGN inválido.");
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pgn")) {
      setError("Formato não suportado. Envie um arquivo .pgn.");
      return;
    }

    try {
      const text = await file.text();
      setPgnText(text);
      parseAndPreview(text, `Arquivo ${file.name} carregado.`);
      setActiveTab("upload");
    } catch {
      setError("Não foi possível ler esse arquivo PGN.");
    }
  };

  const importSelected = () => {
    const selectedGames = previewGames.filter((game) => selectedIds.includes(game.id));
    if (!selectedGames.length) {
      setError("Selecione pelo menos uma partida para importar.");
      return;
    }

    onImportGames(selectedGames);
    setNotice(`${selectedGames.length} partida${selectedGames.length === 1 ? "" : "s"} importada${selectedGames.length === 1 ? "" : "s"}.`);
    setPreviewGames([]);
    setSelectedIds([]);
    setPgnText("");
  };

  const toggleSelected = (gameId) => {
    setSelectedIds((current) =>
      current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [...current, gameId]
    );
  };

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-medium text-cyan-200">Import Your Own Games</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Importar partidas por PGN</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Analise partidas do Lichess, torneios, aulas, bases pessoais ou qualquer fonte que exporte PGN.
          </p>
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-slate-950/55 p-1">
          {[
            ["paste", "Paste PGN"],
            ["upload", "Upload PGN File"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                activeTab === id
                  ? "bg-purple-300/[0.14] text-purple-50 shadow-[0_0_18px_rgba(168,85,247,0.12)]"
                  : "text-slate-400 hover:text-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {activeTab === "paste" ? (
          <div className="grid gap-3">
            <textarea
              value={pgnText}
              onChange={(event) => setPgnText(event.target.value)}
              placeholder={'Paste a PGN here...\n\n[Event "..."]\n[White "..."]\n[Black "..."]\n\n1. e4 e5 2. Nf3 Nc6 ...'}
              className="min-h-56 resize-y rounded-2xl border border-white/10 bg-slate-950/75 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-purple-300/45 focus:ring-4 focus:ring-purple-500/10"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => parseAndPreview(pgnText)}
                className="rounded-xl border border-purple-300/35 bg-purple-300/[0.12] px-4 py-2.5 text-sm font-semibold text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-300/[0.18]"
              >
                Import Game
              </button>
              <button
                type="button"
                onClick={() => {
                  setPgnText("");
                  setPreviewGames([]);
                  setSelectedIds([]);
                  setError("");
                  setNotice("");
                }}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className={[
              "grid min-h-48 place-items-center rounded-2xl border border-dashed p-6 text-center transition",
              isDragging
                ? "border-cyan-200/55 bg-cyan-300/[0.08]"
                : "border-white/15 bg-slate-950/55 hover:border-purple-300/35",
            ].join(" ")}
          >
            <div>
              <p className="text-lg font-semibold text-white">Solte um arquivo .pgn aqui</p>
              <p className="mt-2 text-sm text-slate-400">Também é possível importar arquivos com várias partidas.</p>
              <label className="mt-5 inline-flex cursor-pointer rounded-xl border border-cyan-300/30 bg-cyan-300/[0.09] px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.14]">
                Escolher arquivo PGN
                <input
                  type="file"
                  accept=".pgn,application/x-chess-pgn,text/plain"
                  className="sr-only"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-3 text-sm text-cyan-100">
          {notice}
        </div>
      ) : null}

      {previewGames.length ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-white">Imported Games Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {previewGames.length} partida{previewGames.length === 1 ? "" : "s"} detectada{previewGames.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(previewGames.map((game) => game.id))}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Selecionar todas
              </button>
              <button
                type="button"
                onClick={importSelected}
                className="rounded-lg border border-purple-300/35 bg-purple-300/[0.12] px-3 py-2 text-xs font-semibold text-purple-100 hover:bg-purple-300/[0.18]"
              >
                Importar selecionadas
              </button>
            </div>
          </div>

          <div className="mt-4 grid max-h-72 gap-3 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.45)_rgba(15,23,42,0.55)]">
            {previewGames.map((game) => (
              <label
                key={game.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-purple-300/25"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(game.id)}
                  onChange={() => toggleSelected(game.id)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-purple-400"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-white">{game.whitePlayer} vs {game.blackPlayer}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {game.date} · {game.opening || "Abertura desconhecida"} · {game.rawResult}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function getRatedTone(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("unrated") || normalized.includes("não")) return "slate";
  if (normalized.includes("rated") || normalized.includes("avaliada")) return "cyan";
  return "slate";
}

function getFilteredGameStats(games, t) {
  const wins = games.filter((game) => game.result === "Win").length;
  const total = games.length;
  const gamesWithAccuracy = games.filter((game) => typeof game.accuracy === "number");
  const averageAccuracy = gamesWithAccuracy.length
    ? `${Math.round(
        gamesWithAccuracy.reduce((sum, game) => sum + game.accuracy, 0) /
          gamesWithAccuracy.length
      )}%`
    : "N/A";
  const mostPlayed = Object.entries(
    games.reduce((acc, game) => {
      acc[game.timeClass] = (acc[game.timeClass] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])?.[0]?.[0];

  return [
    { label: t("games.filteredGames"), value: total },
    { label: t("home.winRate"), value: total ? `${Math.round((wins / total) * 100)}%` : t("common.na") },
    { label: t("games.avgAccuracy"), value: averageAccuracy },
    { label: t("games.mostPlayed"), value: mostPlayed || t("common.na") },
  ];
}

function inDateRange(game, dateRange) {
  if (dateRange === "All time" || !game.timestamp) return true;

  const days = dateRange === "Last 7 days" ? 7 : 30;
  const cutoff = Date.now() / 1000 - days * 24 * 60 * 60;
  return game.timestamp >= cutoff;
}

export default function Games({
  connectedUsername,
  playerGames,
  isLoadingGames,
  gamesError,
  onLoadGames,
  loadedArchivesCount,
  totalArchivesCount,
  hasMoreGames,
  onReviewGame,
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [timeControl, setTimeControl] = useState("All");
  const [result, setResult] = useState("All");
  const [dateRange, setDateRange] = useState("All time");
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [importedGames, setImportedGames] = useState(loadImportedGamesFromStorage);

  useEffect(() => {
    localStorage.setItem(IMPORTED_GAMES_STORAGE_KEY, JSON.stringify(importedGames));
  }, [importedGames]);

  useEffect(() => {
    if (connectedUsername && playerGames.length === 0 && !isLoadingGames && !gamesError) {
      onLoadGames();
    }
  }, [connectedUsername, gamesError, isLoadingGames, onLoadGames, playerGames.length]);

  const parsedGames = useMemo(() => {
    if (!connectedUsername) return [];
    return playerGames.map((game) => ({
      ...parseChessComGame(game, connectedUsername),
      source: "CHESS_COM",
    }));
  }, [connectedUsername, playerGames]);

  const allDisplayGames = useMemo(
    () => [...importedGames, ...parsedGames].sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0)),
    [importedGames, parsedGames]
  );

  const filteredGames = useMemo(() => {
    return allDisplayGames.filter((game) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        [game.opponent, game.whitePlayer, game.blackPlayer, game.opening, game.event]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesTime =
        timeControl === "All" ||
        game.timeClass === timeControl ||
        (game.source === "PGN_IMPORT" && timeControl === "All");
      const resultName = result === "Wins" ? "Win" : result === "Losses" ? "Loss" : "Draw";
      const matchesResult =
        result === "All" ||
        game.result === resultName ||
        (game.source === "PGN_IMPORT" && result === "All");

      return matchesSearch && matchesTime && matchesResult && inDateRange(game, dateRange);
    });
  }, [allDisplayGames, dateRange, result, search, timeControl]);

  const selectedGame =
    filteredGames.find((game) => game.id === selectedGameId) || filteredGames[0] || null;
  const optionLabels = useMemo(
    () => ({
      timeControls: {
        All: t("games.all"),
        Bullet: t("games.bullet"),
        Blitz: t("games.blitz"),
        Rapid: t("games.rapid"),
        Daily: t("games.daily"),
      },
      results: {
        All: t("games.all"),
        Wins: t("games.wins"),
        Losses: t("games.losses"),
        Draws: t("games.draws"),
      },
      dateRanges: {
        "Last 7 days": t("games.last7"),
        "Last 30 days": t("games.last30"),
        "All time": t("games.allTime"),
      },
    }),
    [t]
  );
  const filteredGameStats = getFilteredGameStats(filteredGames, t);
  const isInitialLoading = isLoadingGames && playerGames.length === 0;
  const translateColor = (color) =>
    color === "White" ? t("games.white") : color === "Black" ? t("games.black") : color;

  const openGameReview = (game) => {
    onReviewGame?.({
      id: game.id,
      pgn: game.pgn,
      players: { white: game.whitePlayer, black: game.blackPlayer },
      gameMeta: game,
    });
  };

  const importGames = (gamesToImport) => {
    setImportedGames((currentGames) => {
      const nextMap = new Map(currentGames.map((game) => [game.id, game]));
      gamesToImport.forEach((game) => nextMap.set(game.id, game));
      return [...nextMap.values()].sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));
    });
  };

  const deleteImportedGame = (gameId) => {
    setImportedGames((currentGames) => currentGames.filter((game) => game.id !== gameId));
    setSelectedGameId((currentId) => (currentId === gameId ? null : currentId));
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-transparent p-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-purple-300">{t("games.history")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t("games.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {t("games.reviewRecent", undefined, { username: connectedUsername })}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {filteredGameStats.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="grid gap-2 text-sm text-slate-400">
            {t("games.opponent")}
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("games.searchOpponent")}
              className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10"
            />
          </label>

          <SelectFilter
            label={t("games.timeControl")}
            value={timeControl}
            onChange={setTimeControl}
            options={timeControls}
            getOptionLabel={(option) => optionLabels.timeControls[option] || option}
          />
          <SelectFilter
            label={t("games.result")}
            value={result}
            onChange={setResult}
            options={results}
            getOptionLabel={(option) => optionLabels.results[option] || option}
          />
          <SelectFilter
            label={t("games.date")}
            value={dateRange}
            onChange={setDateRange}
            options={dateRanges}
            getOptionLabel={(option) => optionLabels.dateRanges[option] || option}
          />
        </div>
      </Card>

      {isInitialLoading && (
        <Card className="p-8 text-center text-sm text-slate-400">{t("games.loading")}</Card>
      )}

      {gamesError && (
        <Card className="border-rose-500/25 bg-rose-500/10 p-6 text-sm text-rose-200">
          {gamesError || "Não foi possível carregar as partidas agora."}
        </Card>
      )}

      {!isInitialLoading && (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <Card className="overflow-hidden">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">{t("games.recentGames")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("games.showing", undefined, {
                  count: filteredGames.length,
                  range: (optionLabels.dateRanges[dateRange] || dateRange).toLowerCase(),
                })}
                {totalArchivesCount > 0 &&
                  t("games.loadedArchives", undefined, {
                    loaded: loadedArchivesCount,
                    total: totalArchivesCount,
                  })}
              </p>
            </div>

            <div className="games-list-scroll min-h-[520px] max-h-[760px] overflow-auto">
              <table className="w-full min-w-[1060px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0b16]/95 text-xs uppercase tracking-[0.14em] text-slate-500 backdrop-blur">
                  <tr>
                    <th className="px-5 py-4 font-medium">{t("games.color")}</th>
                    <th className="px-5 py-4 font-medium">Source</th>
                    <th className="px-5 py-4 font-medium">{t("games.opponent")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.result")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.timeControl")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.rated")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.opening")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.date")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.moves")}</th>
                    <th className="px-5 py-4 font-medium">{t("games.review")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredGames.map((game) => {
                    const isSelected = selectedGame?.id === game.id;

                    return (
                      <tr
                        key={game.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedGameId(game.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedGameId(game.id);
                          }
                        }}
                        aria-pressed={isSelected}
                        className={`cursor-pointer border-l-2 border-l-transparent transition duration-200 focus:outline-none focus-visible:bg-purple-500/10 hover:bg-purple-500/[0.06] ${
                          isSelected
                            ? "border-l-purple-400 bg-purple-500/10 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.22)]"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4 text-slate-300">{translateColor(game.color)}</td>
                        <td className="px-5 py-4">
                          <SourceBadge source={game.source} />
                        </td>
                        <td className="px-5 py-4 font-medium text-white">{game.opponent}</td>
                        <td className="px-5 py-4">
                          <ResultBadge result={game.result} />
                        </td>
                        <td className="px-5 py-4 text-slate-300">{game.timeControl}</td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={getRatedTone(game.rated)}>{game.rated}</StatusBadge>
                        </td>
                        <td className="max-w-[340px] px-5 py-4 text-slate-400">
                          <span
                            title={game.opening}
                            className="block whitespace-normal text-sm leading-5 text-slate-300"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {game.opening || t("common.na")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{game.date}</td>
                        <td className="px-5 py-4 text-slate-300">{game.moves}</td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedGameId(game.id);
                              openGameReview(game);
                            }}
                            className="rounded-lg border border-cyan-200/35 bg-gradient-to-r from-purple-500/24 to-cyan-400/18 px-3 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.12)] transition duration-200 hover:border-cyan-200/55 hover:from-purple-500/32 hover:to-cyan-400/24"
                          >
                            {t("games.review")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredGames.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                {t("games.noMatches")}
              </div>
            )}

            <div className="border-t border-white/10 px-5 py-4">
              {hasMoreGames ? (
                <button
                  type="button"
                  onClick={onLoadGames}
                  disabled={isLoadingGames}
                  className="w-full rounded-xl border border-purple-300/35 bg-purple-300/[0.12] px-4 py-3 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-950/20 transition duration-200 hover:border-purple-300/55 hover:bg-purple-300/[0.18] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingGames ? t("games.loadingMore") : t("games.loadMore")}
                </button>
              ) : (
                <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-center text-sm text-slate-400">
                  {t("games.noMore")}
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <p className="text-sm font-medium text-purple-300">{t("games.selectedGame")}</p>
              {selectedGame ? (
                <>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    vs {selectedGame.opponent}
                  </h2>

                  <div className="mt-5 grid gap-3 text-sm">
                    {[
                      [t("games.result"), t(`games.${String(selectedGame.result).toLowerCase()}`, selectedGame.result)],
                      [t("games.rawResult"), selectedGame.rawResult],
                      [t("games.opening"), selectedGame.opening],
                      [t("games.timeControl"), selectedGame.timeControl],
                      [t("games.rated"), selectedGame.rated],
                      [t("games.moves"), selectedGame.moves],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 rounded-xl bg-slate-950/50 px-4 py-3">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-right font-medium text-slate-200">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-purple-500/30 hover:bg-purple-500/[0.07] hover:text-white"
                      onClick={() =>
                        openGameReview(selectedGame)
                      }
                    >
                      {t("games.review")}
                    </button>
                    {selectedGame.source === "PGN_IMPORT" ? (
                      <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-3 text-center text-sm font-semibold text-cyan-100">
                        PGN importado localmente
                      </div>
                    ) : (
                      <a
                        href={selectedGame.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-cyan-200/35 bg-gradient-to-r from-purple-500/24 to-cyan-400/18 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 transition duration-200 hover:border-cyan-200/55 hover:from-purple-500/32 hover:to-cyan-400/24"
                      >
                        {t("games.openChessCom")}
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-400">{t("games.selectGame")}</p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white">{t("games.patternInsights")}</h2>
              <div className="mt-5 grid gap-3">
                {insights.map((insight) => (
                  <div
                    key={insight.key}
                    className="rounded-xl border border-purple-300/18 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300"
                  >
                    {t(insight.key)}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      <PgnImportCard onImportGames={importGames} />

      {!connectedUsername ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-white">Chess.com não conectado</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {t("games.connectPrompt")} Você ainda pode revisar partidas importadas por PGN.
          </p>
        </Card>
      ) : null}

      {importedGames.length ? (
        <Card className="p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-200">Imported Games</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Partidas importadas</h2>
            </div>
            <SourceBadge source="PGN_IMPORT" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {importedGames.slice(0, 6).map((game) => (
              <div key={game.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white" title={`${game.whitePlayer} vs ${game.blackPlayer}`}>
                      {game.whitePlayer} vs {game.blackPlayer}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{game.date} · {game.rawResult}</p>
                  </div>
                  <SourceBadge source="PGN_IMPORT" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-400" title={game.opening}>
                  {game.opening || "Abertura desconhecida"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openGameReview(game)}
                    className="rounded-lg border border-purple-300/25 bg-purple-300/[0.1] px-3 py-2 text-xs font-semibold text-purple-100 hover:bg-purple-300/[0.16]"
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => openGameReview(game)}
                    className="rounded-lg border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/[0.14]"
                  >
                    Analyze
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteImportedGame(game.id)}
                    className="rounded-lg border border-rose-300/20 bg-rose-300/[0.07] px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-300/[0.12]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
