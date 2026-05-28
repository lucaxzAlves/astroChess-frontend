import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  formatPercent,
  humanizeKey,
} from "../profileDelta/ProfileDeltaUi.jsx";

export default function ProfileConfidenceBanner({ profileConfidence }) {
  if (!profileConfidence) {
    return <EmptyState label="Ainda não há dados de confiança do perfil." />;
  }

  const overall = profileConfidence?.overall ?? 0;
  const basedOnGames = profileConfidence?.basedOnGames ?? 0;
  const confidenceByArea = profileConfidence?.confidenceByArea ?? {};
  const areaEntries = Object.entries(confidenceByArea).slice(0, 4);
  const isPreliminary = overall < 75 || basedOnGames < 60 || Boolean(profileConfidence?.warning);

  return (
    <Card className="overflow-hidden border-purple-500/25 bg-gradient-to-r from-purple-500/15 via-white/[0.05] to-slate-950/70 p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={isPreliminary ? "yellow" : "emerald"}>
              {isPreliminary ? "Perfil preliminar" : "Perfil estável"}
            </Badge>
            <Badge tone="purple">Delta do perfil</Badge>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">Confiança do perfil</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            A confiança é baseada em {basedOnGames} partidas analisadas. O diagnóstico já é útil,
            mas continuará se ajustando conforme novas partidas entrarem no perfil.
          </p>
          {profileConfidence?.warning ? (
            <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm leading-6 text-yellow-100">
              {profileConfidence.warning}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Confiança geral</p>
              <p className="mt-2 text-4xl font-semibold text-white">{formatPercent(overall)}</p>
            </div>
            <p className="text-sm text-slate-400">{basedOnGames} partidas</p>
          </div>
          <ProgressBar value={overall} className="mt-4" tone={overall < 65 ? "yellow" : "purple"} />
          {areaEntries.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {areaEntries.map(([area, value]) => (
                <div key={area} className="rounded-lg bg-white/[0.04] p-3">
                  <p className="truncate text-xs text-slate-500">{humanizeKey(area)}</p>
                  <p className="mt-1 text-sm font-medium text-purple-200">{formatPercent(value)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
