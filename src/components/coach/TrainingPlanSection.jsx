import { Badge, Card, EmptyState, SectionHeading } from "../profileDelta/ProfileDeltaUi.jsx";
import TodayPrescriptionCard from "./TodayPrescriptionCard.jsx";

export default function TrainingPlanSection({ trainingPlan }) {
  const weeklyBlocks = trainingPlan?.weeklyBlocks ?? [];
  const dailyTasks = trainingPlan?.dailyTasks ?? [];

  return (
    <section>
      <SectionHeading
        eyebrow="Plano de ação"
        title={`Plano de treino de ${trainingPlan?.durationWeeks ?? 0} semanas`}
        description="Uma progressão prática do diagnóstico ao trabalho diário."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <TodayPrescriptionCard prescription={trainingPlan?.todayPrescription} />

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-white">Blocos semanais</h3>
            <Badge tone="purple">{trainingPlan?.durationWeeks ?? 0} semanas</Badge>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {weeklyBlocks.length ? (
              weeklyBlocks.map((block) => (
                <div key={block?.weekLabel} className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
                  <p className="text-sm font-medium text-purple-300">{block?.weekLabel}</p>
                  <h4 className="mt-2 font-semibold text-white">{block?.theme}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{block?.objective}</p>
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
                    {(block?.tasks ?? []).map((task) => (
                      <li key={task}>- {task}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-medium leading-6 text-purple-200">{block?.successMetric}</p>
                </div>
              ))
            ) : (
              <EmptyState label="Os blocos semanais aparecerão aqui." />
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-6">
        <h3 className="text-2xl font-semibold text-white">Tarefas diárias</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {dailyTasks.length ? (
            dailyTasks.map((task) => (
              <div key={task?.label} className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-white">{task?.label}</h4>
                  <Badge tone="slate">{task?.duration}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-purple-300">{task?.frequency}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{task?.details}</p>
              </div>
            ))
          ) : (
            <EmptyState label="As tarefas diárias aparecerão depois que o plano for criado." />
          )}
        </div>
      </Card>
    </section>
  );
}
