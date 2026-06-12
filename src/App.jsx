import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "./layout/MainLayout.jsx";
import AICoach from "./pages/AICoach.jsx";
import AcademyAdmin from "./pages/AcademyAdmin.jsx";
import Analysis from "./pages/Analysis.jsx";
import Calendar from "./pages/Calendar.jsx";
import { useAuth } from "./contexts/AuthContext.js";
import GameReviewPage from "./pages/GameReviewPage.js";
import Games from "./pages/Games.jsx";
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.js";
import MasterReplayAdmin from "./pages/MasterReplayAdmin.jsx";
import OpeningsPage from "./pages/OpeningsPage.jsx";
import Practice from "./pages/Practice.jsx";
import {
  extractPlayerProfile,
  extractChessComAvatarUrl,
  extractChessComUsername,
  getMyPlayerProfile,
  updateMyChessComUsername,
} from "./services/playerProfile.service.js";
import {
  getAnalysisBatchStatus,
  triggerAnalysisBatchProfileUpdate,
} from "./services/batchAnalysisApi.js";
import {
  getArchiveGames,
  getPlayerArchives,
  getPlayerProfile,
  getPlayerStats,
  parseChessComStats,
} from "./services/chessComApi.js";
import { filterGamesForGeneralAnalysis } from "./utils/analysisBatchSelection.js";
import { normalizePlayerProfileForUI } from "./utils/playerProfileMapper.js";
import { getUserFriendlyError } from "./utils/userFriendlyErrors.js";

const GAMES_ARCHIVES_PER_LOAD = 3;
const MIN_GAMES_PER_LOAD = 20;
const GLOBAL_ANALYSIS_POLL_INTERVAL_MS = 6000;

const globalAnalysisActiveStates = new Set([
  "preparing",
  "sending",
  "analyzing",
  "waiting",
]);

function getGlobalAnalysisProgress(flow = {}) {
  if (flow.state === "completed") return 100;
  if (flow.state === "failed") return 100;
  if (flow.state === "waiting") return 92;
  if (flow.state === "sending") return 28;
  if (flow.state === "preparing") return 16;

  const processed = Number(flow.processedGames || 0);
  const total = Number(flow.totalGames || 0);
  if (flow.state === "analyzing" && total > 0) {
    return Math.max(35, Math.min(86, Math.round((processed / total) * 70) + 16));
  }

  if (flow.state === "analyzing") return 62;
  return 0;
}

function getGlobalBatchMessage(statusPayload = {}) {
  const status = statusPayload?.status;
  const profileStatus = statusPayload?.profileUpdate?.status;
  const processed = statusPayload?.processedGames || 0;
  const total = statusPayload?.totalGames || 0;

  if (status === "pending") return "Lote aguardando início...";
  if (status === "processing") {
    return total ? `Analisando partidas ${processed}/${total}...` : "Analisando partidas...";
  }
  if (status === "awaiting_profile_update") return "Preparando atualização do perfil...";
  if (status === "profile_update_processing" || profileStatus === "processing") {
    return "Criando seu perfil de jogador...";
  }
  if (status === "completed" || status === "completed_with_errors") {
    return "Finalizando perfil de jogador...";
  }
  if (status === "profile_updated" || profileStatus === "completed") {
    return "Seu perfil de xadrez está pronto.";
  }
  return "Análise do perfil em andamento...";
}

