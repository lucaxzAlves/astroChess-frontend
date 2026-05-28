import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  SectionHeading,
  humanizeKey,
} from "../profileDelta/ProfileDeltaUi.jsx";

export default function PriorityAreasSection({ recommendations, skillMap }) {
  const priorityAreas = recommendations?.priorityAreas ?? [];

  return (
    <section>
      <SectionHeading
        eyebrow="Fila de treino"
        title="Áreas prioritárias"
        description="Cada prioridade se conecta a uma fraqueza medida para que o plano continue diagnóstico, não genérico."
      />

      {priorityAreas.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {priorityAreas.map((priority, index) => {
            const weakness = skillMap?.[priority?.linkedWeakness];
            return (
              <Card key={priority?.title} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-sm font-semibold text-purple-300">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{priority?.title}</h3>
                    <p className="text-xs text-slate-500">
                      {priority?.linkedWeakness ? humanizeKey(priority.linkedWeakness) : "Fraqueza pendente"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">{priority?.reason}</p>

                {weakness ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">Fraqueza ligada</span>
                      <Badge tone="rose">{weakness.value}</Badge>
                    </div>
                    <ProgressBar value={weakness.value} tone="rose" className="mt-3" />
                    <p className="mt-3 text-sm leading-6 text-slate-400">{weakness.description}</p>
                  </div>
                ) : null}

                <div className="mt-4 rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Benefício esperado</p>
                  <p className="mt-2 text-sm leading-6 text-purple-100">{priority?.expectedBenefit}</p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState label="Ainda não foram geradas áreas prioritárias." />
      )}
    </section>
  );
}
