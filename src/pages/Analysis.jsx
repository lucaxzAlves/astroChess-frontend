import { useState } from "react";
import ChessStatsCard from "../components/analysis/ChessStatsCard.jsx";
import DecisionPatternsCard from "../components/analysis/DecisionPatternsCard.jsx";
import ImprovementHistorySection from "../components/analysis/ImprovementHistorySection.jsx";
import OpeningRepertoireSection from "../components/analysis/OpeningRepertoireSection.jsx";
import PlayingStyleCard from "../components/analysis/PlayingStyleCard.jsx";
import ProfileConfidenceBanner from "../components/analysis/ProfileConfidenceBanner.jsx";
import SkillMapCard from "../components/analysis/SkillMapCard.jsx";
import StrengthsSection from "../components/analysis/StrengthsSection.jsx";
import GrowthBlockersSection from "../components/coach/GrowthBlockersSection.jsx";
import PriorityAreasSection from "../components/coach/PriorityAreasSection.jsx";
import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  clampScore,
  formatNumber,
  formatPercent,
  humanizeKey,
  severityTone,
} from "../components/profileDelta/ProfileDeltaUi.jsx";

const mobileSkillLabels = {
  calculation: "Cálculo",
  positionalUnderstanding: "Compreensão posicional",
  openings: "Aberturas",
  tacticalThemes: "Temas táticos",
  endgames: "Finais",
  middlegame: "Meio-jogo",
  timeManagement: "Gestão do tempo",
  psychologicalResilience: "Resiliência psicológica",
};

const mobileStyleLabels = {
  aggression: "Agressividade",
  tacticalSharpness: "Precisão tática",
  positionalControl: "Controle posicional",
  riskTolerance: "Gestão de risco",
  conversionInstinct: "Conversão",
  defensiveStability: "Defesa",
  endgameConfidence: "Confiança em finais",
};

function getMobileSkillEntries(skillMap = {}) {
  return Object.entries(skillMap || {})
    .filter(([key, value]) => key !== "overallScore" && value && typeof value === "object")
    .map(([key, value]) => ({
      key,
      label: mobileSkillLabels[key] ?? humanizeKey(key),
      value: clampScore(value.value ?? value.score),
      description: value.description,
      confidence: value.confidence,
    }));
}

function getOverallScore(profileData) {
  const skills = getMobileSkillEntries(profileData?.skillMap);
  return (
    profileData?.skillMap?.overallScore ??
    Math.round(skills.reduce((sum, skill) => sum + skill.value, 0) / (skills.length || 1))
  );
}

function asDisplayText(value, fallback = "N/A") {
  if (value === 0) return "0";
  if (!value) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => asDisplayText(item, "")).filter(Boolean).join(", ") || fallback;
  }
  if (typeof value === "object") {
    return (
      value.title ||
      value.summary ||
      value.name ||
      value.description ||
      value.reason ||
      value.focus ||
      fallback
    );
  }
  return String(value);
}

function getOpeningGroups(openingRepertoire) {
  return [
    {
      id: "white",
      title: "White Repertoire",
      description: "Linhas em que você conduz o primeiro plano.",
      openings: openingRepertoire?.asWhite ?? [],
    },
    {
      id: "black",
      title: "Black Repertoire",
      description: "Respostas contra 1.e4, 1.d4 e outros sistemas.",
      openings: [
        ...(openingRepertoire?.asBlack?.againstE4 ?? []),
        ...(openingRepertoire?.asBlack?.againstD4 ?? []),
        ...(openingRepertoire?.asBlack?.againstOther ?? []),
      ],
    },
  ];
}

function getMobileStyleMetrics(playingStyle) {
  return Object.entries(playingStyle?.styleScores ?? {}).map(([key, rawValue]) => {
    const isObject = rawValue && typeof rawValue === "object";
    const value = clampScore(isObject ? rawValue.value ?? rawValue.score : rawValue);
    return {
      key,
      label: mobileStyleLabels[key] ?? humanizeKey(key),
      value,
      status: isObject ? rawValue.status || rawValue.interpretation || rawValue.description : null,
    };
  });
}

