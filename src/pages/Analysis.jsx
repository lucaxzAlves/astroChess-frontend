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
} from "../components/profileDelta/ProfileDeltaUi.jsx";

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
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
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

      <ChessStatsCard chessStats={profileData?.chessStats} />

      <GrowthBlockersSection
        growthBlockers={profileData?.growthBlockers ?? []}
        recurringMistakes={profileData?.recurringMistakes ?? []}
      />

      <PriorityAreasSection
        recommendations={profileData?.recommendations}
        skillMap={profileData?.skillMap}
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
  );
}
