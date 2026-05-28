import {
  Card,
  EmptyState,
  ProgressBar,
  SectionHeading,
  formatNumber,
  formatPercent,
  humanizeKey,
} from "../profileDelta/ProfileDeltaUi.jsx";

function StatTile({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-sm leading-5 text-slate-400">{detail}</p> : null}
    </div>
  );
}

function DistributionBars({ title, data, total }) {
  const entries = Object.entries(data ?? {});

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4 grid gap-4">
        {entries.length ? (
          entries.map(([label, value]) => {
            const width = total ? Math.round((Number(value || 0) / total) * 100) : value;
            return (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">{humanizeKey(label)}</span>
                  <span className="font-medium text-purple-300">{formatNumber(value)}</span>
                </div>
                <ProgressBar value={width} />
              </div>
            );
          })
        ) : (
          <EmptyState label="Ainda não há dados de distribuição." />
        )}
      </div>
    </div>
  );
}

export default function ChessStatsCard({ chessStats }) {
  if (!chessStats) {
    return <EmptyState label="Ainda não há estatísticas concretas de xadrez." />;
  }

  const results = chessStats?.results ?? {};
  const mistakeDistribution = chessStats?.mistakeDistribution ?? {};
  const totalResults = Object.values(results).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalMistakes = Object.values(mistakeDistribution).reduce((sum, value) => sum + Number(value || 0), 0);

  return (
    <Card className="p-6">
      <SectionHeading
        eyebrow="Evidência concreta"
        title="Performance Matrix"
        description="Totais essenciais do perfil por trás do diagnóstico, com foco em volume analisado, precisão, conversão e resiliência."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Partidas analisadas" value={formatNumber(chessStats?.totalGamesAnalyzed)} />
        <StatTile label="Precisão média" value={formatPercent(chessStats?.averageAccuracy)} />
        <StatTile
          label="Conversão"
          value={formatPercent(chessStats?.conversion?.winningPositionsConverted)}
          detail={chessStats?.conversion?.note}
        />
        <StatTile
          label="Resiliência"
          value={formatPercent(chessStats?.resilience?.recoveryAfterMistake)}
          detail={chessStats?.resilience?.note}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <DistributionBars title="Resultados" data={results} total={totalResults} />
        <DistributionBars title="Distribuição de erros" data={mistakeDistribution} total={totalMistakes} />
      </div>
    </Card>
  );
}
