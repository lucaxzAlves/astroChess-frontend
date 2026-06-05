import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnalysisSetupWizard, {
  DEFAULT_ANALYSIS_CONFIG,
} from "../components/coach/AnalysisSetupWizard.jsx";
import CoachOnboardingQuiz from "../components/coach/CoachOnboardingQuiz.jsx";
import CoachTrainingPlan from "../components/coach/trainingPlan/CoachTrainingPlan.jsx";
import GeneralAnalysisCard from "../components/coach/GeneralAnalysisCard.jsx";
import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  SectionHeading,
} from "../components/profileDelta/ProfileDeltaUi.jsx";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import {
  getAnalyzedGameIds,
  getAnalysisBatchStatus,
  startGeneralAnalysis,
  triggerAnalysisBatchProfileUpdate,
} from "../services/batchAnalysisApi.js";
import {
  getMyPlayerProfileVersion,
  getMyPlayerProfileVersionProfileView,
  getMyPlayerProfileVersions,
  restoreMyPlayerProfileVersion,
  updateMyPlayerProfilePreferences,
} from "../services/playerProfile.service";
import {
  buildAnalysisBatchGamesInput,
  buildSelectionPreview,
} from "../utils/analysisBatchSelection.js";
import {
  buildCoachOnboardingProfileFromPlayerProfile,
  mapCoachOnboardingToProfilePreferences,
} from "../utils/coachOnboardingProfile.js";
import { normalizePlayerProfileForUI } from "../utils/playerProfileMapper.js";
import { buildTrainingPlanViewModel } from "../utils/trainingPlanViewModel.js";
import { getUserFriendlyError } from "../utils/userFriendlyErrors.js";

const labelMaps = {
  mainGoal: {
    gain_rating: "Gain rating",
    prepare_tournaments: "Prepare for tournaments",
    improve_calculation: "Improve calculation",
    fix_blunders: "Fix blunders",
    improve_openings: "Improve openings",
    improve_endgames: "Improve endgames",
  },
  currentLevel: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced_club_player: "Advanced club player",
    competitive_player: "Competitive player",
    titled_or_near_titled: "Titled / near titled",
  },
  perceivedPlayingStyle: {
    tactical_aggressive: "Tactical and aggressive",
    positional_strategic: "Positional and strategic",
    solid_defensive: "Solid and defensive",
    dynamic_practical: "Dynamic and practical",
    unknown: "Still being discovered",
  },
  perceivedWeakness: {
    time_pressure: "Time pressure",
    tactical_blunders: "Tactical blunders",
    poor_openings: "Poor openings",
    endgame_technique: "Endgame technique",
    psychological_tilt: "Psychological tilt",
    converting_winning_positions: "Converting winning positions",
  },
  coachTone: {
    direct_demanding: "Direct and demanding",
    calm_explanatory: "Calm and explanatory",
    strategic_deep: "Strategic and deep",
    practical_objective: "Practical and objective",
    motivational: "Motivational",
  },
};

const coachToneProfiles = {
  direct_demanding: {
    name: "Coach Orion",
    quote: "I will not flatter your mistakes. I will turn them into training material.",
    specialization: "High-accountability diagnosis",
    tags: ["Practical decisions", "Time management", "Tournament discipline"],
    accent: "from-rose-400 via-purple-400 to-fuchsia-300",
  },
  calm_explanatory: {
    name: "Coach Lyra",
    quote: "We will slow the chaos down until every mistake becomes understandable and fixable.",
    specialization: "Clear explanation and stable growth",
    tags: ["Calculation", "Pattern building", "Structured improvement"],
    accent: "from-cyan-300 via-purple-400 to-fuchsia-300",
  },
  strategic_deep: {
    name: "Coach Vega",
    quote: "Every move belongs to a plan. We will train the plan, not only the symptom.",
    specialization: "Strategic planning and positional clarity",
    tags: ["Strategy", "Opening plans", "Endgames"],
    accent: "from-purple-300 via-fuchsia-400 to-indigo-300",
  },
  practical_objective: {
    name: "Coach Atlas",
    quote: "We care about better decisions under real conditions, not beautiful theory in isolation.",
    specialization: "Actionable improvement with measurable signals",
    tags: ["Practical play", "Decision patterns", "Rapid correction"],
    accent: "from-violet-300 via-purple-400 to-emerald-300",
  },
  motivational: {
    name: "Coach Nova",
    quote: "Momentum matters. We will turn your strengths into confidence and your leaks into progress.",
    specialization: "Confidence-building and momentum training",
    tags: ["Confidence", "Recovery", "Consistency"],
    accent: "from-fuchsia-300 via-purple-400 to-amber-300",
  },
};

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const ANALYSIS_POLL_INTERVAL_MS = 3000;
const MIN_ANALYSIS_POLL_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_ANALYSIS_POLL_TIMEOUT_MS = 75 * 60 * 1000;
const PROFILE_UPDATE_BUFFER_MS = 5 * 60 * 1000;

function getAnalysisPollTimeoutMs(sample) {
  const estimatedSeconds = Number(sample?.estimatedSeconds);
  const estimatedMs = Number.isFinite(estimatedSeconds) ? estimatedSeconds * 1000 : 0;

  return Math.min(
    MAX_ANALYSIS_POLL_TIMEOUT_MS,
    Math.max(MIN_ANALYSIS_POLL_TIMEOUT_MS, estimatedMs + PROFILE_UPDATE_BUFFER_MS)
  );
}

function createAnalysisPollTimeoutError(batchId) {
  const error = new Error(
    "O AstroChess ainda está processando este perfil. Você pode manter esta página aberta ou atualizar a Análise em alguns minutos."
  );
  error.code = "ANALYSIS_POLL_TIMEOUT";
  error.batchId = batchId;
  return error;
}

function formatMinutes(value) {
  if (!value) return "Não definido";
  return value >= 90 ? "90+ minutos" : `${value} minutos`;
}

function formatDate(value) {
  if (!value) return "Ainda não criado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function titleizeKey(value = "") {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getVersionStorageKey(userId) {
  return `auraChess.aiCoach.profileVersion.${userId || "anonymous"}`;
}

