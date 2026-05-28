import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import { getUserFriendlyError } from "../../utils/userFriendlyErrors.js";
import { Badge, ProgressBar } from "../profileDelta/ProfileDeltaUi.jsx";
import AnalysisOptionCard from "./AnalysisOptionCard.jsx";
import AnalysisOverview from "./AnalysisOverview.jsx";

export const DEFAULT_ANALYSIS_CONFIG = {
  timeControlPreset: "recommended_mix",
  resultPreset: "wins_losses",
  filters: {
    timeControls: ["blitz", "rapid"],
    dateRange: {
      type: "last_30_days",
      from: null,
      to: null,
    },
    resultTypes: ["win", "loss"],
    color: "both",
    ratedOnly: true,
    maxGames: 50,
    excludeVeryShortGames: true,
    minimumMoves: 20,
  },
  analysisOptions: {
    includeRecurringMistakes: true,
    includeSkillMap: true,
    includeOpeningProfile: true,
    includeEndgameProfile: false,
    includeDecisionPatterns: true,
    includePsychologicalProfile: false,
    includeTrainingPlan: true,
    includeTournamentPreparation: false,
  },
};

const wizardSteps = [
  {
    title: "Quais partidas seu coach deve estudar?",
    description:
      "Escolha os tipos de partida que melhor refletem os erros e decisões que você quer diagnosticar primeiro.",
  },
  {
    title: "Até onde devemos olhar?",
    description:
      "Equilibre recência e tamanho da amostra. Uma janela menor é mais precisa; uma maior é mais estável.",
  },
  {
    title: "Quais resultados devem entrar?",
    description:
      "Conjuntos diferentes de resultados mudam o que o coach percebe primeiro no seu perfil.",
  },
  {
    title: "Refine a análise",
    description:
      "Estes filtros limpam a amostra para que o diagnóstico seja mais representativo e menos ruidoso.",
  },
  {
    title: "Em que o coach deve focar?",
    description:
      "Selecione os tipos de entrega que o coach deve preparar após analisar o lote de partidas.",
  },
  {
    title: "Visão geral da análise",
    description:
      "Revise a configuração completa antes de transformá-la em um rascunho de solicitação.",
  },
];

const timeControlPresets = [
  {
    key: "recommended_mix",
    id: "recommended_mix",
    title: "Mistura recomendada",
    description:
      "Melhor equilíbrio entre erros práticos e decisões mais sérias.",
    badge: "Recomendado",
    values: ["blitz", "rapid"],
    icon: "◎",
  },
  {
    key: "rapid_only",
    id: "rapid_only",
    title: "Apenas rápido",
    description:
      "Melhor para encontrar fraquezas de cálculo, planejamento e jogo posicional.",
    badge: "Melhor para evolução profunda",
    values: ["rapid"],
    icon: "R",
  },
  {
    key: "blitz_only",
    id: "blitz_only",
    title: "Apenas blitz",
    description:
      "Bom para gestão do tempo, reflexos táticos e decisões práticas.",
    values: ["blitz"],
    icon: "B",
  },
  {
    key: "classical_daily",
    id: "classical_daily",
    title: "Clássico / Diário",
    description:
      "Útil para preparação estratégica e de aberturas, mas pode ter menos partidas.",
    values: ["classical", "daily"],
    icon: "C",
  },
  {
    key: "custom",
    id: "custom",
    title: "Personalizado",
    description: "Escolha exatamente quais ritmos devem entrar.",
    values: [],
    icon: "⋯",
  },
];

const dateRangePresets = [
  {
    key: "last_7_days",
    id: "last_7_days",
    title: "Últimos 7 dias",
    description: "Forma recente e rápida. Bom se você joga bastante.",
    icon: "7",
  },
  {
    key: "last_30_days",
    id: "last_30_days",
    title: "Últimos 30 dias",
    description: "Equilíbrio entre tamanho da amostra e relevância.",
    badge: "Recomendado",
    icon: "30",
  },
  {
    key: "last_90_days",
    id: "last_90_days",
    title: "Últimos 90 dias",
    description: "Melhor para padrões estáveis e menos ruído.",
    icon: "90",
  },
  {
    key: "all_available",
    id: "all_available",
    title: "Tudo disponível",
    description: "Mais completo, mas mais amplo e lento.",
    icon: "∞",
  },
  {
    key: "custom",
    id: "custom",
    title: "Intervalo personalizado",
    description: "Escolha datas exatas se quiser uma janela específica de estudo.",
    icon: "◫",
  },
];

