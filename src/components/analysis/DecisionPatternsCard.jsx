import { Card, EmptyState, SectionHeading } from "../profileDelta/ProfileDeltaUi.jsx";

export default function DecisionPatternsCard({ decisionPatterns }) {
  if (!decisionPatterns) {
    return <EmptyState label="Ainda não foram detectados padrões de decisão." />;
  }

  return (
    <Card className="p-6">
      <SectionHeading
        eyebrow="Psicologia da escolha de lances"
        title="Padrões de decisão"
        description="As tendências práticas por trás dos números: como as escolhas são feitas quando a posição fica incerta."
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-purple-500/25 bg-purple-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-purple-300">Perfil de risco</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {decisionPatterns?.riskProfile ?? "Desconhecido"}
          </h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-sm leading-6 text-slate-300">{decisionPatterns?.description}</p>
          <div className="mt-5 grid gap-2">
            {(decisionPatterns?.commonBehaviors ?? []).map((behavior) => (
              <div
                key={behavior}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-300"
              >
                {behavior}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