function getVersionTitle(version) {
  if (!version) return "Perfil atual";
  return version.label || `Versão do perfil ${version.versionNumber || ""}`.trim();
}

function getVersionSourceLabel(source) {
  const labels = {
    manual_snapshot: "Snapshot manual",
    before_batch_update: "Antes do lote",
    after_batch_update: "Depois do lote",
    restore: "Perfil restaurado",
    system: "Sistema",
  };

  return labels[source] || titleizeKey(source || "Versão");
}

function getChangeSummaryItems(summary) {
  if (!summary || typeof summary !== "object") {
    return [];
  }

  const items = [];

  if (Array.isArray(summary.skillMapChanges)) {
    summary.skillMapChanges.forEach((change) => {
      const from =
        change?.previousValue === undefined || change?.previousValue === null
          ? "novo"
          : `${Math.round(Number(change.previousValue))}`;
      const to =
        change?.newValue === undefined || change?.newValue === null
          ? "removido"
          : `${Math.round(Number(change.newValue))}`;

      items.push({
        tone: Number(change?.newValue || 0) >= Number(change?.previousValue || 0) ? "emerald" : "rose",
        label: `${titleizeKey(change?.key)}: ${from} -> ${to}`,
      });
    });
  }

  if (summary.playingStyleChanged) {
    items.push({
      tone: "purple",
        label: `Estilo de jogo: ${titleizeKey(summary.previousPrimaryStyle || "desconhecido")} -> ${titleizeKey(
        summary.newPrimaryStyle || "desconhecido"
      )}`,
    });
  }

  if (summary.currentFocusChanged) {
    items.push({
      tone: "purple",
        label: `Foco: ${summary.previousCurrentFocus || "nenhum"} -> ${
        summary.newCurrentFocus || "nenhum"
      }`,
    });
  }

  if (summary.criticalPhaseChanged) {
    items.push({
      tone: "yellow",
        label: `Fase crítica: ${titleizeKey(summary.previousCriticalPhase || "nenhuma")} -> ${titleizeKey(
        summary.newCriticalPhase || "nenhuma"
      )}`,
    });
  }

  [
    ["newRecurringMistakes", "Novo erro", "rose"],
    ["removedRecurringMistakes", "Erro removido", "emerald"],
    ["updatedRecurringMistakes", "Erro atualizado", "yellow"],
    ["newStrengths", "Novo ponto forte", "emerald"],
    ["updatedStrengths", "Ponto forte atualizado", "purple"],
  ].forEach(([key, label, tone]) => {
    if (!Array.isArray(summary[key])) return;
    summary[key].forEach((value) => {
      items.push({
        tone,
        label: `${label}: ${titleizeKey(value)}`,
      });
    });
  });

  return items;
}

function getSpecializationFromGoal(goal) {
  const map = {
    gain_rating: "Sistemas de ganho de rating",
    prepare_tournaments: "Preparação para torneios",
    improve_calculation: "Cálculo e lances candidatos",
    fix_blunders: "Prevenção de capivaradas",
    improve_openings: "Reparo do perfil de aberturas",
    improve_endgames: "Técnica de finais",
  };
  return map[goal] || "Diagnóstico completo de xadrez";
}

function buildCoachIdentity(profile) {
  const toneProfile =
    coachToneProfiles[profile?.coachTone] || coachToneProfiles.practical_objective;
  const specialization = getSpecializationFromGoal(profile?.mainGoal);
  const weaknessTag = labelMaps.perceivedWeakness[profile?.perceivedWeakness];
  const goalTag = labelMaps.mainGoal[profile?.mainGoal];

  return {
    ...toneProfile,
    specialization,
    tags: [goalTag, weaknessTag, ...toneProfile.tags].filter(Boolean).slice(0, 5),
  };
}

function getBatchStatusMessage(statusPayload) {
  const batchStatus = statusPayload?.status;
  const processedGames = statusPayload?.processedGames || 0;
  const totalGames = statusPayload?.totalGames || 0;

  if (batchStatus === "pending") {
    return "Preparando seu diagnóstico de xadrez...";
  }

  if (batchStatus === "processing") {
    return `Analisando erros recorrentes... ${processedGames}/${totalGames} partidas processadas.`;
  }

  if (batchStatus === "awaiting_profile_update") {
    return "Análise técnica concluída. Criando seu perfil de jogador agora...";
  }

  if (batchStatus === "profile_update_processing") {
    return "Criando seu perfil de jogador e recomendações do coach...";
  }

  if (batchStatus === "completed" || batchStatus === "completed_with_errors") {
    return "Análise técnica concluída. Finalizando seu perfil de jogador...";
  }

  if (batchStatus === "profile_updated") {
    return "Seu perfil de xadrez está pronto.";
  }

  if (batchStatus === "profile_update_failed") {
    return "A geração do perfil falhou depois que o lote foi concluído.";
  }

  return "Analisando as partidas selecionadas...";
}

function mergeDraftWithSample(draft, sample, userId) {
  return {
    ...draft,
    userId: userId || null,
    estimated: {
      selectedGamesCount: sample?.selectedGamesCount ?? draft?.estimated?.selectedGamesCount ?? 0,
      secondsPerGame: sample?.secondsPerGame ?? draft?.estimated?.secondsPerGame ?? 30,
      estimatedSeconds: sample?.estimatedSeconds ?? draft?.estimated?.estimatedSeconds ?? 0,
      estimatedLabel: sample?.estimatedLabel ?? draft?.estimated?.estimatedLabel ?? "Pendente",
    },
    selectedGameSample: {
      timeControlBreakdown: sample?.timeControlBreakdown || [],
      resultBreakdown: sample?.resultBreakdown || [],
      colorBreakdown: sample?.colorBreakdown || [],
      isEstimated: Boolean(sample?.isEstimated),
      note: sample?.note || "",
    },
  };
}

function buildBatchOptions(config, connectedUsername) {
  const singleTimeControl =
    config?.filters?.timeControls?.length === 1 ? config.filters.timeControls[0] : undefined;

  return {
    includeAiReview: true,
    updateProfileAfterBatch: true,
    targetPlayer: {
      username: connectedUsername || undefined,
      platform: "chess.com",
    },
    timeControl: singleTimeControl,
    source: "chess.com",
  };
}

function SnapshotItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function DraftReadyCard({ draft, success, onOpenAnalysis }) {
  if (!draft) return null;

  return (
    <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/8 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald">
              {success ? "Seu perfil de xadrez está pronto" : "Configuração de análise pronta"}
            </Badge>
            <Badge tone="slate">{formatDate(draft.createdAt)}</Badge>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">
            {success
              ? "O AstroChess terminou a análise geral e seu perfil de jogador está pronto."
              : "A configuração atual está pronta para começar."}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Esta configuração mira {draft.estimated?.selectedGamesCount} partidas e deve levar{" "}
            {draft.estimated?.estimatedLabel?.toLowerCase()} para processar.{" "}
            {draft.selectedGameSample?.note || ""}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
          <p>
            Fonte: <span className="font-semibold text-white">{draft.source}</span>
          </p>
          <p className="mt-2">
            Usuário:{" "}
            <span className="font-semibold text-white">{draft.username || "Ainda não conectado"}</span>
          </p>
          {success?.batchId ? (
            <p className="mt-2">
              ID do lote: <span className="font-semibold text-white">{success.batchId}</span>
            </p>
          ) : null}
          {success ? (
            <button
              type="button"
              onClick={onOpenAnalysis}
              className="mt-4 w-full rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              Ver Análise
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RunStatusCard({ flow }) {
  if (!flow || flow.state === "idle" || flow.state === "completed") {
    return null;
  }

  const isFailed = flow.state === "failed";
  const statusLabel =
    flow.state === "preparing"
      ? "Preparando"
      : flow.state === "sending"
        ? "Enviando"
        : flow.state === "analyzing"
          ? "Analisando"
          : flow.state === "waiting"
            ? "Ainda rodando"
            : "Trabalhando";
  const tone =
    isFailed
      ? "border-rose-400/25 bg-rose-500/10"
      : "border-purple-400/25 bg-purple-500/10";

  return (
    <Card className={`${tone} p-5`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isFailed ? "rose" : "purple"}>{isFailed ? "Falhou" : statusLabel}</Badge>
            {flow.batchId ? <Badge tone="slate">Lote {flow.batchId}</Badge> : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">
            {flow.message ||
              (isFailed
                ? "A análise do perfil falhou."
                : "Sua análise geral está em andamento.")}
          </h3>
          {flow.error ? (
            <p className="mt-2 text-sm leading-6 text-rose-100/90">{flow.error}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Você pode continuar usando a página enquanto o AstroChess processa o lote selecionado.
            </p>
          )}
        </div>

        {!isFailed ? (
          <div className="min-w-[240px] rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fase atual</p>
            <p className="mt-2 text-sm font-semibold text-white">{flow.message}</p>
            <ProgressBar value={66} className="mt-4" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function ProfileConnectionCard({ connectedUsername, profileData, profileLoading, profileError }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-purple-300">Resumo do perfil do jogador</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Perfil do backend e contexto de treino
          </h2>
        </div>
        <Badge tone={profileData?.meta?.hasMeaningfulProfile ? "emerald" : "slate"}>
          {profileData?.meta?.hasMeaningfulProfile ? "Perfil ativo" : "Perfil ainda não gerado"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <SnapshotItem label="Fonte conectada" value={connectedUsername || "Não conectado"} />
        <SnapshotItem
          label="Partidas analisadas"
          value={profileData?.meta?.totalGamesAnalyzed || "Nenhum lote ainda"}
        />
        <SnapshotItem
          label="Última atualização do perfil"
          value={formatDate(profileData?.meta?.lastProfileUpdateAt)}
        />
        <SnapshotItem
          label="Confiança do perfil"
          value={
            profileData?.profileConfidence?.overall
              ? `${profileData.profileConfidence.overall}%`
              : "Pendente"
          }
        />
      </div>

      {profileLoading ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-sm text-slate-300">Atualizando perfil do jogador...</p>
          <ProgressBar value={72} className="mt-3" />
        </div>
      ) : null}

      {profileError ? (
        <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100/90">
          {profileError}
        </div>
      ) : null}
    </Card>
  );
}

function ProfileVersionChanges({ changesSummary }) {
  const items = getChangeSummaryItems(changesSummary);

  if (!items.length) {
    return (
      <EmptyState label="Nenhuma mudança estruturada foi registrada para esta versão ainda." />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.slice(0, 10).map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="rounded-2xl border border-white/10 bg-slate-950/45 p-3"
        >
          <Badge tone={item.tone}>{item.label}</Badge>
        </div>
      ))}
    </div>
  );
}

function ProfileVersionPanel({
  versions = [],
  selectedVersionId = "current",
  selectedVersionDetails = null,
  historicalView = null,
  loading = false,
  error = "",
  restoring = false,
  onSelectVersion,
  onRefreshVersions,
  onRestoreVersion,
}) {
  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const selectedChanges =
    selectedVersionDetails?.changesSummary || selectedVersion?.changesSummary || null;
  const isHistorical = selectedVersionId !== "current";

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isHistorical ? "yellow" : "emerald"}>
              {isHistorical ? "Perfil histórico" : "Perfil principal"}
            </Badge>
            {historicalView?.createdAt ? (
              <Badge tone="slate">{formatDate(historicalView.createdAt)}</Badge>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Versões do perfil</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Escolha um perfil antigo para ver o AI Coach como ele era, comparar mudanças
            registradas ou restaurar essa versão como perfil principal.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshVersions}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-500/30 hover:text-white"
        >
          Atualizar versões
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-sm text-slate-300">Carregando versões do perfil...</p>
          <ProgressBar value={62} className="mt-3" />
        </div>
      ) : null}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectVersion("current")}
            className={[
              "w-full rounded-2xl border p-4 text-left transition",
              selectedVersionId === "current"
                ? "border-emerald-400/35 bg-emerald-400/10"
                : "border-white/10 bg-white/[0.03] hover:border-purple-500/30",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Perfil principal atual</p>
              <Badge tone="emerald">Ativo</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-400">Carregado de /player-profile/me</p>
          </button>

          {versions.map((version) => {
            const selected = version.id === selectedVersionId;

            return (
              <button
                key={version.id}
                type="button"
                onClick={() => onSelectVersion(version.id)}
                className={[
                  "w-full rounded-2xl border p-4 text-left transition",
                  selected
                    ? "border-purple-400/40 bg-purple-500/14"
                    : "border-white/10 bg-white/[0.03] hover:border-purple-500/30",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={version.status === "current" ? "emerald" : "slate"}>
                    v{version.versionNumber}
                  </Badge>
                  <Badge tone={version.source === "restore" ? "yellow" : "purple"}>
                    {getVersionSourceLabel(version.source)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  {getVersionTitle(version)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(version.createdAt)}</p>
                {version.gamesAnalyzed ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {version.gamesAnalyzed} partidas analisadas
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Perfil selecionado
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {isHistorical ? getVersionTitle(selectedVersion) : "Perfil principal atual"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {isHistorical
                  ? selectedVersionDetails?.description ||
                    selectedVersion?.description ||
                    "Snapshot histórico carregado."
                  : "Este é o perfil ativo usado pelo AstroChess hoje."}
              </p>
            </div>

            {isHistorical ? (
              <button
                type="button"
                onClick={() => onRestoreVersion(selectedVersionId)}
                disabled={restoring}
                className="rounded-2xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {restoring ? "Restaurando..." : "Tornar perfil principal"}
              </button>
            ) : null}
          </div>

          {isHistorical ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Versão</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  v{selectedVersion?.versionNumber || historicalView?.versionNumber || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Data</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {formatDate(selectedVersion?.createdAt || historicalView?.createdAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fonte</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {getVersionSourceLabel(selectedVersion?.source || historicalView?.source)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold text-white">Mudanças registradas</p>
            <ProfileVersionChanges changesSummary={selectedChanges} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function CoachReadinessStrip({ profileData }) {
  const confidence = profileData?.profileConfidence?.overall || 0;
  const recurringMistakes = profileData?.recurringMistakes?.length || 0;
  const strengths = profileData?.strengths?.length || 0;
  const blockers = profileData?.growthBlockers?.length || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Confiança do coach", confidence ? `${confidence}%` : "Pendente"],
        ["Erros recorrentes", recurringMistakes || "Pendente"],
        ["Pontos fortes", strengths || "Pendente"],
        ["Bloqueadores", blockers || "Pendente"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-lg font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function AICoach({
  connectedUsername = "",
  userId = "",
  playerGames = [],
  profileData = null,
  rawPlayerProfile = null,
  profileLoading = false,
  profileError = "",
  onRefreshProfile,
  onEnsureGamesLoaded,
  onOpenAnalysis,
}) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [profileVersions, setProfileVersions] = useState([]);
  const [selectedProfileVersionId, setSelectedProfileVersionId] = useState("current");
  const [selectedVersionDetails, setSelectedVersionDetails] = useState(null);
  const [historicalProfileView, setHistoricalProfileView] = useState(null);
  const [profileVersionsLoading, setProfileVersionsLoading] = useState(false);
  const [profileVersionsError, setProfileVersionsError] = useState("");
  const [isRestoringProfileVersion, setIsRestoringProfileVersion] = useState(false);
  const [analyzedGameIds, setAnalyzedGameIds] = useState([]);
  const [analyzedGameIdsLoading, setAnalyzedGameIdsLoading] = useState(false);
  const [analyzedGameIdsError, setAnalyzedGameIdsError] = useState("");
  const analyzedGameIdsRef = useRef([]);
  const selectedVersionStorageKey = useMemo(() => getVersionStorageKey(userId), [userId]);
  const effectiveRawPlayerProfile = historicalProfileView?.profile || rawPlayerProfile;
  const effectiveProfileData = useMemo(
    () =>
      historicalProfileView?.profile
        ? normalizePlayerProfileForUI(historicalProfileView.profile)
        : profileData,
    [historicalProfileView, profileData]
  );
  const derivedCoachProfile = useMemo(
    () => buildCoachOnboardingProfileFromPlayerProfile(effectiveRawPlayerProfile),
    [effectiveRawPlayerProfile]
  );
  const [hasCompletedCoachQuiz, setHasCompletedCoachQuiz] = useState(
    Boolean(derivedCoachProfile)
  );
  const [coachOnboardingProfile, setCoachOnboardingProfile] = useState(
    derivedCoachProfile || null
  );
  const [isAnalysisWizardOpen, setIsAnalysisWizardOpen] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState(DEFAULT_ANALYSIS_CONFIG);
  const [generalAnalysisRequestDraft, setGeneralAnalysisRequestDraft] = useState(null);
  const [analysisFlow, setAnalysisFlow] = useState({
    state: "idle",
    message: "",
    error: "",
    batchId: "",
  });
  const [analysisSuccess, setAnalysisSuccess] = useState(null);
  const [coachSetupError, setCoachSetupError] = useState("");
  const [isSavingCoachPreferences, setIsSavingCoachPreferences] = useState(false);
  const [hasDismissedSavedQuiz, setHasDismissedSavedQuiz] = useState(false);

  useEffect(() => {
    analyzedGameIdsRef.current = analyzedGameIds;
  }, [analyzedGameIds]);

  useEffect(() => {
    if (hasDismissedSavedQuiz || !derivedCoachProfile) {
      return;
    }

    setCoachOnboardingProfile(derivedCoachProfile);
    setHasCompletedCoachQuiz(true);
  }, [derivedCoachProfile, hasDismissedSavedQuiz]);

  const hasRealProfile = Boolean(effectiveProfileData?.meta?.hasMeaningfulProfile);
  const isViewingHistoricalProfile = Boolean(historicalProfileView?.profile);
  const coachIdentity = useMemo(
    () => buildCoachIdentity(coachOnboardingProfile),
    [coachOnboardingProfile]
  );
  const trainingPlanViewModel = useMemo(
    () => buildTrainingPlanViewModel(effectiveProfileData),
    [effectiveProfileData]
  );

  const snapshotItems = useMemo(
    () => [
      ["Objetivo", labelMaps.mainGoal[coachOnboardingProfile?.mainGoal] || "Não definido"],
      ["Nível", labelMaps.currentLevel[coachOnboardingProfile?.currentLevel] || "Não definido"],
      [
        "Estilo de jogo",
        labelMaps.perceivedPlayingStyle[coachOnboardingProfile?.perceivedPlayingStyle] ||
          "Não definido",
      ],
      [
        "Fraqueza percebida",
        labelMaps.perceivedWeakness[coachOnboardingProfile?.perceivedWeakness] || "Não definido",
      ],
      ["Tempo de treino", formatMinutes(coachOnboardingProfile?.dailyTrainingMinutes)],
      ["Tom do coach", labelMaps.coachTone[coachOnboardingProfile?.coachTone] || "Não definido"],
    ],
    [coachOnboardingProfile]
  );

  const handleProtectedRequestError = useCallback(
    async (error) => {
      const message = error instanceof Error ? error.message : "";

      if (!message.includes("Não autorizado")) {
        return false;
      }

      await logout();
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
      return true;
    },
    [logout]
  );

  const loadProfileVersions = useCallback(async () => {
    setProfileVersionsLoading(true);
    setProfileVersionsError("");

    try {
      const response = await getMyPlayerProfileVersions();
      setProfileVersions(Array.isArray(response?.items) ? response.items : []);
    } catch (error) {
      const unauthorized = await handleProtectedRequestError(error);
      if (!unauthorized) {
        setProfileVersionsError(getUserFriendlyError(error, "Não foi possível carregar as versões do perfil."));
      }
    } finally {
      setProfileVersionsLoading(false);
    }
  }, [handleProtectedRequestError]);

  const loadAnalyzedGameIds = useCallback(async () => {
    setAnalyzedGameIdsLoading(true);
    setAnalyzedGameIdsError("");

    try {
      const response = await getAnalyzedGameIds({ source: "chess.com", scope: "batch" });
      const ids = Array.isArray(response?.gameIds)
        ? response.gameIds
        : Array.isArray(response?.items)
          ? response.items.map((item) => item?.gameId)
          : [];
      const normalizedIds = ids.map((id) => String(id || "").trim()).filter(Boolean);

      setAnalyzedGameIds(normalizedIds);
      return normalizedIds;
    } catch (error) {
      const unauthorized = await handleProtectedRequestError(error);
      if (!unauthorized) {
        setAnalyzedGameIdsError(
          getUserFriendlyError(error, "Não foi possível verificar as partidas já analisadas.")
        );
      }
      return analyzedGameIdsRef.current;
    } finally {
      setAnalyzedGameIdsLoading(false);
    }
  }, [handleProtectedRequestError]);

  const selectProfileVersion = useCallback(
    async (versionId, options = {}) => {
      const nextVersionId = versionId || "current";
      const { persist = true } = options;

      setProfileVersionsError("");
      setSelectedProfileVersionId(nextVersionId);

      if (persist) {
        window.localStorage.setItem(selectedVersionStorageKey, nextVersionId);
      }

      if (nextVersionId === "current") {
        setHistoricalProfileView(null);
        setSelectedVersionDetails(null);
        return;
      }

      setProfileVersionsLoading(true);

      try {
        const [profileView, details] = await Promise.all([
          getMyPlayerProfileVersionProfileView(nextVersionId),
          getMyPlayerProfileVersion(nextVersionId),
        ]);

        setHistoricalProfileView(profileView);
        setSelectedVersionDetails(details);
      } catch (error) {
        const unauthorized = await handleProtectedRequestError(error);
        if (!unauthorized) {
          setProfileVersionsError(
            getUserFriendlyError(error, "Não foi possível carregar essa versão do perfil.")
          );
          setSelectedProfileVersionId("current");
          setHistoricalProfileView(null);
          setSelectedVersionDetails(null);
          window.localStorage.setItem(selectedVersionStorageKey, "current");
        }
      } finally {
        setProfileVersionsLoading(false);
      }
    },
    [handleProtectedRequestError, selectedVersionStorageKey]
  );

  const restoreProfileVersion = useCallback(
    async (versionId) => {
      if (!versionId || versionId === "current") {
        return;
      }

      setIsRestoringProfileVersion(true);
      setProfileVersionsError("");

      try {
        await restoreMyPlayerProfileVersion(versionId);
        window.localStorage.setItem(selectedVersionStorageKey, "current");
        setSelectedProfileVersionId("current");
        setHistoricalProfileView(null);
        setSelectedVersionDetails(null);
        await onRefreshProfile?.();
        await loadProfileVersions();
        setAnalysisFlow({
          state: "completed",
          message: "Versão do perfil restaurada como perfil principal.",
          error: "",
          batchId: "",
        });
      } catch (error) {
        const unauthorized = await handleProtectedRequestError(error);
        if (!unauthorized) {
          setProfileVersionsError(getUserFriendlyError(error, "Não foi possível restaurar essa versão do perfil."));
        }
      } finally {
        setIsRestoringProfileVersion(false);
      }
    },
    [
      handleProtectedRequestError,
      loadProfileVersions,
      onRefreshProfile,
      selectedVersionStorageKey,
    ]
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    void loadProfileVersions();
    void loadAnalyzedGameIds();
  }, [loadAnalyzedGameIds, loadProfileVersions, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const savedVersionId = window.localStorage.getItem(selectedVersionStorageKey) || "current";
    void selectProfileVersion(savedVersionId, { persist: false });
  }, [selectProfileVersion, selectedVersionStorageKey, userId]);

  const computeSamplePreview = useCallback(
    (config) => {
      if (!connectedUsername) {
        return buildSelectionPreview({
          games: [],
          connectedUsername,
          filters: config?.filters,
          excludedGameIds: analyzedGameIds,
          isEstimated: true,
          note: "Conecte sua conta Chess.com na Home antes de iniciar uma análise geral.",
        });
      }

      const preview = buildSelectionPreview({
        games: playerGames,
        connectedUsername,
        filters: config?.filters,
        excludedGameIds: analyzedGameIds,
        isEstimated: playerGames.length === 0,
        note:
          playerGames.length === 0
            ? "Nenhuma partida local foi carregada ainda. O app buscará os arquivos quando você confirmar a configuração."
            : analyzedGameIdsLoading
              ? "Verificando quais partidas já foram analisadas..."
              : analyzedGameIdsError
                ? `Não foi possível verificar partidas já analisadas: ${analyzedGameIdsError}`
                : "",
      });

      if (playerGames.length > 0 && preview.selectedGames.length === 0) {
        return {
          ...preview,
          isEstimated: true,
          note:
            preview.excludedAlreadyAnalyzedGamesCount > 0
              ? "Todas as partidas carregadas que combinam com os filtros já foram analisadas. O app tentará carregar mais arquivos na confirmação."
              : "Nenhuma partida carregada combina com estes filtros. O app tentará carregar mais arquivos na confirmação.",
        };
      }

      if (preview.excludedAlreadyAnalyzedGamesCount > 0) {
        return {
          ...preview,
          note: `${preview.excludedAlreadyAnalyzedGamesCount} partida${
            preview.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"
          } já analisada${preview.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"} removida${preview.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"} desta seleção.`,
        };
      }

      return preview;
    },
    [analyzedGameIds, analyzedGameIdsError, analyzedGameIdsLoading, connectedUsername, playerGames]
  );

  const loadAnalysisSamplePreview = useCallback(
    async (config) => {
      if (!connectedUsername) {
        return buildSelectionPreview({
          games: [],
          connectedUsername,
          filters: config?.filters,
          excludedGameIds: analyzedGameIdsRef.current,
          isEstimated: true,
          note: "Conecte sua conta Chess.com na Home antes de iniciar uma análise geral.",
        });
      }

      const latestAnalyzedGameIds = await loadAnalyzedGameIds();
      const availableGames =
        (await onEnsureGamesLoaded?.(config?.filters, latestAnalyzedGameIds)) || [];
      const preview = buildSelectionPreview({
        games: availableGames,
        connectedUsername,
        filters: config?.filters,
        excludedGameIds: latestAnalyzedGameIds,
        isEstimated: false,
        note: "",
      });

      if (preview.excludedAlreadyAnalyzedGamesCount > 0) {
        return {
          ...preview,
          note: `${preview.excludedAlreadyAnalyzedGamesCount} partida${
            preview.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"
          } já analisada${preview.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"} removida${preview.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"} desta seleção.`,
        };
      }

      if (!preview.selectedGames.length) {
        return {
          ...preview,
          note: "Nenhuma partida disponível combina com estes filtros após verificar seus arquivos do Chess.com.",
        };
      }

      return preview;
    },
    [connectedUsername, loadAnalyzedGameIds, onEnsureGamesLoaded]
  );

  const persistCoachPreferences = useCallback(
    async (profile) => {
      if (!profile) {
        return;
      }

      setIsSavingCoachPreferences(true);
      setCoachSetupError("");

      try {
        await updateMyPlayerProfilePreferences(
          mapCoachOnboardingToProfilePreferences(profile)
        );
        await onRefreshProfile?.({ silent: true });
      } catch (error) {
        const unauthorized = await handleProtectedRequestError(error);
        if (!unauthorized) {
          setCoachSetupError(
            getUserFriendlyError(
              error,
              "Não foi possível salvar suas preferências agora, mas a configuração local continua disponível.",
            )
          );
        }
      } finally {
        setIsSavingCoachPreferences(false);
      }
    },
    [handleProtectedRequestError, onRefreshProfile]
  );

  const pollBatchUntilReady = useCallback(
    async (batchId, sample) => {
      let manualProfileUpdateTriggered = false;
      const timeoutMs = getAnalysisPollTimeoutMs(sample);
      const startedAt = Date.now();

      while (Date.now() - startedAt < timeoutMs) {
        const statusPayload = await getAnalysisBatchStatus({ userId, batchId });
        const batchStatus = statusPayload?.status;
        const profileStatus = statusPayload?.profileUpdate?.status;

        setAnalysisFlow({
          state: "analyzing",
          message: getBatchStatusMessage(statusPayload),
          error: "",
          batchId,
        });

        const shouldTriggerManualProfileUpdate =
          !manualProfileUpdateTriggered &&
          (batchStatus === "awaiting_profile_update" ||
            profileStatus === "skipped" ||
            ((batchStatus === "completed" || batchStatus === "completed_with_errors") &&
              profileStatus !== "completed"));

        if (shouldTriggerManualProfileUpdate) {
          manualProfileUpdateTriggered = true;
          setAnalysisFlow({
            state: "analyzing",
            message: "Criando seu perfil de jogador...",
            error: "",
            batchId,
          });

          const manualUpdateResult = await triggerAnalysisBatchProfileUpdate({
            userId,
            batchId,
          });

          if (manualUpdateResult?.enabled === false) {
            throw new Error(
              manualUpdateResult?.message ||
                "A atualização do perfil está indisponível agora."
            );
          }
        }

        if (batchStatus === "profile_updated" || profileStatus === "completed") {
          return statusPayload;
        }

        if (
          batchStatus === "failed" ||
          batchStatus === "profile_update_failed" ||
          profileStatus === "failed"
        ) {
          throw new Error(
            statusPayload?.profileUpdate?.error ||
              statusPayload?.errors?.[0]?.message ||
              "A análise do perfil falhou. Tente uma seleção menor."
          );
        }

        const remainingMs = timeoutMs - (Date.now() - startedAt);

        if (remainingMs <= 0) {
          break;
        }

        await sleep(Math.min(ANALYSIS_POLL_INTERVAL_MS, remainingMs));
      }

      throw createAnalysisPollTimeoutError(batchId);
    },
    [userId]
  );

  const handleAnalysisConfirm = useCallback(
    async (draft, nextConfig) => {
      setAnalysisConfig(nextConfig);
      setAnalysisSuccess(null);
      setCoachSetupError("");
      let activeBatchId = "";

      if (!connectedUsername) {
        setAnalysisFlow({
          state: "failed",
          message: "Não foi possível iniciar a análise do perfil.",
          error: "Conecte seu usuário Chess.com na Home antes de iniciar a análise geral.",
          batchId: "",
        });
        return;
      }

      try {
        setAnalysisFlow({
          state: "preparing",
          message: "Preparando seu diagnóstico de xadrez...",
          error: "",
          batchId: "",
        });

        const latestAnalyzedGameIds = await loadAnalyzedGameIds();
        const availableGames = await onEnsureGamesLoaded?.(
          nextConfig.filters,
          latestAnalyzedGameIds
        );
        const sample = buildSelectionPreview({
          games: availableGames || playerGames,
          connectedUsername,
          filters: nextConfig.filters,
          excludedGameIds: latestAnalyzedGameIds,
          isEstimated: false,
          note:
            latestAnalyzedGameIds.length > 0
              ? "Partidas já analisadas foram removidas antes de enviar este lote."
              : "",
        });

        if (!sample.selectedGames.length) {
          throw new Error("Nenhuma partida combinou com estes filtros.");
        }

        if (sample.excludedAlreadyAnalyzedGamesCount > 0) {
          const shouldContinue = window.confirm(
            `${sample.excludedAlreadyAnalyzedGamesCount} partida${
              sample.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"
            } já analisada${sample.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"} foi removida${sample.excludedAlreadyAnalyzedGamesCount === 1 ? "" : "s"} deste lote. Enviar apenas ${sample.selectedGames.length} partida${
              sample.selectedGames.length === 1 ? "" : "s"
            } nova${sample.selectedGames.length === 1 ? "" : "s"}?`
          );

          if (!shouldContinue) {
            setAnalysisFlow({
              state: "idle",
              message: "",
              error: "",
              batchId: "",
            });
            return;
          }
        }

        const gamesPayload = buildAnalysisBatchGamesInput(
          sample.selectedGames,
          connectedUsername
        );

        if (!gamesPayload.length) {
          throw new Error("Nenhuma partida com PGN estava disponível para esta seleção.");
        }

        const finalizedDraft = mergeDraftWithSample(draft, sample, userId);
        setGeneralAnalysisRequestDraft(finalizedDraft);

        setAnalysisFlow({
          state: "sending",
          message: "Enviando partidas para análise...",
          error: "",
          batchId: "",
        });

        const batchResult = await startGeneralAnalysis({
          userId,
          games: gamesPayload,
          options: buildBatchOptions(nextConfig, connectedUsername),
        });

        if (!batchResult?.batchId) {
          throw new Error("A análise não pôde ser iniciada agora.");
        }

        activeBatchId = batchResult.batchId;
        setAnalysisFlow({
          state: "analyzing",
          message: "Analisando erros recorrentes...",
          error: "",
          batchId: batchResult.batchId,
        });

        const finalStatus = await pollBatchUntilReady(batchResult.batchId, sample);
        await onRefreshProfile?.();
        await loadProfileVersions();
        await loadAnalyzedGameIds();

        setAnalysisSuccess({
          batchId: batchResult.batchId,
          totalGames: finalStatus?.totalGames || sample.selectedGamesCount,
          successfulGames: finalStatus?.successfulGames ?? sample.selectedGamesCount,
          finishedAt: finalStatus?.finishedAt || new Date().toISOString(),
        });
        setAnalysisFlow({
          state: "completed",
          message: "Seu perfil de xadrez está pronto.",
          error: "",
          batchId: batchResult.batchId,
        });
        setIsAnalysisWizardOpen(false);
      } catch (error) {
        const unauthorized = await handleProtectedRequestError(error);
        if (unauthorized) {
          return;
        }

        if (error?.code === "ANALYSIS_POLL_TIMEOUT") {
          await onRefreshProfile?.({ silent: true });
          await loadProfileVersions();
          setAnalysisFlow({
            state: "waiting",
            message: "O AstroChess ainda está processando este perfil.",
            error: "",
            batchId: error.batchId || activeBatchId,
          });
          setIsAnalysisWizardOpen(false);
          return;
        }

        setAnalysisFlow({
          state: "failed",
          message: "A análise do perfil falhou.",
          error: getUserFriendlyError(error, "Não foi possível iniciar a análise do perfil agora."),
          batchId: "",
        });
      }
    },
    [
      connectedUsername,
      handleProtectedRequestError,
      onEnsureGamesLoaded,
      onRefreshProfile,
      loadProfileVersions,
      loadAnalyzedGameIds,
      playerGames,
      pollBatchUntilReady,
      userId,
    ]
  );

  if (!hasCompletedCoachQuiz || !coachOnboardingProfile) {
    return (
      <CoachOnboardingQuiz
        onComplete={async (profile) => {
          setCoachOnboardingProfile(profile);
          setHasCompletedCoachQuiz(true);
          setHasDismissedSavedQuiz(false);
          await persistCoachPreferences(profile);
        }}
      />
    );
  }

  return (
    <>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,12,32,0.94),rgba(12,14,22,0.98))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.32)] sm:p-7">
          <div className="absolute inset-0">
            <div className="absolute left-[-8%] top-[-20%] h-72 w-72 rounded-full bg-purple-500/18 blur-3xl" />
            <div className="absolute bottom-[-18%] right-[8%] h-60 w-60 rounded-full bg-fuchsia-400/12 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t("aiCoach.personalMentor")}</Badge>
                <Badge tone={hasRealProfile ? "emerald" : "slate"}>
                  {isViewingHistoricalProfile
                    ? t("aiCoach.viewingVersion", undefined, {
                        version: historicalProfileView.versionNumber || "",
                      }).trim()
                    : hasRealProfile
                      ? t("aiCoach.liveProfile")
                      : t("aiCoach.quizPersona")}
                </Badge>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {t("aiCoach.title")}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {t("aiCoach.heroDescription")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAnalysisWizardOpen(true)}
                className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400"
              >
                {t("aiCoach.startAnalysis")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasCompletedCoachQuiz(false);
                  setCoachOnboardingProfile(null);
                  setGeneralAnalysisRequestDraft(null);
                  setHasDismissedSavedQuiz(true);
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-purple-500/30 hover:text-white"
              >
                {t("aiCoach.resetQuiz")}
              </button>
            </div>
          </div>
        </div>

        <RunStatusCard flow={analysisFlow} />
        <DraftReadyCard
          draft={generalAnalysisRequestDraft}
          success={analysisSuccess}
          onOpenAnalysis={onOpenAnalysis}
        />

        {coachSetupError ? (
          <Card className="border-yellow-400/20 bg-yellow-400/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-yellow-200">Aviso das preferências do coach</p>
                <p className="mt-2 text-sm leading-6 text-yellow-100/90">{coachSetupError}</p>
              </div>
              <Badge tone="yellow">Salvo localmente</Badge>
            </div>
          </Card>
        ) : null}

        {isSavingCoachPreferences ? (
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-purple-300">Salvando preferências do coach</p>
                <p className="mt-2 text-sm text-slate-400">
                  Sincronizando suas escolhas iniciais com o perfil do coach.
                </p>
              </div>
              <Badge tone="purple">Salvando</Badge>
            </div>
            <ProgressBar value={72} className="mt-4" />
          </Card>
        ) : null}

        <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-slate-950/50 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(192,132,252,0.12),transparent_34%)]" />
            <div className="relative z-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`grid h-20 w-20 shrink-0 place-items-center rounded-[24px] bg-gradient-to-br ${coachIdentity.accent} text-2xl font-semibold text-slate-950 shadow-[0_18px_40px_rgba(0,0,0,0.28)]`}
                  >
                    {coachIdentity.name.split(" ")[1]?.slice(0, 2)?.toUpperCase() || "AI"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-300">Identidade do coach</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {coachIdentity.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">{coachIdentity.specialization}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tom do coach</p>
                  <p className="mt-2 font-semibold text-white">
                    {labelMaps.coachTone[coachOnboardingProfile.coachTone]}
                  </p>
                </div>
              </div>

              <blockquote className="mt-6 max-w-3xl text-lg leading-8 text-slate-100">
                "{coachIdentity.quote}"
              </blockquote>

              <div className="mt-6 flex flex-wrap gap-2">
                {coachIdentity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Intensidade do foco do coach
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Ajustado ao seu objetivo atual, fraqueza e tom preferido.
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {effectiveProfileData?.profileConfidence?.overall || 78}/100
                  </span>
                </div>
                <ProgressBar
                  value={effectiveProfileData?.profileConfidence?.overall || 78}
                  className="mt-4"
                />
              </div>
            </div>
          </Card>

          <ProfileConnectionCard
            connectedUsername={connectedUsername}
            profileData={effectiveProfileData}
            profileLoading={profileLoading}
            profileError={profileError}
          />
        </div>

        <ProfileVersionPanel
          versions={profileVersions}
          selectedVersionId={selectedProfileVersionId}
          selectedVersionDetails={selectedVersionDetails}
          historicalView={historicalProfileView}
          loading={profileVersionsLoading}
          error={profileVersionsError}
          restoring={isRestoringProfileVersion}
          onSelectVersion={selectProfileVersion}
          onRefreshVersions={loadProfileVersions}
          onRestoreVersion={restoreProfileVersion}
        />

        <GeneralAnalysisCard
          connectedUsername={connectedUsername}
          onStart={() => setIsAnalysisWizardOpen(true)}
          hasDraftReady={Boolean(generalAnalysisRequestDraft)}
        />

        {hasRealProfile ? (
          <>
            <CoachReadinessStrip profileData={effectiveProfileData} />

            <CoachTrainingPlan plan={trainingPlanViewModel} />

            <Card className="border-emerald-400/20 bg-emerald-400/8 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200">Relatório completo do perfil</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Pontos fortes, bloqueadores, erros e estilo detalhados ficam na Análise
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">
                    O coach mantém o plano de ação aqui. Use a Análise quando quiser a visão
                    diagnóstica completa por trás dessas recomendações.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAnalysis}
                  className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Abrir Análise
                </button>
              </div>
            </Card>
          </>
        ) : (
          <>
            <CoachTrainingPlan plan={trainingPlanViewModel} />

            <Card className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-purple-300">Fluxo de análise geral</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Como seu perfil de jogador será gerado
                    </h2>
                  </div>
                  <Badge tone="slate">Pronto para conectar</Badge>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    [
                      "1. Monte a amostra",
                      "Selecione ritmos, intervalo de datas, resultados e filtros de qualidade antes do trabalho pesado começar.",
                    ],
                    [
                      "2. Diagnostique padrões",
                      "Revele erros recorrentes, pontos fortes, sinais de abertura e padrões de decisão.",
                    ],
                    [
                      "3. Atualize o perfil do jogador",
                      "Salve as evidências da análise no seu perfil AstroChess para Análise e AI Coach.",
                    ],
                    [
                      "4. Transforme insight em treino",
                      "Prepare um rascunho de plano de treino com prioridades práticas, não apenas feedback descritivo.",
                    ],
                  ].map(([title, description]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                    </div>
                  ))}
                </div>
              </Card>
          </>
        )}

        {!connectedUsername ? (
          <EmptyState label="Conecte sua conta Chess.com na Home antes de iniciar uma análise geral do perfil." />
        ) : null}
      </section>

      <AnalysisSetupWizard
        isOpen={isAnalysisWizardOpen}
        onClose={() => setIsAnalysisWizardOpen(false)}
        connectedUsername={connectedUsername}
        coachPreferences={coachOnboardingProfile}
        initialConfig={analysisConfig}
        computeSamplePreview={computeSamplePreview}
        loadSamplePreview={loadAnalysisSamplePreview}
        isSubmitting={
          analysisFlow.state === "preparing" ||
          analysisFlow.state === "sending" ||
          analysisFlow.state === "analyzing"
        }
        submissionState={analysisFlow.state}
        submissionMessage={analysisFlow.message}
        submissionError={analysisFlow.state === "failed" ? analysisFlow.error : ""}
        submissionBatchId={analysisFlow.batchId}
        onConfirm={handleAnalysisConfirm}
      />
    </>
  );
}
