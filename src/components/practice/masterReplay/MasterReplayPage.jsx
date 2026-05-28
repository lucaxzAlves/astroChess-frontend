import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import {
  historicalCollections,
  masterReplayGames,
  masterReplayTrainingModes,
  playerCollections,
  themeCollections,
} from "../../../data/mockMasterReplay.js";
import { masterReplayApi } from "../../../services/masterReplayApi.js";
import { getUserFriendlyError } from "../../../utils/userFriendlyErrors.js";
import MasterGameCard from "./MasterGameCard.jsx";
import MasterGamePreview from "./MasterGamePreview.jsx";
import MasterReplayHero from "./MasterReplayHero.jsx";
import MasterReplayTabs from "./MasterReplayTabs.jsx";
import PlayerCollectionCard from "./PlayerCollectionCard.jsx";
import ReplayPlaceholder from "./ReplayPlaceholder.jsx";
import ThemeCollectionCard from "./ThemeCollectionCard.jsx";
import TrainingModeCard from "./TrainingModeCard.jsx";

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}

function ContinueTrainingCard({ game, onSelect }) {
  const { t } = useLanguage();

  if (!game) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-2xl font-semibold text-white">{t("masterReplay.continueTraining")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("masterReplay.startFirstReplay")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-amber-200/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(168,85,247,0.08),rgba(15,23,42,0.40))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            {t("masterReplay.continueTraining")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {game.title}, {game.year}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {t("masterReplay.focus")}:{" "}
            <span className="font-medium text-slate-200">
              {t(`masterReplay.game.${game.id}.tag`, game.historicalTag)}
            </span>
          </p>
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t("masterReplay.progress")}</span>
              <span>{game.progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-950/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-200 to-purple-300"
                style={{ width: `${game.progress}%` }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(game)}
          className="rounded-2xl bg-amber-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
        >
          {t("masterReplay.continueReplay")}
        </button>
      </div>
    </section>
  );
}