const resultTypePresets = [
  {
    key: "losses_only",
    id: "losses_only",
    title: "Apenas derrotas",
    description:
      "Melhor para encontrar erros recorrentes dolorosos. Mais rápido e bem diagnóstico.",
    badge: "Duro, mas eficiente",
    values: ["loss"],
    icon: "L",
  },
  {
    key: "wins_losses",
    id: "wins_losses",
    title: "Vitórias + derrotas",
    description:
      "Mostra tanto o que quebra seu jogo quanto o que já funciona.",
    badge: "Recomendado",
    values: ["win", "loss"],
    icon: "W/L",
  },
  {
    key: "all_games",
    id: "all_games",
    title: "Todas as partidas",
    description:
      "Perfil mais completo, mas pode incluir partidas menos relevantes.",
    values: ["win", "loss", "draw"],
    icon: "All",
  },
  {
    key: "draws_only",
    id: "draws_only",
    title: "Apenas empates",
    description:
      "Útil para problemas de conversão e chances de vitória desperdiçadas.",
    values: ["draw"],
    icon: "D",
  },
];

const analysisFocusOptions = [
  {
    key: "includeRecurringMistakes",
    titleKey: "analysisWizard.focus.recurringMistakes",
    descriptionKey: "analysisWizard.focus.recurringMistakesDescription",
    title: "Erros recorrentes",
    description: "Revelar os erros que se repetem o suficiente para afetar sua evolução de rating.",
    badge: "Recomendado",
  },
  {
    key: "includeSkillMap",
    titleKey: "analysisWizard.focus.skillMap",
    descriptionKey: "analysisWizard.focus.skillMapDescription",
    title: "Mapa de habilidades / Estatísticas",
    description: "Pontuar e comparar suas principais capacidades enxadrísticas na amostra.",
    badge: "Recomendado",
  },
  {
    key: "includeOpeningProfile",
    titleKey: "analysisWizard.focus.openingProfile",
    descriptionKey: "analysisWizard.focus.openingProfileDescription",
    title: "Repertório de aberturas",
    description: "Encontrar lacunas de repertório, problemas de ordem de lances e estruturas recorrentes.",
    badge: "Recomendado",
  },
  {
    key: "includeEndgameProfile",
    titleKey: "analysisWizard.focus.endgameProfile",
    descriptionKey: "analysisWizard.focus.endgameProfileDescription",
    title: "Perfil de finais",
    description: "Destacar padrões de conversão técnica e posições simplificadas.",
  },
  {
    key: "includeDecisionPatterns",
    titleKey: "analysisWizard.focus.decisionPatterns",
    descriptionKey: "analysisWizard.focus.decisionPatternsDescription",
    title: "Padrões de decisão",
    description: "Mapear como você se comporta sob pressão, mudanças de iniciativa e escolhas práticas.",
    badge: "Recomendado",
  },
  {
    key: "includePsychologicalProfile",
    titleKey: "analysisWizard.focus.psychologicalProfile",
    descriptionKey: "analysisWizard.focus.psychologicalProfileDescription",
    title: "Resiliência psicológica",
    description: "Procurar tilt, reações exageradas, momentos de colapso e qualidade de recuperação.",
  },
  {
    key: "includeTrainingPlan",
    titleKey: "analysisWizard.focus.trainingPlan",
    descriptionKey: "analysisWizard.focus.trainingPlanDescription",
    title: "Plano de treino",
    description: "Converter o diagnóstico em exercícios, prioridades e trabalho de acompanhamento.",
    badge: "Recomendado",
  },
  {
    key: "includeTournamentPreparation",
    titleKey: "analysisWizard.focus.tournamentPreparation",
    descriptionKey: "analysisWizard.focus.tournamentPreparationDescription",
    title: "Preparação para torneios",
    description: "Direcionar a saída final para prontidão competitiva e preparação de eventos.",
  },
];

const timeControlLabels = {
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rápido",
  daily: "Diário",
  classical: "Clássico",
};

