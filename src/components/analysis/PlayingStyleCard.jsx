import { Badge, Card, EmptyState, ProgressBar, humanizeKey } from "../profileDelta/ProfileDeltaUi.jsx";

const styleLabels = {
  aggression: "Agressividade",
  tacticalSharpness: "Precisão tática",
  positionalControl: "Controle posicional",
  riskTolerance: "Tolerância ao risco",
  conversionInstinct: "Instinto de conversão",
  defensiveStability: "Estabilidade defensiva",
};

function normalizeMetric([key, rawValue]) {
  const isObject = rawValue && typeof rawValue === "object";
  const value = Number(isObject ? rawValue.value ?? rawValue.score ?? 0 : rawValue) || 0;

  return {
    key,
    label: styleLabels[key] ?? humanizeKey(key),
    value,
    status: isObject ? rawValue.status || rawValue.interpretation || rawValue.description : null,
  };
}

function getMetricStatus(value) {
  if (value >= 78) return "Traço dominante";
  if (value >= 60) return "Presente com consistência";
  if (value >= 42) return "Moderado";
  return "Pouco evidente";
}

function StyleMetricCard({ metric }) {
  const status = metric.status || getMetricStatus(metric.value);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-purple-300/25 hover:bg-purple-300/[0.045]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.45)]" />
          <div className="min-w-0">
            <p className="font-medium text-white">{metric.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{status}</p>
          </div>
        </div>
        <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.08] px-2.5 py-1 text-sm font-semibold text-purple-100">
          {metric.value}
        </span>
      </div>
      <ProgressBar value={metric.value} className="mt-4" />
    </div>
  );
}

export default function PlayingStyleCard({ playingStyle }) {
  if (!playingStyle) {
    return <EmptyState label="Ainda não foi inferido nenhum estilo de jogo." />;
  }

  const styleScores = Object.entries(playingStyle?.styleScores ?? {}).map(normalizeMetric);
  const secondaryStyles = playingStyle?.secondaryStyles ?? [];

  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-300">Impressão digital do estilo</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Estilo de jogo</h2>
        </div>
        <Badge tone="purple">{playingStyle?.primaryStyle ?? "Estilo desconhecido"}</Badge>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        {playingStyle?.description ?? "Mais partidas são necessárias antes de confiar no perfil de estilo."}
      </p>

      {secondaryStyles.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {secondaryStyles.map((style) => (
            <Badge key={style} tone="slate">
              {style}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {styleScores.length ? (
          styleScores.map((metric) => (
            <StyleMetricCard key={metric.key} metric={metric} />
          ))
        ) : (
          <EmptyState label="As pontuações de estilo aparecerão quando houver mais evidências no perfil." />
        )}
      </div>
    </Card>
  );
}
