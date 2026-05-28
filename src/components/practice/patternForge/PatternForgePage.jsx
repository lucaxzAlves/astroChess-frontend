import { useEffect, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";
import {
  createCyclePayload,
  defaultForgeConfig,
} from "../../../data/mockPatternForge.js";
import {
  completePatternForgeDailySession,
  createPatternForgeCycle,
  getActivePatternForgeCycle,
  getPatternForgeThemes,
  submitPatternForgeAttempt,
} from "../../../services/patternForgeApi.js";
import { getUserFriendlyError } from "../../../utils/userFriendlyErrors.js";
import ForgeSessionSummary from "./ForgeSessionSummary.jsx";
import PatternForgeIntro from "./PatternForgeIntro.jsx";
import PatternForgeSetupWizard from "./PatternForgeSetupWizard.jsx";
import PatternForgeTrainingBoard from "./PatternForgeTrainingBoard.jsx";

function StateCard({ title, description, actionLabel, onAction }) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.96),rgba(9,12,18,0.98))] p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mx-auto rounded-xl bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export default function PatternForgePage({
  connectedUsername = "",
  playerProfile = null,
  onBackToPractice,
}) {
  const { t } = useLanguage();
  const [patternForgeCycle, setPatternForgeCycle] = useState(null);
  const [todaySession, setTodaySession] = useState(null);
  const [puzzles, setPuzzles] = useState([]);
  const [themeReasons, setThemeReasons] = useState([]);
  const [hasConfiguredPatternForge, setHasConfiguredPatternForge] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [forgeConfig, setForgeConfig] = useState(defaultForgeConfig);
  const [currentSetupStep, setCurrentSetupStep] = useState(0);
  const [cycleSummary, setCycleSummary] = useState(null);
  const [loadingCycle, setLoadingCycle] = useState(false);
  const [cycleError, setCycleError] = useState("");
  const [creatingCycle, setCreatingCycle] = useState(false);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [themesError, setThemesError] = useState("");

  const username = connectedUsername.trim();

  const applyCycleResponse = (payload) => {
    const cycle = payload?.cycle || null;
    setPatternForgeCycle(cycle);
    setTodaySession(payload?.todaySession || null);
    setPuzzles(Array.isArray(payload?.puzzles) ? payload.puzzles : []);
    setThemeReasons(Array.isArray(payload?.themeReasons) ? payload.themeReasons : []);
    setHasConfiguredPatternForge(Boolean(cycle));
    setIsConfiguring(false);
    setCycleSummary(null);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadActiveCycle() {
      if (!username) {
        setPatternForgeCycle(null);
        setTodaySession(null);
        setPuzzles([]);
        setThemeReasons([]);
        setHasConfiguredPatternForge(false);
        return;
      }

      setLoadingCycle(true);
      setThemesLoading(true);
      setCycleError("");
      setThemesError("");

      try {
        const [cyclePayload, themesPayload] = await Promise.allSettled([
          getActivePatternForgeCycle(username),
          getPatternForgeThemes(),
        ]);
        if (cancelled) return;

        if (themesPayload.status === "fulfilled") {
          setAvailableThemes(Array.isArray(themesPayload.value?.themes) ? themesPayload.value.themes : []);
        } else {
          setThemesError(
            themesPayload.reason instanceof Error
              ? themesPayload.reason.message
              : t("patternForge.themesLoadError")
          );
        }

        if (cyclePayload.status === "fulfilled") {
          applyCycleResponse(cyclePayload.value);
        } else {
          throw cyclePayload.reason;
        }
      } catch (error) {
        if (cancelled) return;
        setCycleError(getUserFriendlyError(error, t("patternForge.loadError")));
      } finally {
        if (!cancelled) {
          setLoadingCycle(false);
          setThemesLoading(false);
        }
      }
    }

    loadActiveCycle();

    return () => {
      cancelled = true;
    };
  }, [username, t]);

  const resetSetup = () => {
    setHasConfiguredPatternForge(false);
    setIsConfiguring(false);
    setForgeConfig(defaultForgeConfig);
    setPatternForgeCycle(null);
    setTodaySession(null);
    setPuzzles([]);
    setThemeReasons([]);
    setCurrentSetupStep(0);
    setCycleSummary(null);
  };

  const startCycle = async () => {
    if (!username) return;

    setCreatingCycle(true);
    setCycleError("");

    try {
      const payload = await createPatternForgeCycle(createCyclePayload(forgeConfig, username));
      applyCycleResponse(payload);
    } catch (error) {
      const message = getUserFriendlyError(error, t("patternForge.createError"));

      if (message.toLowerCase().includes("active pattern forge cycle")) {
        try {
          const activePayload = await getActivePatternForgeCycle(username);
          applyCycleResponse(activePayload);
          return;
        } catch {
          setCycleError(message);
          return;
        }
      }

      setCycleError(message);
    } finally {
      setCreatingCycle(false);
    }
  };

  const reconfigure = () => {
    setHasConfiguredPatternForge(false);
    setIsConfiguring(true);
    setCurrentSetupStep(0);
    setCycleSummary(null);
  };

  const handleAttempt = async (payload) => {
    const response = await submitPatternForgeAttempt(payload);
    return response?.result || response;
  };

  const handleCompleteDailySession = async (sessionId) => {
    const response = await completePatternForgeDailySession(sessionId);
    return response?.report || response;
  };

  if (!username) {
    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <button
          type="button"
          onClick={onBackToPractice}
          className="w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("patternForge.backToPractice")}
        </button>
        <StateCard
          title={t("patternForge.usernameMissingTitle")}
          description={t("patternForge.usernameMissingDescription")}
        />
      </section>
    );
  }

  if (loadingCycle) {
    return (
      <StateCard
        title={t("patternForge.loadingCycle")}
        description={t("patternForge.loadingCycleDescription")}
      />
    );
  }

  if (cycleError && !isConfiguring && !hasConfiguredPatternForge) {
    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <button
          type="button"
          onClick={onBackToPractice}
          className="w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("patternForge.backToPractice")}
        </button>
        <StateCard
          title={t("patternForge.loadErrorTitle")}
          description={cycleError || t("patternForge.loadError")}
          actionLabel={t("patternForge.tryAgain")}
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  if (cycleSummary) {
    return (
      <ForgeSessionSummary
        summary={cycleSummary}
        onRestart={() => {
          setCycleSummary(null);
          setHasConfiguredPatternForge(true);
        }}
        onReconfigure={reconfigure}
        onBackToPractice={onBackToPractice}
      />
    );
  }

  if (hasConfiguredPatternForge && patternForgeCycle && puzzles.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <button
          type="button"
          onClick={onBackToPractice}
          className="w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("patternForge.backToPractice")}
        </button>
        <StateCard
          title={t("patternForge.noPuzzlesTitle")}
          description={t("patternForge.noPuzzlesDescription")}
          actionLabel={t("patternForge.configureNewCycle")}
          onAction={reconfigure}
        />
      </section>
    );
  }

  if (hasConfiguredPatternForge && patternForgeCycle) {
    return (
      <PatternForgeTrainingBoard
        cycleDraft={patternForgeCycle}
        todaySession={todaySession}
        puzzles={puzzles}
        themeReasons={themeReasons}
        onResetSetup={resetSetup}
        onConfigureNew={reconfigure}
        onBackToPractice={onBackToPractice}
        onSubmitAttempt={handleAttempt}
        onCompleteDailySession={handleCompleteDailySession}
        onCompleteCycle={setCycleSummary}
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackToPractice}
          className="w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-purple-300/35 hover:text-white"
        >
          {t("patternForge.backToPractice")}
        </button>
        <button
          type="button"
          onClick={resetSetup}
          className="w-fit rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300/40"
        >
          {t("patternForge.resetCycleSetup")}
        </button>
      </div>

      {cycleError ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {cycleError}
        </p>
      ) : null}

      {isConfiguring ? (
        <PatternForgeSetupWizard
          forgeConfig={forgeConfig}
          setForgeConfig={setForgeConfig}
          currentSetupStep={currentSetupStep}
          setCurrentSetupStep={setCurrentSetupStep}
          onComplete={startCycle}
          onBackToIntro={() => setIsConfiguring(false)}
          playerProfile={playerProfile}
          themeReasons={themeReasons}
          availableThemes={availableThemes}
          themesLoading={themesLoading}
          themesError={themesError}
          creating={creatingCycle}
        />
      ) : (
        <PatternForgeIntro onConfigure={() => setIsConfiguring(true)} />
      )}
    </section>
  );
}