function GlobalAnalysisToast({ flow, onDismiss, onOpenCoach }) {
  if (!flow?.visible) return null;

  const isCompleted = flow.state === "completed";
  const isFailed = flow.state === "failed";
  const progress = getGlobalAnalysisProgress(flow);

  return (
    <div className="fixed bottom-[5.75rem] left-3 right-3 z-[90] sm:bottom-5 sm:left-auto sm:right-5 sm:w-[360px]">
      <div
        className={[
          "overflow-hidden rounded-[24px] border bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(8,8,14,0.98))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl",
          isFailed
            ? "border-rose-300/30"
            : isCompleted
              ? "border-emerald-300/30"
              : "border-purple-300/28",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Análise geral
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">
              {isCompleted
                ? "Perfil atualizado"
                : isFailed
                  ? "Análise interrompida"
                  : "Análise em andamento"}
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {flow.message || "O processamento continuará mesmo fora da aba AI Coach."}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-white"
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>

        {!isCompleted && !isFailed ? (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onOpenCoach}
            className="min-h-10 flex-1 rounded-2xl border border-purple-300/25 bg-purple-300/10 px-3 py-2 text-xs font-bold text-purple-100 transition hover:border-purple-200/50"
          >
            Abrir AI Coach
          </button>
          {isCompleted || isFailed ? (
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-10 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300"
            >
              OK
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const pages = {
  Home,
  Games,
  Openings: OpeningsPage,
  Analysis,
  Practice,
  "Academy Admin": AcademyAdmin,
  "Master Replay Admin": MasterReplayAdmin,
  "AI Coach": AICoach,
  Calendar,
};

const itemToPath = {
  Home: "/",
  Games: "/games",
  Openings: "/openings",
  Analysis: "/analysis",
  Practice: "/practice",
  "Academy Admin": "/academy-admin",
  "Master Replay Admin": "/master-replay-admin",
  "AI Coach": "/ai-coach",
  Calendar: "/calendar",
};

const practiceExperiencePaths = {
  academy: "/practice/academy",
  "master-replay": "/practice/master-replay",
  "personal-replay": "/practice/personal-replay",
  "pattern-forge": "/practice/pattern-forge",
};

function pathToPracticeExperience(pathname) {
  if (pathname === "/practice/academy") return "academy";
  if (pathname === "/practice/master-replay") return "master-replay";
  if (pathname === "/practice/personal-replay") return "personal-replay";
  if (pathname === "/practice/pattern-forge") return "pattern-forge";
  return "";
}

function pathToItem(pathname) {
  if (pathname === "/games") return "Games";
  if (pathname === "/openings") return "Openings";
  if (pathname === "/analysis") return "Analysis";
  if (pathname === "/practice" || pathname.startsWith("/practice/")) return "Practice";
  if (pathname === "/academy-admin") return "Academy Admin";
  if (pathname === "/master-replay-admin") return "Master Replay Admin";
  if (pathname === "/ai-coach") return "AI Coach";
  if (pathname === "/calendar") return "Calendar";
  if (pathname.startsWith("/review/")) return "Games";
  return "Home";
}

export default function App() {
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeItem, setActiveItem] = useState(() => pathToItem(window.location.pathname));
  const [activePracticeExperience, setActivePracticeExperience] = useState(() =>
    pathToPracticeExperience(window.location.pathname)
  );
  const [selectedReviewGame, setSelectedReviewGame] = useState(null);
  const [connectedUsername, setConnectedUsername] = useState("");
  const [savedChessUsername, setSavedChessUsername] = useState("");
  const [playerProfile, setPlayerProfile] = useState(null);
  const [analysisProfileRaw, setAnalysisProfileRaw] = useState(null);
  const [analysisProfileLoading, setAnalysisProfileLoading] = useState(false);
  const [analysisProfileError, setAnalysisProfileError] = useState("");
  const [parsedStats, setParsedStats] = useState(null);
  const [playerGames, setPlayerGames] = useState([]);
  const [playerArchives, setPlayerArchives] = useState([]);
  const [loadedArchivesCount, setLoadedArchivesCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [connectSuccess, setConnectSuccess] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState("");
  const [globalAnalysisFlow, setGlobalAnalysisFlow] = useState({
    state: "idle",
    message: "",
    error: "",
    batchId: "",
    visible: false,
  });
  const profileBootstrapRef = useRef(false);
  const globalProfileUpdateTriggeredRef = useRef(new Set());

  const isReviewRoute = /^\/review\/[^/]+$/.test(currentPath);
  const isLoginRoute = currentPath === "/login";
  const authenticatedUserId =
    typeof user?.id === "string"
      ? user.id
      : typeof user?.userId === "string"
        ? user.userId
        : typeof analysisProfileRaw?._id === "string"
          ? analysisProfileRaw._id
          : typeof analysisProfileRaw?.userId === "string"
            ? analysisProfileRaw.userId
            : "";

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setActiveItem(pathToItem(path));
      setActivePracticeExperience(pathToPracticeExperience(path));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleActiveItemChange = useCallback((item, options = {}) => {
    setActiveItem(item);
    const nextPracticeExperience = item === "Practice" ? options.practiceExperience || "" : "";
    setActivePracticeExperience(nextPracticeExperience);
    const nextPath =
      item === "Practice" && nextPracticeExperience
        ? practiceExperiencePaths[nextPracticeExperience] || "/practice"
        : itemToPath[item] || "/";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setCurrentPath(nextPath);
  }, []);

  const handlePracticeExperienceChange = useCallback((experience = "") => {
    setActivePracticeExperience(experience);
    if (activeItem !== "Practice") return;

    const nextPath = experience
      ? practiceExperiencePaths[experience] || "/practice"
      : "/practice";

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setCurrentPath(nextPath);
  }, [activeItem]);

  const redirectToLogin = useCallback(() => {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const resetChessComState = useCallback(() => {
    setConnectedUsername("");
    setSavedChessUsername("");
    setPlayerProfile(null);
    setAnalysisProfileRaw(null);
    setAnalysisProfileLoading(false);
    setAnalysisProfileError("");
    setParsedStats(null);
    setPlayerGames([]);
    setPlayerArchives([]);
    setLoadedArchivesCount(0);
    setConnectError("");
    setConnectSuccess("");
    setGamesError("");
  }, []);

  const handleGlobalAnalysisFlowChange = useCallback((flow = {}) => {
    const nextState = flow.state || "idle";
    const shouldShow =
      globalAnalysisActiveStates.has(nextState) ||
      nextState === "completed" ||
      nextState === "failed";

    setGlobalAnalysisFlow((current) => ({
      ...current,
      ...flow,
      state: nextState,
      visible: shouldShow ? true : current.visible && nextState !== "idle",
    }));
  }, []);

  const dismissGlobalAnalysisFlow = useCallback(() => {
    setGlobalAnalysisFlow((current) => ({
      ...current,
      visible: false,
    }));
  }, []);

  const handleProtectedRequestError = useCallback(async (error) => {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Não autorizado")) {
      resetChessComState();
      await logout();
      redirectToLogin();
      return true;
    }
    return false;
  }, [logout, redirectToLogin, resetChessComState]);

  const refreshAnalysisProfile = useCallback(
    async (options = {}) => {
      const { silent = false } = options;

      if (!isAuthenticated) {
        setAnalysisProfileRaw(null);
        setAnalysisProfileError("");
        return null;
      }

      if (!silent) {
        setAnalysisProfileLoading(true);
      }
      setAnalysisProfileError("");

      try {
        const response = await getMyPlayerProfile();
        const profile = extractPlayerProfile(response);
        setAnalysisProfileRaw(profile);
        return profile;
      } catch (error) {
        const unauthorized = await handleProtectedRequestError(error);
        if (!unauthorized) {
          setAnalysisProfileError(
            getUserFriendlyError(error, "Não foi possível carregar sua análise de perfil agora.")
          );
        }
        return null;
      } finally {
        if (!silent) {
          setAnalysisProfileLoading(false);
        }
      }
    },
    [handleProtectedRequestError, isAuthenticated]
  );

  useEffect(() => {
    const batchId = globalAnalysisFlow.batchId;
    const shouldPoll =
      isAuthenticated &&
      batchId &&
      globalAnalysisActiveStates.has(globalAnalysisFlow.state);

    if (!shouldPoll) return undefined;

    let cancelled = false;

    const poll = async () => {
      try {
        const statusPayload = await getAnalysisBatchStatus({
          userId: authenticatedUserId,
          batchId,
        });
        if (cancelled) return;

        const batchStatus = statusPayload?.status;
        const profileStatus = statusPayload?.profileUpdate?.status;
        const shouldTriggerProfileUpdate =
          activeItem !== "AI Coach" &&
          !globalProfileUpdateTriggeredRef.current.has(batchId) &&
          (batchStatus === "awaiting_profile_update" ||
            profileStatus === "skipped" ||
            ((batchStatus === "completed" || batchStatus === "completed_with_errors") &&
              profileStatus !== "completed"));

        if (shouldTriggerProfileUpdate) {
          globalProfileUpdateTriggeredRef.current.add(batchId);
          setGlobalAnalysisFlow((current) => ({
            ...current,
            state: "analyzing",
            message: "Criando seu perfil de jogador...",
            batchId,
            visible: true,
          }));

          await triggerAnalysisBatchProfileUpdate({
            userId: authenticatedUserId,
            batchId,
          });
          return;
        }

        if (batchStatus === "profile_updated" || profileStatus === "completed") {
          await refreshAnalysisProfile({ silent: true });
          if (cancelled) return;

          setGlobalAnalysisFlow((current) => ({
            ...current,
            state: "completed",
            message: "Seu perfil de xadrez está pronto.",
            error: "",
            batchId,
            visible: true,
            processedGames: statusPayload?.processedGames,
            totalGames: statusPayload?.totalGames,
          }));
          return;
        }

        if (
          batchStatus === "failed" ||
          batchStatus === "profile_update_failed" ||
          profileStatus === "failed"
        ) {
          setGlobalAnalysisFlow((current) => ({
            ...current,
            state: "failed",
            message: "A análise do perfil falhou.",
            error:
              statusPayload?.profileUpdate?.error ||
              statusPayload?.errors?.[0]?.message ||
              "Não foi possível concluir a análise do perfil.",
            batchId,
            visible: true,
          }));
          return;
        }

        setGlobalAnalysisFlow((current) => ({
          ...current,
          state: "analyzing",
          message: getGlobalBatchMessage(statusPayload),
          error: "",
          batchId,
          visible: true,
          processedGames: statusPayload?.processedGames,
          totalGames: statusPayload?.totalGames,
        }));
      } catch (error) {
        if (cancelled) return;
        setGlobalAnalysisFlow((current) => ({
          ...current,
          message: current.message || "Acompanhando análise em segundo plano...",
        }));
      }
    };

    void poll();
    const interval = window.setInterval(poll, GLOBAL_ANALYSIS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    authenticatedUserId,
    activeItem,
    globalAnalysisFlow.batchId,
    globalAnalysisFlow.state,
    isAuthenticated,
    refreshAnalysisProfile,
  ]);

  const loadChessComAccountData = useCallback(async (username, options = {}) => {
    const cleanUsername = username.trim();
    const { showSavingState = false, successMessage = "" } = options;

    if (!cleanUsername) {
      setConnectError("Please enter a Chess.com username.");
      setConnectSuccess("");
      return false;
    }

    if (showSavingState) {
      setIsConnecting(true);
    }
    setConnectError("");
    if (successMessage) {
      setConnectSuccess(successMessage);
    }

    try {
      const [profile, stats] = await Promise.all([
        getPlayerProfile(cleanUsername),
        getPlayerStats(cleanUsername),
      ]);

      setConnectedUsername(profile.username || cleanUsername);
      setPlayerProfile(profile);
      setParsedStats(parseChessComStats(stats));
      setPlayerGames([]);
      setPlayerArchives([]);
      setLoadedArchivesCount(0);
      setGamesError("");
      return true;
    } catch (error) {
      setConnectedUsername(cleanUsername);
      setPlayerProfile(null);
      setParsedStats(null);
      setPlayerGames([]);
      setPlayerArchives([]);
      setLoadedArchivesCount(0);
      setConnectError(getUserFriendlyError(error, "Não foi possível encontrar esse usuário no Chess.com."));
      setConnectSuccess("");
      return false;
    } finally {
      if (showSavingState) {
        setIsConnecting(false);
      }
    }
  }, []);

  const connectChessComAccount = useCallback(async (username) => {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setConnectError("Please enter a Chess.com username.");
      setConnectSuccess("");
      return;
    }

    setIsConnecting(true);
    setConnectError("");
    setConnectSuccess("");

    try {
      const response = await updateMyChessComUsername(cleanUsername);
      const savedUsername = extractChessComUsername(response) || cleanUsername;
      const savedAvatarUrl = extractChessComAvatarUrl(response);
      setSavedChessUsername(savedUsername);
      if (savedAvatarUrl) {
        setPlayerProfile((current) => ({
          ...(current || {}),
          username: savedUsername,
          avatar: savedAvatarUrl,
        }));
      }

      const loaded = await loadChessComAccountData(savedUsername, {
        successMessage: "Nickname saved.",
      });

      if (!loaded) {
        setConnectSuccess("");
      }
    } catch (error) {
      const unauthorized = await handleProtectedRequestError(error);
      if (!unauthorized) {
        setConnectError(getUserFriendlyError(error, "Não foi possível salvar esse usuário do Chess.com."));
        setConnectSuccess("");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [handleProtectedRequestError, loadChessComAccountData]);

  const handleLogout = useCallback(async () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    resetChessComState();
    await logout();
    redirectToLogin();
  }, [isAuthenticated, logout, redirectToLogin, resetChessComState]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      profileBootstrapRef.current = false;
      resetChessComState();
      return;
    }

    if (profileBootstrapRef.current) return;
    profileBootstrapRef.current = true;

    let cancelled = false;

    const bootstrapProfile = async () => {
      setAnalysisProfileLoading(true);
      try {
        const profileResponse = await getMyPlayerProfile();
        if (cancelled) return;

        const backendProfile = extractPlayerProfile(profileResponse);
        setAnalysisProfileRaw(backendProfile);
        setAnalysisProfileError("");

        const savedUsername = extractChessComUsername(profileResponse);
        setSavedChessUsername(savedUsername);
        setConnectedUsername(savedUsername);

        if (!savedUsername) {
          setPlayerProfile(null);
          setParsedStats(null);
          return;
        }

        const loaded = await loadChessComAccountData(savedUsername);
        if (!loaded || cancelled) return;
      } catch (error) {
        if (cancelled) return;
        const unauthorized = await handleProtectedRequestError(error);
        if (!unauthorized) {
          setAnalysisProfileError(
            getUserFriendlyError(error, "Não foi possível carregar sua análise de perfil agora.")
          );
          setConnectError(
            getUserFriendlyError(error, "Não foi possível carregar sua conta do Chess.com agora.")
          );
          setConnectSuccess("");
        }
      } finally {
        if (!cancelled) {
          setAnalysisProfileLoading(false);
        }
      }
    };

    bootstrapProfile();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    handleProtectedRequestError,
    isAuthenticated,
    loadChessComAccountData,
    resetChessComState,
  ]);

  const loadPlayerGames = useCallback(async () => {
    if (!connectedUsername) return;

    setIsLoadingGames(true);
    setGamesError("");

    try {
      let archives = playerArchives;

      if (archives.length === 0) {
        const archivesData = await getPlayerArchives(connectedUsername);
        archives = [...(archivesData.archives || [])].reverse();
        setPlayerArchives(archives);
      }

      if (archives.length === 0) {
        setGamesError("No game archives found for this Chess.com user.");
        return;
      }

      const loadedGames = [];
      let nextLoadedCount = loadedArchivesCount;

      while (
        nextLoadedCount < archives.length &&
        nextLoadedCount < loadedArchivesCount + GAMES_ARCHIVES_PER_LOAD &&
        loadedGames.length < MIN_GAMES_PER_LOAD
      ) {
        const nextArchiveUrl = archives[nextLoadedCount];
        if (!nextArchiveUrl) break;

        const archive = await getArchiveGames(nextArchiveUrl);
        loadedGames.push(...(archive.games || []));
        nextLoadedCount += 1;
      }

      if (!loadedGames.length) return;

      setPlayerGames((currentGames) => {
        const mergedGames = new Map(currentGames.map((game) => [game.uuid || game.url, game]));

        loadedGames.forEach((game) => {
          mergedGames.set(game.uuid || game.url, game);
        });

        return [...mergedGames.values()].sort((a, b) => (b.end_time || 0) - (a.end_time || 0));
      });
      setLoadedArchivesCount(nextLoadedCount);
    } catch (error) {
      const unauthorized = await handleProtectedRequestError(error);
      if (!unauthorized) {
        setGamesError(getUserFriendlyError(error, "Não foi possível carregar as partidas agora."));
      }
    } finally {
      setIsLoadingGames(false);
    }
  }, [connectedUsername, handleProtectedRequestError, loadedArchivesCount, playerArchives]);

  const ensurePlayerGamesLoadedForAnalysis = useCallback(
    async (filters = {}, excludedGameIds = []) => {
      if (!connectedUsername) {
        return [];
      }

      setIsLoadingGames(true);
      setGamesError("");

      try {
        let archives = playerArchives;
        let mergedGames = [...playerGames].sort(
          (a, b) => (b.end_time || 0) - (a.end_time || 0)
        );
        let nextLoadedCount = Math.min(loadedArchivesCount, archives.length || loadedArchivesCount);

        if (archives.length === 0) {
          const archivesData = await getPlayerArchives(connectedUsername);
          archives = [...(archivesData.archives || [])].reverse();
          setPlayerArchives(archives);
          nextLoadedCount = Math.min(loadedArchivesCount, archives.length);
        }

        if (archives.length === 0) {
          setGamesError("No game archives found for this Chess.com user.");
          return mergedGames;
        }

        const desiredCount = Math.max(1, Number(filters?.maxGames) || 50);
        let filteredGames = filterGamesForGeneralAnalysis(
          mergedGames,
          connectedUsername,
          filters,
          excludedGameIds
        );

        while (filteredGames.length < desiredCount && nextLoadedCount < archives.length) {
          const nextArchiveUrl = archives[nextLoadedCount];
          if (!nextArchiveUrl) break;

          const archive = await getArchiveGames(nextArchiveUrl);
          const archiveGames = archive.games || [];
          const nextMap = new Map(mergedGames.map((game) => [game.uuid || game.url, game]));

          archiveGames.forEach((game) => {
            nextMap.set(game.uuid || game.url, game);
          });

          mergedGames = [...nextMap.values()].sort(
            (a, b) => (b.end_time || 0) - (a.end_time || 0)
          );
          nextLoadedCount += 1;
          filteredGames = filterGamesForGeneralAnalysis(
            mergedGames,
            connectedUsername,
            filters,
            excludedGameIds
          );
        }

        setPlayerGames((currentGames) => {
          const nextMap = new Map(currentGames.map((game) => [game.uuid || game.url, game]));

          mergedGames.forEach((game) => {
            nextMap.set(game.uuid || game.url, game);
          });

          return [...nextMap.values()].sort((a, b) => (b.end_time || 0) - (a.end_time || 0));
        });
        setLoadedArchivesCount((current) => Math.max(current, nextLoadedCount));
        return mergedGames;
      } catch (error) {
        const unauthorized = await handleProtectedRequestError(error);
        if (!unauthorized) {
          setGamesError(getUserFriendlyError(error, "Não foi possível carregar as partidas agora."));
        }
        return playerGames;
      } finally {
        setIsLoadingGames(false);
      }
    },
    [
      connectedUsername,
      handleProtectedRequestError,
      playerArchives,
      playerGames,
    ]
  );

  const normalizedAnalysisProfile = useMemo(
    () => normalizePlayerProfileForUI(analysisProfileRaw),
    [analysisProfileRaw]
  );

  const handleReviewGame = useCallback((gameData) => {
    const normalizedConnectedUsername = connectedUsername.toLowerCase();
    const nextReviewGame = {
      ...gameData,
      gameMeta: {
        ...gameData.gameMeta,
        whiteAvatar:
          gameData.gameMeta?.whiteAvatar ||
          (gameData.gameMeta?.whitePlayer?.toLowerCase() === normalizedConnectedUsername
            ? playerProfile?.avatar || null
            : null),
        blackAvatar:
          gameData.gameMeta?.blackAvatar ||
          (gameData.gameMeta?.blackPlayer?.toLowerCase() === normalizedConnectedUsername
            ? playerProfile?.avatar || null
            : null),
      },
    };

    setSelectedReviewGame(nextReviewGame);
    sessionStorage.setItem("selectedReviewGame", JSON.stringify(nextReviewGame));
    const nextPath = `/review/${gameData.id}`;
    window.history.pushState({}, "", nextPath);
    setCurrentPath(nextPath);
    setActiveItem("Games");
  }, [connectedUsername, playerProfile]);

  const renderMainPage = () => {
    if (isReviewRoute) {
      const routeId = currentPath.split("/")[2];
      const persistedReview = sessionStorage.getItem("selectedReviewGame");
      let parsedPersisted = null;
      try {
        parsedPersisted = persistedReview ? JSON.parse(persistedReview) : null;
      } catch {
        parsedPersisted = null;
      }

      const reviewData =
        selectedReviewGame?.id === routeId
          ? selectedReviewGame
          : parsedPersisted?.id === routeId
            ? parsedPersisted
            : null;

      return (
        <GameReviewPage
          gameId={routeId}
          pgn={reviewData?.pgn}
          players={reviewData?.players}
          gameMeta={reviewData?.gameMeta}
          connectedUsername={connectedUsername}
        />
      );
    }

    if (isLoginRoute) {
      return <LoginPage />;
    }

    if (activeItem === "Home") {
      return (
        <Home
          connectedUsername={connectedUsername}
          playerProfile={playerProfile}
          parsedStats={parsedStats}
          analysisProfile={normalizedAnalysisProfile}
          playerGames={playerGames}
          isConnecting={isConnecting}
          connectError={connectError}
          connectSuccess={connectSuccess}
          onConnect={connectChessComAccount}
          onNavigate={handleActiveItemChange}
          onReviewGame={handleReviewGame}
          initialUsername={savedChessUsername || connectedUsername}
        />
      );
    }

    if (activeItem === "Games") {
      return (
        <Games
          connectedUsername={connectedUsername}
          playerGames={playerGames}
          isLoadingGames={isLoadingGames}
          gamesError={gamesError}
          onLoadGames={loadPlayerGames}
          loadedArchivesCount={loadedArchivesCount}
          totalArchivesCount={playerArchives.length}
          hasMoreGames={
            playerArchives.length === 0 || loadedArchivesCount < playerArchives.length
          }
          onReviewGame={handleReviewGame}
        />
      );
    }

    if (activeItem === "Analysis") {
      return (
        <Analysis
          profileData={normalizedAnalysisProfile}
          profileLoading={analysisProfileLoading}
          profileError={analysisProfileError}
          onRefreshProfile={refreshAnalysisProfile}
          onOpenCoach={() => handleActiveItemChange("AI Coach")}
        />
      );
    }

    if (activeItem === "Openings") {
      return <OpeningsPage onOpenAnalysis={() => handleActiveItemChange("Analysis")} />;
    }

    if (activeItem === "AI Coach") {
      return (
        <AICoach
          connectedUsername={connectedUsername}
          userId={authenticatedUserId}
          playerGames={playerGames}
          profileData={normalizedAnalysisProfile}
          rawPlayerProfile={analysisProfileRaw}
          profileLoading={analysisProfileLoading}
          profileError={analysisProfileError}
          onRefreshProfile={refreshAnalysisProfile}
          onEnsureGamesLoaded={ensurePlayerGamesLoadedForAnalysis}
          onOpenAnalysis={() => handleActiveItemChange("Analysis")}
          onAnalysisFlowChange={handleGlobalAnalysisFlowChange}
        />
      );
    }

    if (activeItem === "Practice") {
      return (
        <Practice
          connectedUsername={connectedUsername}
          playerProfile={normalizedAnalysisProfile}
          initialExperience={activePracticeExperience}
          onExperienceChange={handlePracticeExperienceChange}
        />
      );
    }

    const CurrentPage = pages[activeItem] ?? Home;
    return <CurrentPage />;
  };

  if (isLoginRoute) {
    return <LoginPage />;
  }

  return (
    <>
    <MainLayout
      activeItem={activeItem}
      activePracticeExperience={activePracticeExperience}
      onActiveItemChange={handleActiveItemChange}
      fullBleed={isReviewRoute}
      chessComAvatar={playerProfile?.avatar || ""}
      connectedUsername={savedChessUsername || connectedUsername}
      isConnectingChessCom={isConnecting}
      connectError={connectError}
      connectSuccess={connectSuccess}
      onConnectChessCom={connectChessComAccount}
      onLogout={handleLogout}
    >
      {renderMainPage()}
    </MainLayout>
      <GlobalAnalysisToast
        flow={globalAnalysisFlow}
        onDismiss={dismissGlobalAnalysisFlow}
        onOpenCoach={() => handleActiveItemChange("AI Coach")}
      />
    </>
  );
}
