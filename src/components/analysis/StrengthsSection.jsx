import { Badge, Card, EmptyState, SectionHeading, formatPercent } from "../profileDelta/ProfileDeltaUi.jsx";

export default function StrengthsSection({ strengths = [] }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Recursos confiáveis"
        title="Pontos fortes"
        description="O perfil não deve apenas diagnosticar vazamentos. Estas são as habilidades de xadrez a preservar enquanto você treina fraquezas."
      />

      {strengths.length ? (
        <div className="grid gap-5 md:grid-cols-3">
          {strengths.map((strength) => (
            <Card key={strength?.name} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">{strength?.name}</h3>
                <Badge tone="emerald">{formatPercent(strength?.confidence)}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{strength?.description}</p>
              <div className="mt-4 rounded-xl bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Evidências: {strength?.evidenceCount ?? 0}
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {(strength?.examples ?? []).map((example) => (
                    <li key={example}>- {example}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState label="Os pontos fortes aparecerão quando o perfil tiver evidência suficiente." />
      )}
    </section>
  );
}
