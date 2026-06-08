import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import ReviewBoard from "../components/review/ReviewBoard";
import OpeningTreePanel from "../components/openings/OpeningTreePanel";
import PositionInsights from "../components/openings/PositionInsights";
import { openingExplorerApi } from "../services/openingExplorerApi";

const EMPTY_OVERVIEW = {
  totalGames: 0,
  whiteRepertoireSize: 0,
  blackRepertoireSize: 0,
  mostPlayedOpening: "N/A",
  score: 0,
};

const EMPTY_REPERTOIRE = {
  mostPlayedLines: [],
  favoriteOpenings: [],
  bestPerformingOpenings: [],
  worstPerformingOpenings: [],
};

const ROOT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const EMPTY_ROOT_NODE = {
  id: "start",
  fen: ROOT_FEN,
  move: "Start",
  san: "Start",
  uci: null,
  games: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  whiteGames: 0,
  blackGames: 0,
  children: [],
};

function scorePercent(node) {
  const total = Math.max(1, node?.games || 0);
  return Math.round(((node?.wins || 0) + (node?.draws || 0) * 0.5) / total * 100);
}

function normalizeOpeningMove(move, index = 0) {
  const id = move?.id || move?.fen || `${move?.move || "move"}-${index}`;

  return {
    id,
    fen: move?.fen || ROOT_FEN,
    move: move?.move || move?.san || "",
    san: move?.san || move?.move || "",
    uci: move?.uci || null,
    games: Number(move?.games || 0),
    wins: Number(move?.wins || 0),
    draws: Number(move?.draws || 0),
    losses: Number(move?.losses || 0),
    score: typeof move?.score === "number" ? move.score : undefined,
    whiteGames: Number(move?.whiteGames || 0),
    blackGames: Number(move?.blackGames || 0),
    children: Array.isArray(move?.children)
      ? move.children.map((child, childIndex) => normalizeOpeningMove(child, childIndex))
      : [],
  };
}

function normalizeRootNode(root) {
  if (!root) return EMPTY_ROOT_NODE;

  return {
    id: root.id || "start",
    fen: root.fen || ROOT_FEN,
    move: root.move || "Start",
    san: root.move || "Start",
    uci: null,
    games: Number(root.games || 0),
    wins: Number(root.wins || 0),
    draws: Number(root.draws || 0),
    losses: Number(root.losses || 0),
    whiteGames: Number(root.whiteGames || 0),
    blackGames: Number(root.blackGames || 0),
    children: Array.isArray(root.children)
      ? root.children.map((child, index) => normalizeOpeningMove(child, index))
      : [],
  };
}

function buildFenFromPath(root, path) {
  if (path.length > 0 && path[path.length - 1]?.fen) {
    return path[path.length - 1].fen;
  }

  const chess = new Chess(root.fen);

  path.slice(1).forEach((node) => {
    if (!node.uci) return;
    try {
      chess.move({
        from: node.uci.slice(0, 2),
        to: node.uci.slice(2, 4),
        promotion: node.uci[4] || undefined,
      });
    } catch {
      // Mock data can be adjusted later without crashing the page.
    }
  });

  return chess.fen();
}

function formatLine(path) {
  const moves = path.slice(1);
  if (moves.length === 0) return "Start position";

  const pairs = [];
  for (let index = 0; index < moves.length; index += 2) {
    const moveNumber = Math.floor(index / 2) + 1;
    const whiteMove = moves[index]?.san || moves[index]?.move || "";
    const blackMove = moves[index + 1]?.san || moves[index + 1]?.move || "";
    pairs.push(`${moveNumber}. ${whiteMove}${blackMove ? ` ${blackMove}` : ""}`);
  }

  return pairs.join("  ");
}

function comparableFen(fen) {
  return String(fen || "")
    .split(" ")
    .slice(0, 4)
    .join(" ");
}

