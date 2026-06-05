import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "./layout/MainLayout.jsx";
import AICoach from "./pages/AICoach.jsx";
import AcademyAdmin from "./pages/AcademyAdmin.jsx";
import Analysis from "./pages/Analysis.jsx";
import Calendar from "./pages/Calendar.jsx";
import { useAuth } from "./contexts/AuthContext";
import GameReviewPage from "./pages/GameReviewPage";
import Games from "./pages/Games.jsx";
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage";
import MasterReplayAdmin from "./pages/MasterReplayAdmin.jsx";
import OpeningsPage from "./pages/OpeningsPage.jsx";
import Practice from "./pages/Practice.jsx";
import {
  extractPlayerProfile,
  extractChessComUsername,
  getMyPlayerProfile,
  updateMyChessComUsername,
} from "./services/playerProfile.service";
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

function pathToItem(pathname) {
  if (pathname === "/games") return "Games";
  if (pathname === "/openings") return "Openings";
  if (pathname === "/analysis") return "Analysis";
  if (pathname === "/practice") return "Practice";
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
  const profileBootstrapRef = useRef(false);

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
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleActiveItemChange = useCallback((item) => {
    setActiveItem(item);
    const nextPath = itemToPath[item] || "/";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setCurrentPath(nextPath);
  }, []);

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
      setSavedChessUsername(savedUsername);

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
        />
      );
    }

    if (activeItem === "Practice") {
      return (
        <Practice
          connectedUsername={connectedUsername}
          playerProfile={normalizedAnalysisProfile}
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
    <MainLayout
      activeItem={activeItem}
      onActiveItemChange={handleActiveItemChange}
      fullBleed={isReviewRoute}
      chessComAvatar={playerProfile?.avatar || ""}
    >
      {renderMainPage()}
    </MainLayout>
  );
}
