import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { parseChessComGame } from "../services/chessComApi.js";

const insights = [
  { key: "games.insight.history" },
  { key: "games.insight.review" },
  { key: "games.insight.openings" },
];

const timeControls = ["All", "Bullet", "Blitz", "Rapid", "Daily"];
const results = ["All", "Wins", "Losses", "Draws"];
const dateRanges = ["Last 7 days", "Last 30 days", "All time"];

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

  useEffect(() => {
    if (connectedUsername && playerGames.length === 0 && !isLoadingGames && !gamesError) {
      onLoadGames();
    }
  }, [connectedUsername, gamesError, isLoadingGames, onLoadGames, playerGames.length]);

  const parsedGames = useMemo(() => {
    if (!connectedUsername) return [];
    return playerGames.map((game) => parseChessComGame(game, connectedUsername));
  }, [connectedUsername, playerGames]);

  const filteredGames = useMemo(() => {
    return parsedGames.filter((game) => {
      const matchesSearch = game.opponent
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesTime = timeControl === "All" || game.timeClass === timeControl;
      const resultName = result === "Wins" ? "Win" : result === "Losses" ? "Loss" : "Draw";
      const matchesResult = result === "All" || game.result === resultName;

      return matchesSearch && matchesTime && matchesResult && inDateRange(game, dateRange);
    });
  }, [dateRange, parsedGames, result, search, timeControl]);

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

  if (!connectedUsername) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-white">{t("games.title")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {t("games.connectPrompt")}
          </p>
        </Card>
      </section>
    );
  }

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
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0b16]/95 text-xs uppercase tracking-[0.14em] text-slate-500 backdrop-blur">
                  <tr>
                    <th className="px-5 py-4 font-medium">{t("games.color")}</th>
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
                              onReviewGame?.({
                                id: game.id,
                                pgn: game.pgn,
                                players: { white: game.whitePlayer, black: game.blackPlayer },
                                gameMeta: game,
                              });
                            }}
                            className="rounded-lg border border-purple-300/20 bg-purple-300/[0.08] px-3 py-2 text-xs font-semibold text-purple-100 transition duration-200 hover:border-purple-300/45 hover:bg-purple-300/[0.14] hover:text-white"
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
                    <a
                      href={selectedGame.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/10"
                    >
                      {t("games.openChessCom")}
                    </a>
                    <button
                      type="button"
                      className="rounded-xl border border-purple-300/35 bg-purple-300/[0.12] px-4 py-3 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-950/20 transition duration-200 hover:border-purple-300/55 hover:bg-purple-300/[0.18]"
                      onClick={() =>
                        onReviewGame?.({
                          id: selectedGame.id,
                          pgn: selectedGame.pgn,
                          players: { white: selectedGame.whitePlayer, black: selectedGame.blackPlayer },
                          gameMeta: selectedGame,
                        })
                      }
                    >
                      {t("games.review")}
                    </button>
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
    </section>
  );
}