function OverviewCard({ label, value, className = "", valueClassName = "" }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-purple-500/20 bg-slate-950/45 p-4 ${className}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p
        className={`mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl ${valueClassName}`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function BoardNavigationControls({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReset,
  onFirst,
  onLast,
  mobile = false,
}) {
  if (mobile) {
    const buttonClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";
    return (
      <div className="mt-3 grid grid-cols-4 gap-2 rounded-[24px] border border-white/10 bg-slate-950/45 p-2.5">
        <button type="button" onClick={onFirst || onReset} disabled={!canGoBack} className={buttonClass} aria-label="First move">
          |‹
        </button>
        <button type="button" onClick={onBack} disabled={!canGoBack} className={buttonClass} aria-label="Previous move">
          ‹
        </button>
        <button type="button" onClick={onForward} disabled={!canGoForward} className={`${buttonClass} border-cyan-300/24 bg-cyan-300/[0.08] text-cyan-100`} aria-label="Next move">
          ›
        </button>
        <button type="button" onClick={onLast || onForward} disabled={!canGoForward} className={`${buttonClass} border-cyan-300/24 bg-cyan-300/[0.08] text-cyan-100`} aria-label="Last move">
          ›|
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-purple-400/35 hover:text-purple-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous move
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!canGoBack}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-purple-400/35 hover:text-purple-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset line
        </button>
        <button
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next move
        </button>
    </div>
  );
}

function MobilePositionInfo({ currentNode, currentScore, path, openingName }) {
  return (
    <section className="rounded-[24px] border border-purple-300/18 bg-slate-950/50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Current Position</p>
      <h2 className="mt-2 line-clamp-2 text-xl font-semibold leading-7 text-white">
        {openingName || "Main position"}
      </h2>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{formatLine(path)}</p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          ["ECO", currentNode?.eco || currentNode?.ECO || "N/A"],
          ["Freq.", currentNode?.games || 0],
          ["Win", `${currentScore}%`],
          ["Moves", currentNode?.children?.length || 0],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-2.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MobileOpeningTree({ currentNode, colorScope, onColorScopeChange, onSelectMove, isLoadingMoves, open, onToggle, compact = false }) {
  const moves = currentNode?.children || [];
  const filteredMoves =
    colorScope === "white"
      ? moves.filter((move) => (move.whiteGames || 0) > 0)
      : colorScope === "black"
        ? moves.filter((move) => (move.blackGames || 0) > 0)
        : moves;

  return (
    <section className="rounded-[24px] border border-purple-300/18 bg-slate-950/48">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="astro-eyebrow">Opening Tree</span>
          <span className="mt-1 block text-lg font-semibold text-white">{moves.length} candidate moves</span>
        </span>
        <span className={["text-xl text-purple-200 transition", open ? "rotate-45" : ""].join(" ")}>+</span>
      </button>

      {open ? (
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex gap-1 rounded-2xl border border-white/10 bg-slate-950/60 p-1">
            {[
              ["all", "All"],
              ["white", "White"],
              ["black", "Black"],
            ].map(([scope, label]) => (
              <button
                key={scope}
                type="button"
                onClick={() => onColorScopeChange(scope)}
                className={[
                  "min-h-10 flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition",
                  colorScope === scope
                    ? "border border-cyan-300/30 bg-cyan-500/10 text-cyan-100"
                    : "text-slate-400",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoadingMoves ? (
            <div className="grid place-items-center gap-3 rounded-2xl border border-purple-300/18 bg-slate-950/50 p-6 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-r-purple-400 border-t-cyan-300" />
              <p className="text-sm text-slate-400">Loading position moves...</p>
            </div>
          ) : filteredMoves.length ? (
            <div className={`${compact ? "max-h-[18rem]" : "max-h-[26rem]"} grid gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]`}>
              {filteredMoves.slice(0, compact ? 10 : 18).map((move, index) => {
                const score = typeof move.score === "number" ? Math.round(move.score) : scorePercent(move);
                const games =
                  colorScope === "white" ? move.whiteGames || 0 : colorScope === "black" ? move.blackGames || 0 : move.games || 0;
                return (
                  <button
                    key={`${move.id}-${index}`}
                    type="button"
                    onClick={() => onSelectMove(move)}
                    className="grid min-h-14 grid-cols-[minmax(0,1fr)_70px_64px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-left"
                  >
                    <span className="min-w-0 truncate text-base font-semibold text-white">{move.san || move.move}</span>
                    <span className="rounded-full border border-white/10 bg-slate-950/45 px-2 py-1 text-center text-xs font-semibold text-slate-200">
                      {games}
                    </span>
                    <span className="text-right text-sm font-semibold text-cyan-100">{score}%</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 text-center text-sm text-slate-500">
              Terminal position in your current repertoire.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function MobilePositionStats({ currentNode, currentScore }) {
  const games = currentNode?.games || 0;
  const drawRate = games ? Math.round(((currentNode?.draws || 0) / games) * 100) : 0;
  const blackScore = Math.max(0, 100 - currentScore);
  const stats = [
    ["Games Reached", games],
    ["White Score", `${currentScore}%`],
    ["Black Score", `${blackScore}%`],
    ["Draw Rate", `${drawRate}%`],
    ["Average Rating", currentNode?.averageRating || "N/A"],
  ];

  return (
    <section>
      <div className="mb-3 px-1">
        <p className="astro-eyebrow">Position Statistics</p>
      </div>
      <div className="mobile-openings-stats flex snap-x gap-3 overflow-x-auto pb-2">
        {stats.map(([label, value]) => (
          <article key={label} className="min-w-[62%] snap-start rounded-[22px] border border-purple-300/18 bg-slate-950/55 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobilePositionInsights({ insights }) {
  return (
    <section className="grid gap-3">
      <div className="px-1">
        <p className="astro-eyebrow">Position Insights</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Padrões da posição</h2>
      </div>
      {insights.length ? (
        insights.map((insight) => (
          <article key={`${insight.type}-${insight.title}`} className="rounded-[24px] border border-purple-300/18 bg-slate-950/50 p-4">
            <div className="mb-3 h-1.5 w-14 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{insight.type || "insight"}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{insight.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{insight.description}</p>
          </article>
        ))
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5 text-sm leading-6 text-slate-400">
          Analyze more games in this line to unlock position-specific blockers, mistakes and recommendations.
        </div>
      )}
    </section>
  );
}

function MobileRelatedGames({ currentNode, path }) {
  const relatedGames = currentNode?.relatedGames || currentNode?.gamesList || currentNode?.examples || [];

  return (
    <section className="grid gap-3">
      <div className="px-1">
        <p className="astro-eyebrow">Related Games</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Partidas nessa linha</h2>
      </div>
      {relatedGames.length ? (
        relatedGames.slice(0, 8).map((game, index) => (
          <button
            key={game.id || game.url || index}
            type="button"
            className="rounded-[24px] border border-white/10 bg-slate-950/48 p-4 text-left"
            onClick={() => game.url && window.open(game.url, "_blank", "noreferrer")}
          >
            <p className="font-semibold text-white">{game.opponent || game.title || "Analyzed game"}</p>
            <p className="mt-2 text-sm text-slate-400">{game.result || "Result N/A"} · {game.date || "Date N/A"}</p>
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">{game.opening || formatLine(path)}</p>
          </button>
        ))
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5 text-sm leading-6 text-slate-400">
          Related games will appear here when the backend links analyzed games to this exact position.
        </div>
      )}
    </section>
  );
}

function LineReviewSignals({ insights }) {
  const primaryInsight = insights?.[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Line review signal
        </p>
        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-100">
          From analyzed games
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-white">
        {primaryInsight?.title || "No decisive line signal yet"}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
        {primaryInsight?.description ||
          "As soon as this position has enough analyzed games, AstroChess can surface opening-specific review signals here."}
      </p>
    </div>
  );
}

function buildOverviewFromSummary(summary) {
  if (!summary) return EMPTY_OVERVIEW;

  return {
    totalGames: Number(summary.totalGames || 0),
    whiteRepertoireSize: Number(summary.whiteRepertoireSize || 0),
    blackRepertoireSize: Number(summary.blackRepertoireSize || 0),
    mostPlayedOpening: summary.mostPlayedOpening?.name || "N/A",
    score: summary.bestOpening?.score ?? 0,
  };
}

function buildRepertoireFromSummary(summary) {
  if (!summary) return EMPTY_REPERTOIRE;

  return {
    mostPlayedLines: [
      summary.mostPlayedOpening
        ? `${summary.mostPlayedOpening.name} · ${summary.mostPlayedOpening.games || 0} games`
        : "No named opening yet",
    ],
    favoriteOpenings: [summary.mostPlayedOpening?.name || "N/A"].filter((item) => item !== "N/A"),
    bestPerformingOpenings: [
      summary.bestOpening
        ? `${summary.bestOpening.name} · ${summary.bestOpening.score ?? 0}%`
        : "N/A",
    ].filter((item) => item !== "N/A"),
    worstPerformingOpenings: [
      summary.weakestOpening
        ? `${summary.weakestOpening.name} · ${summary.weakestOpening.score ?? 0}%`
        : "N/A",
    ].filter((item) => item !== "N/A"),
  };
}

function normalizeInsights(payload) {
  const insights = Array.isArray(payload?.insights) ? payload.insights : [];
  return insights.map((insight) => ({
    type: insight.type || "choice",
    title: insight.title || "Opening insight",
    description: insight.description || "",
  }));
}

export default function OpeningsPage({ onOpenAnalysis }) {
  const nodeCacheRef = useRef(new Map());
  const [rootNode, setRootNode] = useState(EMPTY_ROOT_NODE);
  const [currentNode, setCurrentNode] = useState(EMPTY_ROOT_NODE);
  const [path, setPath] = useState([EMPTY_ROOT_NODE]);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [repertoire, setRepertoire] = useState(EMPTY_REPERTOIRE);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [isNodeLoading, setIsNodeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("moves");
  const [mobileTab, setMobileTab] = useState("tree");
  const [mobileTreeOpen, setMobileTreeOpen] = useState(true);
  const [colorScope, setColorScope] = useState("all");
  const [orientation, setOrientation] = useState("white");

  const fetchNodeDetails = useCallback(async (fen) => {
    const cacheKey = comparableFen(fen);
    const cached = nodeCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const [nodePayload, insightPayload] = await Promise.all([
      openingExplorerApi.getNode(fen),
      openingExplorerApi.getInsights(fen),
    ]);

    const details = {
      children: Array.isArray(nodePayload?.moves)
        ? nodePayload.moves.map((child, index) => normalizeOpeningMove(child, index))
        : [],
      insights: normalizeInsights(insightPayload),
    };

    nodeCacheRef.current.set(cacheKey, details);
    return details;
  }, []);

  const prefetchLikelyNodes = useCallback((moves = []) => {
    moves
      .filter((move) => move?.fen)
      .slice(0, 4)
      .forEach((move) => {
        const cacheKey = comparableFen(move.fen);
        if (nodeCacheRef.current.has(cacheKey)) return;

        fetchNodeDetails(move.fen).catch(() => {
          // Prefetch is an optimization only; failed preloads should not disturb the UI.
        });
      });
  }, [fetchNodeDetails]);

  useEffect(() => {
    let mounted = true;

    async function loadExplorer() {
      setLoading(true);
      setApiError("");

      try {
        const [rootPayload, summaryPayload, insightsPayload] = await Promise.all([
          openingExplorerApi.getRoot(),
          openingExplorerApi.getSummary(),
          openingExplorerApi.getInsights(),
        ]);

        if (!mounted) return;

        const normalizedRoot = normalizeRootNode(rootPayload?.root || rootPayload);
        const nextInsights = normalizeInsights(insightsPayload);

        nodeCacheRef.current.clear();
        nodeCacheRef.current.set(comparableFen(normalizedRoot.fen), {
          children: normalizedRoot.children || [],
          insights: nextInsights,
        });
        setRootNode(normalizedRoot);
        setCurrentNode(normalizedRoot);
        setPath([normalizedRoot]);
        setOverview(buildOverviewFromSummary(summaryPayload));
        setRepertoire(buildRepertoireFromSummary(summaryPayload));
        setInsights(nextInsights);
        prefetchLikelyNodes(normalizedRoot.children || []);
      } catch (error) {
        if (!mounted) return;

        setRootNode(EMPTY_ROOT_NODE);
        setCurrentNode(EMPTY_ROOT_NODE);
        setPath([EMPTY_ROOT_NODE]);
        setOverview(EMPTY_OVERVIEW);
        setRepertoire(EMPTY_REPERTOIRE);
        setInsights([]);
        setApiError(error instanceof Error ? error.message : "Não foi possível carregar as aberturas.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadExplorer();

    return () => {
      mounted = false;
    };
  }, [prefetchLikelyNodes]);

  const boardFen = useMemo(() => buildFenFromPath(rootNode, path), [path, rootNode]);
  const hasOpeningData = Boolean(currentNode?.children?.length || currentNode?.games);
  const currentScore = scorePercent(currentNode);

  const loadNodeChildren = async (move, nextPath) => {
    try {
      const cacheKey = comparableFen(move.fen);
      const hasCachedNode = nodeCacheRef.current.has(cacheKey);
      setIsNodeLoading(!hasCachedNode);

      const details = await fetchNodeDetails(move.fen);
      const children = details.children;
      const nextNode = { ...move, children };
      const nextInsights = details.insights;

      setCurrentNode(nextNode);
      setPath(nextPath.slice(0, -1).concat(nextNode));
      setInsights(nextInsights);
      prefetchLikelyNodes(children);
    } catch (error) {
      setCurrentNode(move);
      setApiError(error instanceof Error ? error.message : "Não foi possível carregar essa posição.");
    } finally {
      setIsNodeLoading(false);
    }
  };

  const handleSelectMove = (move) => {
    const nextPath = [...path, move];
    setPath(nextPath);
    setCurrentNode(move);
    setActiveTab("moves");
    loadNodeChildren(move, nextPath);
  };

  const handleJumpToPly = (ply) => {
    const nextPath = path.slice(0, ply + 1);
    const nextNode = nextPath[nextPath.length - 1] || rootNode;
    setPath(nextPath);
    setCurrentNode(nextNode);

    if (nextNode?.fen) {
      loadNodeChildren(nextNode, nextPath);
    }
  };

  const handleBoardMove = (source, target) => {
    const uci = `${source}${target}`;
    let candidate = currentNode?.children?.find((child) => child.uci?.startsWith(uci));

    if (!candidate) {
      try {
        const chess = new Chess(boardFen);
        chess.move({ from: source, to: target, promotion: "q" });
        const nextFen = chess.fen();
        candidate = currentNode?.children?.find((child) => comparableFen(child.fen) === comparableFen(nextFen));
      } catch {
        candidate = null;
      }
    }

    if (!candidate) return false;
    handleSelectMove(candidate);
    return true;
  };

  const canGoBack = path.length > 1;
  const nextMoveCandidate = useMemo(() => {
    const children = currentNode?.children || [];
    if (colorScope === "white") {
      return children.find((move) => (move.whiteGames || 0) > 0) || children[0] || null;
    }
    if (colorScope === "black") {
      return children.find((move) => (move.blackGames || 0) > 0) || children[0] || null;
    }
    return children[0] || null;
  }, [colorScope, currentNode]);
  const canGoForward = Boolean(nextMoveCandidate);

  const handleGoBack = useCallback(() => {
    if (path.length <= 1) return;
    handleJumpToPly(path.length - 2);
  }, [path]);

  const handleGoForward = useCallback(() => {
    if (!nextMoveCandidate) return;
    handleSelectMove(nextMoveCandidate);
  }, [nextMoveCandidate, path]);

  const handleResetLine = useCallback(() => {
    handleJumpToPly(0);
  }, [path]);

  const handleGoLast = useCallback(() => {
    if (!nextMoveCandidate) return;
    handleSelectMove(nextMoveCandidate);
  }, [nextMoveCandidate, path]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase?.();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleGoBack();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleGoForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGoBack, handleGoForward]);

  if (!hasOpeningData) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl place-items-center">
        <section className="astro-card overflow-hidden p-8 text-center">
          <p className="astro-eyebrow">Opening Observatory</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Analise partidas para construir seu observatório de aberturas.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            O Opening Observatory usa apenas partidas já analisadas. Envie algumas partidas para análise e volte aqui para explorar seu repertório real.
          </p>
          {apiError && (
            <p className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-500">
              {apiError}
            </p>
          )}
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="astro-button-primary mt-6 rounded-xl px-5 py-3 text-sm font-semibold"
          >
            Ir para Analysis
          </button>
        </section>
      </div>
    );
  }

  return (
    <>
    <div className="grid gap-4 md:hidden">
      <MobilePositionInfo
        currentNode={currentNode}
        currentScore={currentScore}
        path={path}
        openingName={overview.mostPlayedOpening}
      />

      <section className="astro-card p-3">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="astro-eyebrow">Opening Observatory</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Explorer</h1>
          </div>
          <button
            type="button"
            onClick={() => setOrientation((value) => (value === "white" ? "black" : "white"))}
            className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
          >
            Flip
          </button>
        </div>

        <ReviewBoard
          fen={boardFen}
          orientation={orientation}
          onMove={handleBoardMove}
          soundEnabled
          maxBoardWidth={430}
          shellMaxWidth={460}
          viewportHeightRatio={0.58}
        />

        <BoardNavigationControls
          mobile
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={handleGoBack}
          onForward={handleGoForward}
          onReset={handleResetLine}
          onFirst={handleResetLine}
          onLast={handleGoLast}
        />
      </section>

      <MobileOpeningTree
        currentNode={currentNode}
        colorScope={colorScope}
        onColorScopeChange={setColorScope}
        onSelectMove={handleSelectMove}
        isLoadingMoves={isNodeLoading}
        open={mobileTreeOpen}
        onToggle={() => setMobileTreeOpen((value) => !value)}
        compact
      />

      <div className="grid grid-cols-3 gap-1 rounded-[24px] border border-purple-300/18 bg-slate-950/55 p-1">
        {[
          ["stats", "Stats"],
          ["insights", "Insights"],
          ["games", "Games"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={[
              "min-h-11 rounded-2xl px-2 py-2 text-xs font-semibold transition",
              mobileTab === id
                ? "border border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100"
                : "text-slate-400",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {mobileTab === "stats" ? (
        <MobilePositionStats currentNode={currentNode} currentScore={currentScore} />
      ) : null}

      {mobileTab === "insights" ? (
        <MobilePositionInsights insights={insights} />
      ) : null}

      {mobileTab === "games" ? (
        <MobileRelatedGames currentNode={currentNode} path={path} />
      ) : null}
    </div>

    <div className="hidden gap-6 md:grid">
      <section className="astro-card overflow-hidden p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="astro-eyebrow">Personal repertoire lab</p>
            <h1 className="mt-3 astro-gradient-title text-4xl font-semibold sm:text-5xl">
              Opening Observatory
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Explore your personal opening universe. This is built around your own games, not a generic master database.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[38rem] xl:grid-cols-5">
            <OverviewCard label="Games" value={loading ? "..." : overview.totalGames} />
            <OverviewCard label="White lines" value={loading ? "..." : overview.whiteRepertoireSize} />
            <OverviewCard
              label="Main opening"
              value={loading ? "..." : overview.mostPlayedOpening}
              className="sm:col-span-2 xl:col-span-2"
              valueClassName="line-clamp-2 break-words text-lg sm:text-xl"
            />
            <OverviewCard label="Score" value={loading ? "..." : `${overview.score}%`} />
          </div>
        </div>
        {apiError && (
          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {apiError}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(38rem,1.08fr)_minmax(30rem,0.92fr)] xl:items-start">
        <div className="astro-card p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="astro-eyebrow">Current position</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                What do I usually play here?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOrientation((value) => (value === "white" ? "black" : "white"))}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-purple-400/35 hover:text-purple-100"
            >
              Flip board
            </button>
          </div>

          <ReviewBoard
            fen={boardFen}
            orientation={orientation}
            onMove={handleBoardMove}
            soundEnabled
            maxBoardWidth={820}
            shellMaxWidth={920}
            viewportHeightRatio={0.86}
          />

          <BoardNavigationControls
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onBack={handleGoBack}
            onForward={handleGoForward}
            onReset={handleResetLine}
          />

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current line</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">{formatLine(path)}</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 xl:self-start">
          <OpeningTreePanel
            activeTab={activeTab}
            colorScope={colorScope}
            currentNode={currentNode}
            isLoadingMoves={isNodeLoading}
            onSelectMove={handleSelectMove}
            onColorScopeChange={setColorScope}
            onTabChange={setActiveTab}
            repertoire={repertoire}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Games reached</p>
              <p className="mt-2 text-2xl font-semibold text-white">{currentNode.games}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">As White</p>
              <p className="mt-2 text-2xl font-semibold text-white">{currentNode.whiteGames || 0}</p>
            </div>
            <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/70">As Black</p>
              <p className="mt-2 text-2xl font-semibold text-white">{currentNode.blackGames || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Position score</p>
              <p className="mt-2 text-2xl font-semibold text-white">{currentScore}%</p>
            </div>
          </div>
          <LineReviewSignals insights={insights} />
        </div>
      </section>

      <PositionInsights insights={insights} />
    </div>
    </>
  );
}
