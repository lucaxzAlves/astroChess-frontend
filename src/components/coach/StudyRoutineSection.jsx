import { Badge, Card, EmptyState, SectionHeading } from "../profileDelta/ProfileDeltaUi.jsx";

function PracticalStepCard({ item, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <h3 className="font-semibold text-white">{item?.title ?? item?.label}</h3>
        <Badge tone="slate">{item?.cadence ?? item?.duration ?? label}</Badge>
      </div>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
        {(item?.steps ?? []).map((step) => (
          <li key={step}>- {step}</li>
        ))}
      </ul>
    </div>
  );
}

export default function StudyRoutineSection({ recommendations }) {
  const studyPlan = recommendations?.studyPlan ?? [];
  const trainingRoutine = recommendations?.trainingRoutine ?? [];

  return (
    <section>
      <SectionHeading
        eyebrow="Trabalho prático"
        title="Plano de estudo / Rotina de treino"
        description="Passos concretos que transformam o foco atual em hábitos enxadrísticos repetíveis."
      />

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white">Plano de estudo</h3>
          <div className="mt-5 grid gap-4">
            {studyPlan.length ? (
              studyPlan.map((item) => <PracticalStepCard key={item?.title} item={item} label="study" />)
            ) : (
              <EmptyState label="Ainda não foi gerado nenhum plano de estudo." />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white">Rotina de treino</h3>
          <div className="mt-5 grid gap-4">
            {trainingRoutine.length ? (
              trainingRoutine.map((item) => <PracticalStepCard key={item?.label} item={item} label="routine" />)
            ) : (
              <EmptyState label="Ainda não foi gerada nenhuma rotina de treino." />
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