function HistoricalCollectionCard({ collection, games, selected, onSelect }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onSelect(collection)}
      className={[
        "group rounded-[28px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-amber-200/40 bg-amber-300/[0.08]"
          : "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-amber-200/30 hover:bg-amber-300/[0.055]",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
        {collection.tone}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-white">
        {t(`masterReplay.historical.${collection.id}.title`, collection.title)}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {t(`masterReplay.historical.${collection.id}.description`, collection.description)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
          {t("masterReplay.gameCount", undefined, { count: games.length })}
        </span>
        {games.slice(0, 2).map((game) => (
          <span
            key={game.id}
            className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-100"
          >
            {game.title}
          </span>
        ))}
      </div>
      <span className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition group-hover:border-amber-200/35 group-hover:text-white">
        {t("masterReplay.openCollection")}
      </span>
    </button>
  );
}

function GameGrid({ games, selectedTrainingMode, onSelectGame, highlightedGameIds = [] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {games.map((game) => (
        <MasterGameCard
          key={game.id}
          game={game}
          onSelect={onSelectGame}
          highlighted={highlightedGameIds.includes(game.id) || game.trainingModes.includes(selectedTrainingMode)}
        />
      ))}
    </div>
  );
}

function getGameId(game) {
  return game?._id || game?.id || game?.slug || "";
}

function normalizeBackendGame(game, index = 0) {
  const id = getGameId(game);
  const tags = Array.isArray(game?.tags) ? game.tags : [];
  const category = game?.category || "strategy";
  const themes = tags.length > 0 ? tags : [category];
  const playerCollection =
    playerCollections.find((player) => {
      const white = String(game?.players?.white || "").toLowerCase();
      const black = String(game?.players?.black || "").toLowerCase();
      return white.includes(player.name.toLowerCase()) || black.includes(player.name.toLowerCase());
    })?.id ||
    game?.players?.white?.split(" ").slice(-1)[0] ||
    "Master";
  const annotatedMoves = Array.isArray(game?.annotatedMoves) ? game.annotatedMoves : [];
  const keyMoments = Array.isArray(game?.keyMoments) ? game.keyMoments : [];
  const guessMoveCount = annotatedMoves.filter((move) => move.isGuessMove).length;
  const trainingModes =
    guessMoveCount > 3
      ? ["full_guess_the_move", "critical_moments", "plan_guessing"]
      : ["critical_moments", "plan_guessing", "compare_with_master"];

  return {
    ...game,
    id,
    source: "api",
    title: game?.title || "Untitled Master Replay",
    white: game?.players?.white || "White",
    black: game?.players?.black || "Black",
    year: game?.gameInfo?.year || "",
    event: game?.gameInfo?.event || "Master game",
    result: game?.gameInfo?.result || "*",
    pgn: game?.pgn || "",
    difficulty: game?.difficulty || "intermediate",
    categories: [category, ...themes],
    themes,
    playerCollection,
    historicalTag: game?.gameInfo?.opening || category,
    historicalCollectionIds: game?.gameInfo?.year ? ["legendary-games"] : [],
    estimatedTime: `${Math.max(10, Math.ceil((game?.moveCount || annotatedMoves.length || 35) / 2))} min`,
    progress: 0,
    recommended: index < 4,
    recommendationBadges: index === 0 ? ["Recomendado", "Conteúdo admin"] : ["Recomendado"],
    whyRecommended:
      game?.studySummary?.coreLesson ||
      game?.description ||
      "A curated model game for active replay training.",
    description:
      game?.description ||
      game?.studySummary?.coreLesson ||
      "Study this game through active decisions and annotated key moments.",
    trainingModes,
    recommendedMode: trainingModes[0],
    keyMoments: keyMoments.map((moment) => ({
      ...moment,
      questionType: moment.type,
      prompt: moment.question || moment.description,
      correctMove: moment.answer || moment.title,
      explanation: moment.lesson || moment.description,
    })),
  };
}

function getGamesForThemeFromList(games, theme) {
  if (!theme) return games;
  const matches = theme.matchThemes || [];
  return games.filter((game) => {
    const haystack = [...(game.themes || []), ...(game.categories || []), game.historicalTag]
      .join(" ")
      .toLowerCase();
    return matches.some((match) => haystack.includes(match.toLowerCase()));
  });
}

function getGamesForHistoricalCollectionFromList(games, collection) {
  if (!collection) return games;
  const sampleIds = new Set(collection.sampleGameIds || []);
  return games.filter(
    (game) =>
      sampleIds.has(game.id) ||
      (Array.isArray(game.historicalCollectionIds) && game.historicalCollectionIds.includes(collection.id)),
  );
}

export default function MasterReplayPage({ onBackToPractice }) {
  const { t } = useLanguage();
  const [apiGames, setApiGames] = useState([]);
  const [isLoadingApiGames, setIsLoadingApiGames] = useState(false);
  const [apiError, setApiError] = useState("");
  const [activeReplayTab, setActiveReplayTab] = useState("recommended");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedHistoricalCollection, setSelectedHistoricalCollection] = useState(null);
  const [selectedTrainingMode, setSelectedTrainingMode] = useState("critical_moments");
  const [selectedGame, setSelectedGame] = useState(null);
  const [replaySession, setReplaySession] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMasterReplayGames() {
      setIsLoadingApiGames(true);
      setApiError("");

      try {
        const response = await masterReplayApi.listGames({ limit: 100 });
        if (cancelled) return;
        setApiGames((response.items || []).map(normalizeBackendGame));
      } catch (error) {
        if (cancelled) return;
        setApiGames([]);
        setApiError(getUserFriendlyError(error, "Não foi possível carregar os jogos do Master Replay."));
      } finally {
        if (!cancelled) {
          setIsLoadingApiGames(false);
        }
      }
    }

    loadMasterReplayGames();

    return () => {
      cancelled = true;
    };
  }, []);

  const allGames = useMemo(
    () => (apiGames.length > 0 ? apiGames : masterReplayGames),
    [apiGames],
  );

  const continueGame = useMemo(
    () => allGames.find((game) => Number(game.progress) > 0),
    [allGames]
  );
  const recommendedGames = useMemo(
    () => allGames.filter((game) => game.recommended),
    [allGames]
  );
  const themeGames = useMemo(
    () => getGamesForThemeFromList(allGames, selectedTheme),
    [allGames, selectedTheme]
  );
  const playerGames = useMemo(
    () =>
      selectedPlayer
        ? allGames.filter((game) => game.playerCollection === selectedPlayer.id)
        : allGames,
    [allGames, selectedPlayer]
  );
  const historicalGames = useMemo(
    () => getGamesForHistoricalCollectionFromList(allGames, selectedHistoricalCollection),
    [allGames, selectedHistoricalCollection]
  );
  const trainingModeGames = useMemo(
    () =>
      allGames.filter((game) => game.trainingModes.includes(selectedTrainingMode)),
    [allGames, selectedTrainingMode]
  );

  if (replaySession) {
    return (
      <ReplayPlaceholder
        game={replaySession.game}
        trainingMode={replaySession.trainingMode}
        onExit={() => setReplaySession(null)}
      />
    );
  }

  const handleStartReplay = (game, modeId) => {
    setReplaySession({ game, trainingMode: modeId || game.recommendedMode });
  };

  const handleOpenAdmin = () => {
    window.history.pushState({}, "", "/master-replay-admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleSelectGame = async (game) => {
    setSelectedGame(game);

    if (game.source !== "api") return;

    try {
      const fullGame = await masterReplayApi.getGame(getGameId(game));
      setSelectedGame(normalizeBackendGame(fullGame));
    } catch {
      setSelectedGame(game);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <MasterReplayHero onBackToPractice={onBackToPractice} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="text-sm text-slate-400">
          {isLoadingApiGames
            ? t("masterReplay.loadingApi", "Carregando biblioteca do Master Replay...")
            : apiGames.length > 0
              ? t("masterReplay.apiLoaded", undefined, { count: apiGames.length })
              : t("masterReplay.mockFallback", "Using mock games until API content is available.")}
          {apiError ? <span className="ml-2 text-amber-200">{apiError}</span> : null}
        </div>
        <button
          type="button"
          onClick={handleOpenAdmin}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("masterReplay.adminButton", "Admin")}
        </button>
      </div>
      <ContinueTrainingCard game={continueGame} onSelect={handleSelectGame} />
      <MasterReplayTabs activeTab={activeReplayTab} onTabChange={setActiveReplayTab} />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_390px]">
        <div className="grid gap-6">
          {activeReplayTab === "recommended" ? (
            <>
              <SectionHeading
                title={t("masterReplay.recommendedTitle")}
                description={t("masterReplay.recommendedSubtitle")}
              />
              <GameGrid
                games={recommendedGames}
                selectedTrainingMode={selectedTrainingMode}
                onSelectGame={handleSelectGame}
              />
            </>
          ) : null}

          {activeReplayTab === "themes" ? (
            <>
              <SectionHeading
                title={t("masterReplay.themesTitle")}
                description={t("masterReplay.themesSubtitle")}
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {themeCollections.map((theme) => (
                  <ThemeCollectionCard
                    key={theme.id}
                    theme={theme}
                    selected={selectedTheme?.id === theme.id}
                    gameCount={getGamesForThemeFromList(allGames, theme).length}
                    onSelect={setSelectedTheme}
                  />
                ))}
              </div>
              {selectedTheme ? (
                <SectionHeading
                  eyebrow={t(`masterReplay.theme.${selectedTheme.id}.title`, selectedTheme.title)}
                  title={t("masterReplay.selectedThemeGames")}
                  description={t(`masterReplay.theme.${selectedTheme.id}.description`, selectedTheme.description)}
                />
              ) : null}
              <GameGrid
                games={themeGames}
                selectedTrainingMode={selectedTrainingMode}
                onSelectGame={handleSelectGame}
              />
            </>
          ) : null}

          {activeReplayTab === "players" ? (
            <>
              <SectionHeading
                title={t("masterReplay.playersTitle")}
                description={t("masterReplay.playersSubtitle")}
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {playerCollections.map((player) => (
                  <PlayerCollectionCard
                    key={player.id}
                    player={player}
                    selected={selectedPlayer?.id === player.id}
                    gameCount={allGames.filter((game) => game.playerCollection === player.id).length}
                    onSelect={setSelectedPlayer}
                  />
                ))}
              </div>
              {selectedPlayer ? (
                <SectionHeading
                  eyebrow={selectedPlayer.name}
                  title={t("masterReplay.selectedPlayerGames")}
                  description={t(`masterReplay.player.${selectedPlayer.id}.style`, selectedPlayer.styleSummary)}
                />
              ) : null}
              <GameGrid
                games={playerGames}
                selectedTrainingMode={selectedTrainingMode}
                onSelectGame={handleSelectGame}
              />
            </>
          ) : null}

          {activeReplayTab === "historical" ? (
            <>
              <SectionHeading
                title={t("masterReplay.historicalTitle")}
                description={t("masterReplay.historicalSubtitle")}
              />
              <div className="grid gap-5 md:grid-cols-2">
                {historicalCollections.map((collection) => (
                  <HistoricalCollectionCard
                    key={collection.id}
                    collection={collection}
                    selected={selectedHistoricalCollection?.id === collection.id}
                    games={getGamesForHistoricalCollectionFromList(allGames, collection)}
                    onSelect={setSelectedHistoricalCollection}
                  />
                ))}
              </div>
              {selectedHistoricalCollection ? (
                <SectionHeading
                  eyebrow={t(`masterReplay.historical.${selectedHistoricalCollection.id}.title`, selectedHistoricalCollection.title)}
                  title={t("masterReplay.selectedHistoricalGames")}
                  description={t(`masterReplay.historical.${selectedHistoricalCollection.id}.description`, selectedHistoricalCollection.description)}
                />
              ) : null}
              <GameGrid
                games={historicalGames}
                selectedTrainingMode={selectedTrainingMode}
                onSelectGame={handleSelectGame}
              />
            </>
          ) : null}

          {activeReplayTab === "trainingModes" ? (
            <>
              <SectionHeading
                title={t("masterReplay.trainingModesTitle")}
                description={t("masterReplay.trainingModesSubtitle")}
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {masterReplayTrainingModes.map((mode) => (
                  <TrainingModeCard
                    key={mode.id}
                    mode={mode}
                    selected={selectedTrainingMode === mode.id}
                    compatibleGamesCount={
                      allGames.filter((game) => game.trainingModes.includes(mode.id)).length
                    }
                    onSelect={setSelectedTrainingMode}
                  />
                ))}
              </div>
              <SectionHeading
                eyebrow={t(`masterReplay.mode.${selectedTrainingMode}.title`, selectedTrainingMode)}
                title={t("masterReplay.compatibleGames")}
                description={t("masterReplay.compatibleGamesSubtitle")}
              />
              <GameGrid
                games={trainingModeGames}
                selectedTrainingMode={selectedTrainingMode}
                onSelectGame={handleSelectGame}
              />
            </>
          ) : null}
        </div>

        <div className="xl:sticky xl:top-8">
          <MasterGamePreview
            game={selectedGame}
            selectedTrainingMode={selectedTrainingMode}
            onClose={() => setSelectedGame(null)}
            onSelectTrainingMode={setSelectedTrainingMode}
            onStartReplay={handleStartReplay}
          />
          {!selectedGame ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
                {t("masterReplay.previewEmptyEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {t("masterReplay.previewEmptyTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t("masterReplay.previewEmptyDescription")}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