function getPresetTitleKey(kind, id) {
  const titles = {
    time: {
      recommended_mix: "analysisWizard.recommendedMixTitle",
      rapid_only: "analysisWizard.rapidOnlyTitle",
      blitz_only: "analysisWizard.blitzOnlyTitle",
      classical_daily: "analysisWizard.classicalDailyTitle",
      custom: "analysisWizard.customTitle",
    },
    date: {
      last_7_days: "games.last7",
      last_30_days: "games.last30",
      last_90_days: "analysisWizard.last90Title",
      all_available: "analysisWizard.allAvailableTitle",
      custom: "analysisWizard.customDateTitle",
    },
    result: {
      losses_only: "analysisWizard.lossesOnlyTitle",
      wins_losses: "analysisWizard.winsLossesTitle",
      all_games: "analysisWizard.allGamesTitle",
      draws_only: "analysisWizard.drawsOnlyTitle",
    },
  };

  return titles[kind]?.[id] || "";
}

function getPresetDescriptionKey(kind, id) {
  const descriptions = {
    time: {
      recommended_mix: "analysisWizard.bestBalance",
      rapid_only: "analysisWizard.rapidOnlyDescription",
      blitz_only: "analysisWizard.blitzOnlyDescription",
      classical_daily: "analysisWizard.classicalDailyDescription",
      custom: "analysisWizard.customDescription",
    },
    date: {
      last_7_days: "analysisWizard.last7Description",
      last_30_days: "analysisWizard.last30Description",
      last_90_days: "analysisWizard.last90Description",
      all_available: "analysisWizard.allAvailableDescription",
      custom: "analysisWizard.customDateDescription",
    },
    result: {
      losses_only: "analysisWizard.lossesOnlyDescription",
      wins_losses: "analysisWizard.winsLossesDescription",
      all_games: "analysisWizard.allGamesDescription",
      draws_only: "analysisWizard.drawsOnlyDescription",
    },
  };

  return descriptions[kind]?.[id] || "";
}

