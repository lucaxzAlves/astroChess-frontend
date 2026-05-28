import {
  Badge,
  Card,
  EmptyState,
  SectionHeading,
  formatPercent,
  severityTone,
} from "../profileDelta/ProfileDeltaUi.jsx";

export default function RecurringMistakesSection({ recurringMistakes = [] }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Vazamentos recorrentes"
        title="Erros recorrentes"
        description="Problemas que aparecem em várias partidas e fases. Estes são os principais sinais diagnósticos que o coach vai usar."
      />

      {recurringMistakes.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {recurringMistakes.map((mistake) => (
            <Card
              key={`${mistake?.category}-${mistake?.name}`}
              className="p-5 hover:bg-purple-500/[0.04]"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-medium text-purple-300">{mistake?.category ?? "Sem categoria"}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{mistake?.name ?? "Erro sem nome"}</h3>
                </div>
                <Badge tone={severityTone(mistake?.severity)}>{mistake?.severity ?? "Desconhecido"}</Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">{mistake?.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="slate">{mistake?.frequency ?? "Frequência desconhecida"}</Badge>
                <Badge tone="slate">Confiança {formatPercent(mistake?.confidence)}</Badge>
                <Badge tone="purple">{mistake?.status ?? "Precisa de revisão"}</Badge>
              </div>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fases</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(mistake?.phases ?? []).map((phase) => (
                    <Badge key={phase} tone="slate">
                      {phase}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Exemplos</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {(mistake?.examples ?? []).map((example) => (
                    <li key={example}>- {example}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState label="Ainda não foram detectados erros recorrentes." />
      )}
    </section>
  );
}