function formatDate(value) {
  if (!value) return "Ainda não analisado";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AnalysisSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-transparent p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-8 w-60 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index} className="p-6">
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-5 h-3 w-full animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-3 w-3/5 animate-pulse rounded bg-white/10" />
          </Card>
        ))}
      </div>
    </section>
  );
}

function AnalysisHeader({ profileData, onRefreshProfile }) {
  const meta = profileData?.meta || {};
  const totalGamesAnalyzed = meta.totalGamesAnalyzed || 0;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-transparent p-6 lg:flex-row lg:items-end">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="purple">Diagnóstico de performance</Badge>
          <Badge tone="slate">
            {totalGamesAnalyzed > 0 ? `${totalGamesAnalyzed} partidas analisadas` : "Perfil pronto"}
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-white">Análise</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Seu perfil AstroChess: mapa de habilidades, padrões de decisão, erros recorrentes
          e a confiança por trás de cada leitura diagnóstica.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Última atualização</p>
          <p className="mt-2 text-sm font-medium text-white">{formatDate(meta.lastProfileUpdateAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => onRefreshProfile?.()}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-purple-500/30 hover:text-white"
        >
          Atualizar perfil
        </button>
      </div>
    </div>
  );
}

function EmptyProfileState({ onOpenCoach }) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-purple-500/12 via-white/[0.04] to-slate-950/55 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="yellow">Sem perfil de jogador ainda</Badge>
          <Badge tone="slate">Análise geral necessária</Badge>
        </div>

        <h1 className="mt-5 text-3xl font-semibold text-white">Sua página de análise está esperando o primeiro perfil</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          O app já sabe quem você é, mas seu diagnóstico de xadrez ainda não foi gerado.
          Inicie uma análise geral no AI Coach para criar seu mapa de habilidades, erros
          recorrentes, perfil de aberturas e prioridades de treino.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Filtrar um lote real de partidas",
            "Analisar erros recorrentes e pontos fortes",
            "Gerar recomendações baseadas no perfil",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4 text-sm text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenCoach}
            className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400"
          >
            Começar no AI Coach
          </button>
          <p className="text-sm text-slate-400">
            Quando o AstroChess terminar de criar seu perfil, esta página será preenchida automaticamente.
          </p>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ profileError, onRefreshProfile }) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Card className="border-rose-400/20 bg-rose-500/10 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="rose">Falha ao carregar perfil</Badge>
          <Badge tone="slate">Sincronização do perfil</Badge>
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-white">Não foi possível carregar seu perfil de xadrez</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-100/90">
          {profileError ||
            "Não foi possível carregar seu perfil agora. Tente novamente em instantes."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onRefreshProfile?.()}
            className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400"
          >
            Tentar novamente
          </button>
        </div>
      </Card>
    </section>
  );
}