function translateBadge(t, badge) {
  const badges = {
    Recommended: "analysisWizard.recommended",
    Recomendado: "analysisWizard.recommended",
    "Best for deep improvement": "analysisWizard.bestDeep",
    "Melhor para evolução profunda": "analysisWizard.bestDeep",
    "Harsh but efficient": "analysisWizard.harshEfficient",
    "Duro, mas eficiente": "analysisWizard.harshEfficient",
  };

  return badge ? t(badges[badge] || badge, badge) : badge;
}

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function formatDurationLabel(totalSeconds) {
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

  if (totalMinutes < 60) {
    return `Cerca de ${totalMinutes} minuto${totalMinutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `Cerca de ${hours} hora${hours === 1 ? "" : "s"}`;
  }

  return `Cerca de ${hours}h ${minutes}m`;
}

function buildTimeControlBreakdown(timeControls = [], selectedGamesCount = 0) {
  if (!timeControls.length) return [];

  if (
    timeControls.length === 2 &&
    timeControls.includes("blitz") &&
    timeControls.includes("rapid")
  ) {
    const blitzCount = Math.round(selectedGamesCount * 0.6);
    return [
      { label: "Blitz", count: blitzCount },
      { label: "Rápido", count: selectedGamesCount - blitzCount },
    ];
  }

  const base = Math.floor(selectedGamesCount / timeControls.length);
  let remainder = selectedGamesCount % timeControls.length;

  return timeControls.map((control) => {
    const next = remainder > 0 ? base + 1 : base;
    remainder = Math.max(0, remainder - 1);
    return {
      label: timeControlLabels[control] || control,
      count: next,
    };
  });
}

function buildResultBreakdown(resultTypes = [], selectedGamesCount = 0) {
  if (!resultTypes.length) return [];

  if (resultTypes.length === 1) {
    const label = resultTypes[0] === "win" ? "Vitórias" : resultTypes[0] === "loss" ? "Derrotas" : "Empates";
    return [{ label, count: selectedGamesCount }];
  }

  if (resultTypes.length === 2 && resultTypes.includes("win") && resultTypes.includes("loss")) {
    const losses = Math.round(selectedGamesCount * 0.48);
    return [
      { label: "Derrotas", count: losses },
      { label: "Vitórias", count: selectedGamesCount - losses },
    ];
  }

  const wins = Math.round(selectedGamesCount * 0.4);
  const losses = Math.round(selectedGamesCount * 0.38);
  return [
    { label: "Vitórias", count: wins },
    { label: "Derrotas", count: losses },
    { label: "Empates", count: selectedGamesCount - wins - losses },
  ];
}

export function buildEstimated(config) {
  const selectedGamesCount = Math.max(1, Number(config?.filters?.maxGames) || 50);
  const secondsPerGame = 30;
  const estimatedSeconds = selectedGamesCount * secondsPerGame;

  return {
    selectedGamesCount,
    secondsPerGame,
    estimatedSeconds,
    estimatedLabel: formatDurationLabel(estimatedSeconds),
    timeControlBreakdown: buildTimeControlBreakdown(
      config?.filters?.timeControls || [],
      selectedGamesCount
    ),
    resultBreakdown: buildResultBreakdown(
      config?.filters?.resultTypes || [],
      selectedGamesCount
    ),
  };
}

export function buildGeneralAnalysisRequestDraft({
  config,
  connectedUsername,
  coachPreferences,
}) {
  const estimated = buildEstimated(config);

  return {
    userId: null,
    source: "chess.com",
    username: connectedUsername || null,
    createdAt: new Date().toISOString(),
    filters: {
      timeControls: config.filters.timeControls,
      dateRange: config.filters.dateRange,
      resultTypes: config.filters.resultTypes,
      color: config.filters.color,
      ratedOnly: config.filters.ratedOnly,
      maxGames: Number(config.filters.maxGames) || 50,
      excludeVeryShortGames: config.filters.excludeVeryShortGames,
      minimumMoves: Number(config.filters.minimumMoves) || 20,
    },
    analysisOptions: config.analysisOptions,
    coachPreferences,
    estimated: {
      selectedGamesCount: estimated.selectedGamesCount,
      secondsPerGame: estimated.secondsPerGame,
      estimatedSeconds: estimated.estimatedSeconds,
      estimatedLabel: estimated.estimatedLabel,
    },
  };
}

function ToggleRow({ title, description, enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-500/30"
    >
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <span
        className={[
          "relative inline-flex h-7 w-12 shrink-0 rounded-full border transition",
          enabled
            ? "border-purple-400/40 bg-purple-500/30"
            : "border-white/10 bg-slate-950/70",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            enabled ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export default function AnalysisSetupWizard({
  isOpen,
  onClose,
  onConfirm,
  connectedUsername,
  coachPreferences,
  initialConfig = DEFAULT_ANALYSIS_CONFIG,
  computeSamplePreview,
  loadSamplePreview,
  isSubmitting = false,
  submissionState = "idle",
  submissionMessage = "",
  submissionError = "",
}) {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [config, setConfig] = useState(() => cloneConfig(initialConfig));
  const [asyncSamplePreview, setAsyncSamplePreview] = useState(null);
  const [samplePreviewLoading, setSamplePreviewLoading] = useState(false);
  const [samplePreviewError, setSamplePreviewError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
    setConfig(cloneConfig(initialConfig || DEFAULT_ANALYSIS_CONFIG));
    setAsyncSamplePreview(null);
    setSamplePreviewError("");
  }, [initialConfig, isOpen]);

  const estimated = useMemo(() => buildEstimated(config), [config]);
  const draftPreview = useMemo(
    () =>
      buildGeneralAnalysisRequestDraft({
        config,
        connectedUsername,
        coachPreferences,
      }),
    [coachPreferences, config, connectedUsername]
  );
  const localSamplePreview = useMemo(() => {
    if (typeof computeSamplePreview === "function") {
      return computeSamplePreview(config, draftPreview);
    }

    return estimated;
  }, [computeSamplePreview, config, draftPreview, estimated]);
  const samplePreview = asyncSamplePreview || localSamplePreview;

  useEffect(() => {
    if (!isOpen || typeof loadSamplePreview !== "function") {
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSamplePreviewLoading(true);
      setSamplePreviewError("");

      try {
        const loadedPreview = await loadSamplePreview(config, draftPreview);

        if (!cancelled) {
          setAsyncSamplePreview(loadedPreview || null);
        }
      } catch (error) {
        if (!cancelled) {
          setSamplePreviewError(
            getUserFriendlyError(error, t("analysisWizard.loadingMatchingGames")),
          );
          setAsyncSamplePreview(null);
        }
      } finally {
        if (!cancelled) {
          setSamplePreviewLoading(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [config, draftPreview, isOpen, loadSamplePreview, t]);

  if (!isOpen) return null;

  const progressValue = ((stepIndex + 1) / wizardSteps.length) * 100;
  const currentStep = wizardSteps[stepIndex];
  const currentStepTitle = t(`analysisWizard.steps.${stepIndex}.title`, currentStep.title);
  const currentStepDescription = t(
    `analysisWizard.steps.${stepIndex}.description`,
    currentStep.description
  );

  const canContinue =
    stepIndex === 0
      ? config.filters.timeControls.length > 0
      : stepIndex === 1
        ? config.filters.dateRange.type !== "custom" ||
          Boolean(config.filters.dateRange.from && config.filters.dateRange.to)
        : stepIndex === 4
          ? Object.values(config.analysisOptions).some(Boolean)
          : true;

  const handleSelectTimePreset = (preset) => {
    setConfig((current) => ({
      ...current,
      timeControlPreset: preset.id,
      filters: {
        ...current.filters,
        timeControls:
          preset.id === "custom"
            ? current.filters.timeControls.length
              ? current.filters.timeControls
              : ["blitz", "rapid"]
            : preset.values,
      },
    }));
  };

  const handleToggleTimeControl = (control) => {
    setConfig((current) => {
      const currentControls = current.filters.timeControls;
      const exists = currentControls.includes(control);
      const nextControls = exists
        ? currentControls.filter((item) => item !== control)
        : [...currentControls, control];

      return {
        ...current,
        timeControlPreset: "custom",
        filters: {
          ...current.filters,
          timeControls: nextControls,
        },
      };
    });
  };

  const handleSelectDateRange = (preset) => {
    setConfig((current) => ({
      ...current,
      filters: {
        ...current.filters,
        dateRange: {
          type: preset.id,
          from: preset.id === "custom" ? current.filters.dateRange.from : null,
          to: preset.id === "custom" ? current.filters.dateRange.to : null,
        },
      },
    }));
  };

  const handleSelectResults = (preset) => {
    setConfig((current) => ({
      ...current,
      resultPreset: preset.id,
      filters: {
        ...current.filters,
        resultTypes: preset.values,
      },
    }));
  };

  const handleConfirm = () => {
    console.log("generalAnalysisRequestDraft", draftPreview);
    return onConfirm(draftPreview, config, samplePreview);
  };

  const renderStepContent = () => {
    if (stepIndex === 0) {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-2">
            {timeControlPresets.map((preset) => (
              <AnalysisOptionCard
                key={preset.id}
                title={t(getPresetTitleKey("time", preset.id), preset.title)}
                description={t(getPresetDescriptionKey("time", preset.id), preset.description)}
                selected={config.timeControlPreset === preset.id}
                onClick={() => handleSelectTimePreset(preset)}
                badge={translateBadge(t, preset.badge)}
                icon={preset.icon}
              />
            ))}
          </div>

          {config.timeControlPreset === "custom" ? (
            <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {t("analysisWizard.customTimeControls")}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {t("analysisWizard.customTimeControlsDescription")}
                  </p>
                </div>
                <Badge tone="slate">{t("analysisWizard.atLeastOne")}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {["bullet", "blitz", "rapid", "classical", "daily"].map((control) => {
                  const selected = config.filters.timeControls.includes(control);
                  return (
                    <button
                      key={control}
                      type="button"
                      onClick={() => handleToggleTimeControl(control)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        selected
                          ? "border-purple-400/40 bg-purple-500/20 text-purple-100"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-purple-500/30",
                      ].join(" ")}
                    >
                      {timeControlLabels[control]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (stepIndex === 1) {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-2">
            {dateRangePresets.map((preset) => (
              <AnalysisOptionCard
                key={preset.id}
                title={t(getPresetTitleKey("date", preset.id), preset.title)}
                description={t(getPresetDescriptionKey("date", preset.id), preset.description)}
                selected={config.filters.dateRange.type === preset.id}
                onClick={() => handleSelectDateRange(preset)}
                badge={translateBadge(t, preset.badge)}
                icon={preset.icon}
              />
            ))}
          </div>

          {config.filters.dateRange.type === "custom" ? (
            <div className="grid gap-4 rounded-[24px] border border-white/10 bg-slate-950/40 p-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {t("analysisWizard.from")}
                </span>
                <input
                  type="date"
                  value={config.filters.dateRange.from || ""}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      filters: {
                        ...current.filters,
                        dateRange: {
                          ...current.filters.dateRange,
                          from: event.target.value || null,
                        },
                      },
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {t("analysisWizard.to")}
                </span>
                <input
                  type="date"
                  value={config.filters.dateRange.to || ""}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      filters: {
                        ...current.filters,
                        dateRange: {
                          ...current.filters.dateRange,
                          to: event.target.value || null,
                        },
                      },
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
                />
              </label>
            </div>
          ) : null}
        </div>
      );
    }

    if (stepIndex === 2) {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          {resultTypePresets.map((preset) => (
            <AnalysisOptionCard
              key={preset.id}
              title={t(getPresetTitleKey("result", preset.id), preset.title)}
              description={t(getPresetDescriptionKey("result", preset.id), preset.description)}
              selected={config.resultPreset === preset.id}
              onClick={() => handleSelectResults(preset)}
              badge={translateBadge(t, preset.badge)}
              icon={preset.icon}
            />
          ))}
        </div>
      );
    }

    if (stepIndex === 3) {
      return (
        <div className="space-y-5">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{t("analysisWizard.colorFilter")}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {t("analysisWizard.colorDescription")}
                </p>
              </div>
              <Badge>{t("analysisWizard.recommendedBoth")}</Badge>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { value: "both", title: t("analysisWizard.bothColors"), description: t("analysisWizard.bothColorsDescription") },
                { value: "white", title: t("analysisWizard.whiteOnly"), description: t("analysisWizard.whiteOnlyDescription") },
                { value: "black", title: t("analysisWizard.blackOnly"), description: t("analysisWizard.blackOnlyDescription") },
              ].map((option) => (
                <AnalysisOptionCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  selected={config.filters.color === option.value}
                  onClick={() =>
                    setConfig((current) => ({
                      ...current,
                      filters: { ...current.filters, color: option.value },
                    }))
                  }
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ToggleRow
              title={t("analysisWizard.ratedOnly")}
              description={t("analysisWizard.ratedOnlyDescription")}
              enabled={config.filters.ratedOnly}
              onToggle={() =>
                setConfig((current) => ({
                  ...current,
                  filters: { ...current.filters, ratedOnly: !current.filters.ratedOnly },
                }))
              }
            />
            <ToggleRow
              title={t("analysisWizard.excludeShort")}
              description={t("analysisWizard.excludeShortDescription")}
              enabled={config.filters.excludeVeryShortGames}
              onToggle={() =>
                setConfig((current) => ({
                  ...current,
                  filters: {
                    ...current.filters,
                    excludeVeryShortGames: !current.filters.excludeVeryShortGames,
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.82fr]">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{t("analysisWizard.maximumGames")}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {t("analysisWizard.maximumGamesDescription")}
                  </p>
                </div>
                <Badge>{t("analysisWizard.recommended50")}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {[10, 25, 50, 100].map((value) => {
                  const selected = Number(config.filters.maxGames) === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          filters: { ...current.filters, maxGames: value },
                        }))
                      }
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        selected
                          ? "border-purple-400/40 bg-purple-500/20 text-purple-100"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-purple-500/30",
                      ].join(" ")}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>

              <label className="mt-4 grid gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {t("analysisWizard.customMaxGames")}
                </span>
                <input
                  type="number"
                  min="1"
                  value={config.filters.maxGames}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      filters: {
                        ...current.filters,
                        maxGames: Math.max(1, Number(event.target.value) || 1),
                      },
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
                />
              </label>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold text-white">{t("analysisWizard.minimumMoves")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("analysisWizard.minimumMovesDescription")}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {[10, 20, 30].map((value) => {
                  const selected = Number(config.filters.minimumMoves) === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          filters: { ...current.filters, minimumMoves: value },
                        }))
                      }
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        selected
                          ? "border-purple-400/40 bg-purple-500/20 text-purple-100"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-purple-500/30",
                      ].join(" ")}
                    >
                      {value} {t("analysisWizard.moves")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (stepIndex === 4) {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          {analysisFocusOptions.map((option) => (
            <AnalysisOptionCard
              key={option.key}
              title={t(option.titleKey, option.title)}
              description={t(option.descriptionKey, option.description)}
              selected={Boolean(config.analysisOptions[option.key])}
              onClick={() =>
                setConfig((current) => ({
                  ...current,
                  analysisOptions: {
                    ...current.analysisOptions,
                    [option.key]: !current.analysisOptions[option.key],
                  },
                }))
              }
              badge={translateBadge(t, option.badge)}
              icon={Boolean(config.analysisOptions[option.key]) ? "✓" : "○"}
            />
          ))}
        </div>
      );
    }

    return <AnalysisOverview draft={draftPreview} sample={samplePreview} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-950/72 p-4 backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_36%)]" />

      <div className="relative z-10 flex h-[min(92vh,980px)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0d13] shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t("analysisWizard.deepSetup")}</Badge>
                <Badge tone="slate">
                  {t("analysisWizard.stepCount", undefined, {
                    current: stepIndex + 1,
                    total: wizardSteps.length,
                  })}
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                {currentStepTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                {currentStepDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="self-start rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-500/30 hover:text-white"
            >
              {t("analysisWizard.cancel")}
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            <ProgressBar value={progressValue} />
            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {wizardSteps.map((step, index) => {
                const isCurrent = index === stepIndex;
                const isDone = index < stepIndex;

                return (
                  <div
                    key={step.title}
                    className={[
                      "rounded-2xl border px-3 py-2 text-xs transition",
                      isCurrent
                        ? "border-purple-400/40 bg-purple-500/14 text-purple-100"
                        : isDone
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                          : "border-white/10 bg-white/[0.03] text-slate-500",
                    ].join(" ")}
                  >
                    <p className="font-semibold">
                      {index + 1}. {t(`analysisWizard.steps.${index}.title`, step.title)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {(submissionState !== "idle" && submissionState !== "completed") || submissionError ? (
            <div
              className={[
                "mb-6 rounded-[24px] border p-5",
                submissionError
                  ? "border-rose-400/30 bg-rose-500/10"
                  : "border-purple-400/25 bg-purple-500/10",
              ].join(" ")}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {t("analysisWizard.workflow")}
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {submissionError
                      ? t("analysisWizard.failedStart")
                      : submissionMessage || t("analysisWizard.preparing")}
                  </p>
                  <p
                    className={[
                      "mt-2 text-sm leading-6",
                      submissionError ? "text-rose-100/90" : "text-slate-300",
                    ].join(" ")}
                  >
                    {submissionError
                      ? submissionError
                      : t("analysisWizard.workflowDescription")}
                  </p>
                </div>
                <Badge tone={submissionError ? "rose" : "purple"}>
                  {submissionError
                    ? t("analysisWizard.failed")
                    : submissionState === "sending"
                      ? t("analysisWizard.sending")
                      : submissionState === "analyzing"
                        ? t("analysisWizard.analyzing")
                        : submissionState === "waiting"
                          ? t("analysisWizard.stillRunning")
                          : t("analysisWizard.preparing")}
                </Badge>
              </div>
            </div>
          ) : null}

          {renderStepContent()}

          {samplePreviewLoading || samplePreviewError ? (
            <div
              className={[
                "mt-5 rounded-2xl border p-4 text-sm",
                samplePreviewError
                  ? "border-yellow-400/25 bg-yellow-400/10 text-yellow-100"
                  : "border-purple-400/25 bg-purple-500/10 text-purple-100",
              ].join(" ")}
            >
              {samplePreviewError || t("analysisWizard.loadingMatchingGames")}
            </div>
          ) : null}
        </div>

        <div className="border-t border-white/10 bg-[#0d1017] px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              {samplePreviewLoading
                ? t("analysisWizard.loadingSample")
                : t("analysisWizard.availableSample")}
              :{" "}
              <span className="font-semibold text-white">
                {samplePreview.selectedGamesCount} {t("analysisWizard.games")}
              </span>
              {" · "}
              <span className="font-semibold text-white">{samplePreview.estimatedLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0 || isSubmitting}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("analysisWizard.back")}
              </button>

              {stepIndex < wizardSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((current) => current + 1)}
                  disabled={!canContinue || isSubmitting}
                  className="rounded-2xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("analysisWizard.next")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t("analysisWizard.starting") : t("analysisWizard.confirm")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