function ProfileMetadataStrip({ profileData }) {
  const meta = profileData?.meta || {};
  const confidence = profileData?.profileConfidence?.overall || 0;
  const username = meta.chessComUsername || "Não conectado";
  const routineDays = profileData?.recommendations?.raw?.trainingRoutine?.durationDays || 0;

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {[
        ["Conta Chess.com", username],
        ["Confiança do perfil", `${confidence}%`],
        ["Partidas analisadas", meta.totalGamesAnalyzed || 0],
        ["Horizonte da rotina", routineDays ? `${routineDays} dias` : "Não definido"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-lg font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

function MobilePerformanceOverview({ profileData, onRefreshProfile, profileLoading }) {
  const score = getOverallScore(profileData);
  const chessStats = profileData?.chessStats || {};

  return (
    <Card className="overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="astro-eyebrow">Performance Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Relatório de performance</h1>
        </div>
        <button
          type="button"
          onClick={() => onRefreshProfile?.()}
          disabled={profileLoading}
          className="min-h-11 rounded-2xl border border-purple-300/22 bg-purple-300/[0.08] px-3 py-2 text-xs font-semibold text-purple-100 disabled:opacity-60"
        >
          {profileLoading ? "..." : "Atualizar"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Overall Score</p>
          <p className="mt-1 text-6xl font-semibold leading-none text-white">{score}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {asDisplayText(profileData?.recommendations?.currentFocus, "Seu relatório de performance está pronto.")}
          </p>
        </div>
        <div className="grid h-24 w-24 place-items-center rounded-full border border-cyan-300/24 bg-cyan-300/[0.07] shadow-[0_0_28px_rgba(34,211,238,0.12)]">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100">Accuracy</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatPercent(chessStats.averageAccuracy)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MobileSkillRadar({ skills, overallScore }) {
  const visibleSkills = skills.slice(0, 8);
  const center = 50;
  const maxRadius = 31;
  const labelRadius = 41;
  const points = visibleSkills.map((skill, index) => {
    const angle = -90 + (360 / visibleSkills.length) * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 7 + (skill.value / 100) * maxRadius;
    return {
      ...skill,
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
      axisX: center + maxRadius * Math.cos(radians),
      axisY: center + maxRadius * Math.sin(radians),
      labelX: center + labelRadius * Math.cos(radians),
      labelY: center + labelRadius * Math.sin(radians),
    };
  });
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="min-w-0 rounded-[28px] border border-purple-300/20 bg-slate-950/50 p-3">
      <div className="relative mx-auto h-[318px] w-full max-w-[318px]">
        <svg viewBox="0 0 100 100" className="block h-full w-full overflow-visible" role="img" aria-label={`Skill Matrix score ${overallScore}`}>
          <defs>
            <radialGradient id="mobileAnalysisSkillGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.24)" />
              <stop offset="65%" stopColor="rgba(168,85,247,0.12)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0)" />
            </radialGradient>
            <linearGradient id="mobileAnalysisSkillFill" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.34)" />
              <stop offset="55%" stopColor="rgba(168,85,247,0.28)" />
              <stop offset="100%" stopColor="rgba(236,72,153,0.16)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill="url(#mobileAnalysisSkillGlow)" />
          {[12, 22, 31].map((radius) => (
            <circle key={radius} cx="50" cy="50" r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="0.45" />
          ))}
          {points.map((point) => (
            <line key={`${point.key}-axis`} x1="50" y1="50" x2={point.axisX} y2={point.axisY} stroke="rgba(168,85,247,0.24)" strokeWidth="0.45" />
          ))}
          <polygon points={polygonPoints} fill="url(#mobileAnalysisSkillFill)" stroke="rgba(34,211,238,0.78)" strokeLinejoin="round" strokeWidth="0.9" />
          {points.map((point) => (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="1.9" fill="#e9d5ff" />
              <circle cx={point.x} cy={point.y} r="3.6" fill="none" stroke="rgba(34,211,238,0.38)" strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {points.map((point) => (
            <div
              key={`${point.key}-label`}
              className="absolute w-16 -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${point.labelX}%`, top: `${point.labelY}%` }}
            >
              <p className="truncate text-[9px] font-semibold text-slate-200">{point.label}</p>
              <p className="text-[9px] text-purple-200">{point.value}</p>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 grid h-[clamp(4rem,20vw,5rem)] w-[clamp(4rem,20vw,5rem)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-purple-300/30 bg-[#070711]/90 text-center shadow-[0_0_30px_rgba(168,85,247,0.24)]">
          <div>
            <p className="text-[clamp(0.45rem,2.1vw,0.56rem)] font-bold uppercase tracking-[0.16em] text-cyan-100">Score</p>
            <p className="mt-0.5 text-[clamp(1.15rem,6vw,1.5rem)] font-semibold leading-none text-white">{overallScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileSkillMatrix({ skillMap }) {
  const skills = getMobileSkillEntries(skillMap);
  const sortedSkills = [...skills].sort((a, b) => b.value - a.value);
  const strengths = sortedSkills.slice(0, 3);
  const weaknesses = sortedSkills.slice(-3).reverse();
  const overallScore =
    skillMap?.overallScore ??
    Math.round(skills.reduce((sum, skill) => sum + skill.value, 0) / (skills.length || 1));

  if (!skills.length) {
    return <EmptyState label="Ainda não foi gerado nenhum mapa de habilidades." />;
  }

  return (
    <Card className="p-5">
      <p className="astro-eyebrow">Skill Matrix</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Mapa de habilidades</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Leitura compacta para entender rapidamente onde seu xadrez está forte e onde está vazando.
      </p>

      <div className="mt-5 grid min-w-0 gap-4">
        <MobileSkillRadar skills={skills} overallScore={overallScore} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <h3 className="text-sm font-semibold text-white">Todas as áreas</h3>
          <div className="mt-4 grid gap-4">
            {skills.map((skill) => (
              <div key={skill.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-slate-200">{skill.label}</span>
                  <span className="text-sm font-semibold text-white">{skill.value}</span>
                </div>
                <ProgressBar value={skill.value} className="mt-2" tone={skill.value < 50 ? "rose" : skill.value >= 75 ? "emerald" : "purple"} />
              </div>
            ))}
          </div>
        </div>
        <MobileSkillTextCarousel skills={skills} />
        <MobileSkillGroup title="Strengths" skills={strengths} tone="emerald" />
        <MobileSkillGroup title="Needs Improvement" skills={weaknesses} tone="rose" />
      </div>
    </Card>
  );
}

function MobileSkillTextCarousel({ skills }) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <h3 className="text-sm font-semibold text-white">Leitura por aspecto</h3>
        <span className="text-xs text-slate-500">deslize</span>
      </div>
      <div className="mobile-skill-text-carousel overflow-hidden pb-2">
        <div className="mobile-skill-text-track flex w-max gap-3">
        {[...skills, ...skills].map((skill, index) => (
          <article
            key={`${skill.key}-${index}`}
            aria-hidden={index >= skills.length}
            className="w-[280px] rounded-[22px] border border-purple-300/18 bg-slate-950/50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{skill.label}</p>
                <p className="mt-1 text-xs text-slate-500">Confiança {formatPercent(skill.confidence)}</p>
              </div>
              <Badge tone={skill.value < 50 ? "rose" : skill.value >= 75 ? "emerald" : "purple"}>
                {skill.value}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {skill.description || "Ainda não há uma descrição detalhada para este aspecto."}
            </p>
          </article>
        ))}
        </div>
      </div>
    </div>
  );
}

function MobileSkillGroup({ title, skills, tone }) {
  const isWeakness = tone === "rose";
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {isWeakness ? "Priorize esses aspectos no treino." : "Use esses pontos como base do seu plano."}
          </p>
        </div>
        <Badge tone={tone === "rose" ? "rose" : "emerald"}>{skills.length}</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {skills.map((skill) => (
          <div
            key={skill.key}
            className={[
              "rounded-2xl border p-4",
              isWeakness
                ? "border-rose-300/16 bg-rose-300/[0.045]"
                : "border-emerald-300/16 bg-emerald-300/[0.045]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white">{skill.label}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
                  {skill.description || (isWeakness ? "Área com maior impacto potencial no próximo ciclo de treino." : "Área forte do seu perfil atual.")}
                </p>
              </div>
              <span
                className={[
                  "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-lg font-semibold",
                  isWeakness
                    ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100"
                    : "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100",
                ].join(" ")}
              >
                {skill.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileGrowthBlockers({ growthBlockers = [] }) {
  return (
    <section className="grid gap-3">
      <div className="px-1">
        <p className="astro-eyebrow">Growth Blockers</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">O que está te segurando</h2>
      </div>
      {growthBlockers.length ? (
        growthBlockers.map((blocker, index) => (
          <Card key={`${blocker?.title}-${index}`} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200">Blocker {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{blocker?.title || "Bloqueador sem título"}</h3>
              </div>
              <Badge tone={severityTone(blocker?.severity)}>{blocker?.severity || "N/A"}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{blocker?.whatHappens || blocker?.description || "Sem descrição disponível."}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Como melhorar</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{blocker?.howToImprove || "Recomendação ainda não definida."}</p>
            </div>
            <MobileReferencedGames blocker={blocker} />
          </Card>
        ))
      ) : (
        <EmptyState label="Ainda não foram gerados bloqueadores de evolução." />
      )}
    </section>
  );
}

function MobileReferencedGames({ blocker }) {
  const refs = [
    ...(Array.isArray(blocker?.referencedGames) ? blocker.referencedGames : []),
    ...(Array.isArray(blocker?.relatedGames) ? blocker.relatedGames : []),
    ...(Array.isArray(blocker?.gameIds) ? blocker.gameIds : []),
  ].slice(0, 3);

  if (!refs.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-purple-300/14 bg-purple-300/[0.045] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-100/80">Referenced games</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {refs.map((reference, index) => {
          const label =
            typeof reference === "string"
              ? reference
              : reference?.opponent || reference?.title || reference?.gameId || reference?.id || `Game ${index + 1}`;
          const url = typeof reference === "object" ? reference.url || reference.gameUrl || reference.chessComUrl : null;
          return url ? (
            <a key={`${label}-${index}`} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-purple-300/25 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-medium text-purple-100">
              {label}
            </a>
          ) : (
            <span key={`${label}-${index}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MobileGameStyle({ playingStyle }) {
  const metrics = getMobileStyleMetrics(playingStyle);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="astro-eyebrow">Game Style</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Como você joga</h2>
        </div>
        <Badge tone="purple">{playingStyle?.primaryStyle || "Perfil"}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {playingStyle?.description || "Mais partidas ajudam a refinar o estilo de jogo."}
      </p>
      <div className="mt-5 grid gap-3">
        {metrics.length ? metrics.map((metric) => (
          <div key={metric.key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{metric.label}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.status || "Indicador de estilo"}</p>
              </div>
              <span className="text-lg font-semibold text-white">{metric.value}</span>
            </div>
            <ProgressBar value={metric.value} className="mt-3" />
          </div>
        )) : <EmptyState label="As pontuações de estilo aparecerão quando houver mais evidências." />}
      </div>
    </Card>
  );
}

function MobileOpeningRepertoire({ openingRepertoire }) {
  const [openGroup, setOpenGroup] = useState("white");
  const groups = getOpeningGroups(openingRepertoire);

  return (
    <Card className="p-5">
      <p className="astro-eyebrow">Opening Repertoire</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Repertório</h2>
      <div className="mt-5 grid gap-3">
        {groups.map((group) => {
          const isOpen = openGroup === group.id;
          return (
            <div key={group.id} className="rounded-2xl border border-white/10 bg-slate-950/40">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? "" : group.id)}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block font-semibold text-white">{group.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{group.openings.length} linhas</span>
                </span>
                <span className={["text-xl text-purple-200 transition", isOpen ? "rotate-45" : ""].join(" ")}>+</span>
              </button>
              {isOpen ? (
                <div className="grid gap-3 border-t border-white/10 p-4">
                  {group.openings.length ? group.openings.slice(0, 6).map((opening, index) => (
                    <div key={`${opening?.name}-${index}`} className="rounded-xl bg-white/[0.04] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{opening?.name || "Abertura sem nome"}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{opening?.moves || opening?.eco || opening?.ECO || "Linha indisponível"}</p>
                        </div>
                        <Badge tone="slate">{opening?.games ?? 0}</Badge>
                      </div>
                      <ProgressBar value={opening?.scorePercent} className="mt-3" />
                    </div>
                  )) : <EmptyState label="Sem linhas registradas nesse grupo." />}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MobileStatsScroller({ chessStats, openingRepertoire, growthBlockers }) {
  const whiteOpenings = openingRepertoire?.asWhite ?? [];
  const blackOpenings = getOpeningGroups(openingRepertoire)[1]?.openings ?? [];
  const allOpenings = [...whiteOpenings, ...blackOpenings];
  const mostCommonOpening = [...allOpenings].sort((a, b) => Number(b?.games || 0) - Number(a?.games || 0))[0];
  const mistakeDistribution = chessStats?.mistakeDistribution ?? {};
  const mostCommonMistake = Object.entries(mistakeDistribution).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0]?.[0];
  const results = chessStats?.results ?? {};
  const totalResults = Object.values(results).reduce((sum, value) => sum + Number(value || 0), 0);
  const winRate = totalResults ? Math.round((Number(results.win || results.wins || 0) / totalResults) * 100) : null;
  const stats = [
    ["Games Played", formatNumber(chessStats?.totalGamesAnalyzed)],
    ["Win Rate", winRate === null ? "N/A" : `${winRate}%`],
    ["Average Accuracy", formatPercent(chessStats?.averageAccuracy)],
    ["Most Common Opening", mostCommonOpening?.name || "N/A"],
    ["Most Common Mistake", mostCommonMistake ? humanizeKey(mostCommonMistake) : growthBlockers?.[0]?.title || "N/A"],
  ];

  return (
    <section>
      <div className="mb-3 px-1">
        <p className="astro-eyebrow">Statistics</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Números do perfil</h2>
      </div>
      <div className="mobile-analysis-stats overflow-hidden pb-2">
        <div className="mobile-analysis-stats-track flex w-max gap-3">
          {[...stats, ...stats].map(([label, value], index) => (
            <article
              key={`${label}-${index}`}
              aria-hidden={index >= stats.length}
              className="w-[220px] rounded-[22px] border border-purple-300/18 bg-slate-950/55 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
              <p className="mt-2 line-clamp-2 text-2xl font-semibold leading-tight text-white">{value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileImprovementHistory({ improvementHistory = [] }) {
  return (
    <section className="grid gap-3">
      <div>
        <p className="astro-eyebrow">Trend line</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Improvement History</h3>
      </div>
      {improvementHistory.length ? (
        improvementHistory.map((period, index) => (
          <div key={`${period?.periodLabel}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200">
                  {period?.periodLabel || `Período ${index + 1}`}
                </p>
                <h4 className="mt-2 text-base font-semibold leading-6 text-white">
                  {asDisplayText(period?.summary, "Resumo ainda indisponível.")}
                </h4>
              </div>
              <Badge tone="slate">{period?.analyzedGamesCount ?? 0} games</Badge>
            </div>

            <div className="mt-4 grid gap-3">
              {[
                ["Improved", period?.improvedAreas, "emerald"],
                ["Needs care", period?.worsenedAreas || period?.newProblems, "rose"],
                ["Resolved", period?.resolvedMistakes, "purple"],
              ].map(([label, items, tone]) => (
                <div key={label} className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Array.isArray(items) && items.length ? items : ["None flagged"]).slice(0, 4).map((item) => (
                      <Badge key={String(item)} tone={tone}>
                        {asDisplayText(item)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyState label="O histórico aparecerá depois de múltiplas janelas de análise." />
      )}
    </section>
  );
}

function MobileNormalInsights({ profileData }) {
  return (
    <div className="grid gap-5">
      <StrengthsSection strengths={profileData?.strengths ?? []} />
      <MobileImprovementHistory improvementHistory={profileData?.improvementHistory ?? []} />
      <DecisionPatternsCard decisionPatterns={profileData?.decisionPatterns} />
    </div>
  );
}

function MobileAnalysisExperience({ profileData, profileLoading, profileError, onRefreshProfile }) {
  return (
    <section className="mx-auto flex w-full max-w-[460px] flex-col gap-5 overflow-x-hidden pb-6">
      <MobilePerformanceOverview
        profileData={profileData}
        profileLoading={profileLoading}
        onRefreshProfile={onRefreshProfile}
      />

      {profileLoading ? (
        <Card className="p-4">
          <p className="text-sm font-medium text-purple-300">Atualizando perfil do jogador</p>
          <ProgressBar value={72} className="mt-4" />
        </Card>
      ) : null}

      {profileError ? (
        <Card className="border-rose-400/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {profileError}
        </Card>
      ) : null}

      <MobileSkillMatrix skillMap={profileData?.skillMap} />
      <MobileGrowthBlockers growthBlockers={profileData?.growthBlockers ?? []} />
      <MobileGameStyle playingStyle={profileData?.playingStyle} />
      <MobileOpeningRepertoire openingRepertoire={profileData?.openingRepertoire} />
      <MobileStatsScroller
        chessStats={profileData?.chessStats}
        openingRepertoire={profileData?.openingRepertoire}
        growthBlockers={profileData?.growthBlockers ?? []}
      />
      <MobileNormalInsights profileData={profileData} />
    </section>
  );
}

export default function Analysis({
  profileData,
  profileLoading = false,
  profileError = "",
  onRefreshProfile,
  onOpenCoach,
}) {
  if (profileLoading && !profileData) {
    return <AnalysisSkeleton />;
  }

  if (profileError && !profileData) {
    return <ErrorState profileError={profileError} onRefreshProfile={onRefreshProfile} />;
  }

  if (!profileData?.meta?.hasMeaningfulProfile) {
    return <EmptyProfileState onOpenCoach={onOpenCoach} />;
  }

  return (
    <>
      <div className="md:hidden">
        <MobileAnalysisExperience
          profileData={profileData}
          profileLoading={profileLoading}
          profileError={profileError}
          onRefreshProfile={onRefreshProfile}
        />
      </div>

      <section className="mx-auto hidden w-full max-w-7xl flex-col gap-8 md:flex">
        <AnalysisHeader profileData={profileData} onRefreshProfile={onRefreshProfile} />

        {profileLoading ? (
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-purple-300">Atualizando perfil do jogador</p>
                <p className="mt-2 text-sm text-slate-400">
                  Buscando seu perfil de xadrez salvo mais recente.
                </p>
              </div>
              <Badge tone="purple">Atualizando</Badge>
            </div>
            <ProgressBar value={72} className="mt-4" />
          </Card>
        ) : null}

        <ProfileMetadataStrip profileData={profileData} />

        <ProfileConfidenceBanner profileConfidence={profileData?.profileConfidence} />

        <SkillMapCard skillMap={profileData?.skillMap} timeRange="Perfil mais recente" />

        <PriorityAreasSection
          recommendations={profileData?.recommendations}
          skillMap={profileData?.skillMap}
        />

        <ChessStatsCard chessStats={profileData?.chessStats} />

        <GrowthBlockersSection
          growthBlockers={profileData?.growthBlockers ?? []}
          recurringMistakes={profileData?.recurringMistakes ?? []}
        />

        <PlayingStyleCard playingStyle={profileData?.playingStyle} />

        <StrengthsSection strengths={profileData?.strengths ?? []} />

        <OpeningRepertoireSection openingRepertoire={profileData?.openingRepertoire} />

        <ImprovementHistorySection improvementHistory={profileData?.improvementHistory ?? []} />

        <DecisionPatternsCard decisionPatterns={profileData?.decisionPatterns} />

        {profileError ? (
          <EmptyState label={`The latest refresh returned an error, but your previous profile is still visible: ${profileError}`} />
        ) : null}
      </section>
    </>
  );
}
