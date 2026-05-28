import { useEffect, useMemo, useState } from "react";
import { Badge, Card, ProgressBar, SectionHeading, severityTone } from "../../profileDelta/ProfileDeltaUi.jsx";
import { useLanguage } from "../../../contexts/LanguageContext.jsx";

function modeTone(mode = "") {
  if (mode.includes("Pattern")) return "rose";
  if (mode.includes("Personal")) return "yellow";
  if (mode.includes("Academy")) return "purple";
  if (mode.includes("Master")) return "emerald";
  return "slate";
}

function StatTile({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}

function GrowthBlockerStrip({ blockers = [], isFallback }) {
  return (
    <section>
      <SectionHeading
        eyebrow={isFallback ? "Bloqueadores demo" : "Principais bloqueadores"}
        title="O que o plano tenta corrigir primeiro"
        description={
          isFallback
            ? "Estes são bloqueadores de exemplo. Eles serão substituídos pelo seu playerProfile quando houver partidas analisadas o suficiente."
            : "Os problemas de maior impacto extraídos dos erros recorrentes e recomendações do coach."
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {blockers.slice(0, 3).map((blocker, index) => (
          <Card
            key={`${blocker?.title || index}-${index}`}
            className={[
              "p-5",
              index === 0 ? "border-rose-300/25 bg-rose-400/[0.07]" : "bg-white/[0.035]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Bloqueador #{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{blocker?.title}</h3>
              </div>
              <Badge tone={severityTone(blocker?.severity)}>{blocker?.severity || "prioridade"}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{blocker?.whatHappens}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Evidência</p>
              <p className="mt-1 text-sm text-slate-300">
                {blocker?.estimatedImpactLabel || blocker?.howToImprove || "Evidência do perfil"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TrainingCommandCenter({ plan }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Plano de treino"
        title="Centro de comando de treino"
        description="Seu plano atual de evolução, construído a partir das suas partidas, fraquezas e prioridades de treino."
        action={<Badge tone={plan.isFallback ? "yellow" : "emerald"}>{plan.sourceLabel}</Badge>}
      />

      <Card className="overflow-hidden border-purple-400/25 bg-[linear-gradient(135deg,rgba(168,85,247,0.16),rgba(15,23,42,0.58),rgba(2,6,23,0.74))] p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <div className="rounded-[28px] border border-purple-300/25 bg-purple-300/[0.07] p-5 shadow-[0_24px_80px_rgba(88,28,135,0.20)]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="purple">Foco atual</Badge>
              <Badge tone="slate">{plan.currentFocus.source}</Badge>
              <Badge tone={plan.currentFocus.confidence >= 70 ? "emerald" : "yellow"}>
                {plan.currentFocus.confidence}/100 confiança
              </Badge>
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              {plan.currentFocus.title}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              {plan.currentFocus.reason}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fraqueza ligada</p>
                <p className="mt-2 text-sm font-semibold text-white">{plan.currentFocus.linkedWeakness}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Benefício esperado</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{plan.currentFocus.expectedBenefit}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fase de treino</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{plan.phase.name}</h3>
                </div>
                <Badge tone="purple">{plan.planStatus.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{plan.phase.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatTile label="Duração" value={plan.planStatus.duration} detail={plan.planStatus.currentWeek} />
              <StatTile label="Minutos por dia" value={plan.planStatus.dailyMinutes} detail="Carga recomendada" />
              <StatTile label="Progresso do plano" value={`${plan.planStatus.completion}%`} detail="Estimado localmente" />
              <StatTile label="Próxima revisão" value={plan.planStatus.nextReviewDate} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {plan.priorityAreas.map((area) => (
            <div
              key={`${area.rank}-${area.title}`}
              className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="purple">Prioridade {area.rank}</Badge>
                <Badge tone={severityTone(area.severity)}>{area.severity}</Badge>
              </div>
              <h4 className="mt-3 text-lg font-semibold text-white">{area.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">{area.why}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Evidência</p>
                <p className="mt-1 text-sm text-slate-300">{area.evidence}</p>
              </div>
              <Badge tone={modeTone(area.mode)} className="mt-4">
                {area.mode}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function WeeklyRoadmap({ roadmap = [] }) {
  const [selectedWeekId, setSelectedWeekId] = useState(roadmap[0]?.id || "");
  const [expandedWeekIds, setExpandedWeekIds] = useState(() => new Set([roadmap[0]?.id].filter(Boolean)));
  const selectedWeek = roadmap.find((week) => week.id === selectedWeekId) || roadmap[0];

  useEffect(() => {
    if (!roadmap.length) return;
    setSelectedWeekId((current) => current && roadmap.some((week) => week.id === current) ? current : roadmap[0].id);
    setExpandedWeekIds((current) => {
      const next = new Set([...current].filter((weekId) => roadmap.some((week) => week.id === weekId)));
      if (roadmap[0]?.id) next.add(roadmap[0].id);
      return next;
    });
  }, [roadmap]);

  const toggleExpanded = (weekId) => {
    setExpandedWeekIds((current) => {
      const next = new Set(current);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  };

  return (
    <section>
      <SectionHeading
        eyebrow="Roadmap"
        title="Roadmap semanal de treino"
        description="Uma progressão de reparo, reconhecimento mais forte e revisão."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          {roadmap.map((week, index) => {
            const selected = selectedWeek?.id === week.id;
            const expanded = expandedWeekIds.has(week.id);
            const completed = week.status === "completed";
            const current = week.status === "current";

            return (
              <Card
                key={week.id}
                className={[
                  "p-5",
                  selected || current
                    ? "border-purple-300/35 bg-purple-500/[0.08] shadow-[0_0_42px_rgba(168,85,247,0.12)]"
                    : completed
                      ? "bg-emerald-400/[0.04]"
                      : "bg-white/[0.03]",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setSelectedWeekId(week.id)}
                  className="flex w-full flex-col gap-4 text-left md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex gap-4">
                    <div
                      className={[
                        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-sm font-semibold",
                        current
                          ? "border-purple-300/45 bg-purple-300 text-slate-950"
                          : completed
                            ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
                            : "border-white/10 bg-slate-950/60 text-slate-300",
                      ].join(" ")}
                    >
                      {completed ? "✓" : index + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-purple-300">{week.weekLabel}</p>
                        <Badge tone={current ? "purple" : completed ? "emerald" : "slate"}>
                          {week.status}
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-white">{week.focus}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{week.goal}</p>
                    </div>
                  </div>
                  <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300">
                    Selecionar
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleExpanded(week.id)}
                  className="mt-4 text-sm font-semibold text-purple-200 transition hover:text-purple-100"
                >
                  {expanded ? "Ocultar tarefas" : "Mostrar tarefas"}
                </button>

                {expanded ? (
                  <div className="mt-4 grid gap-2">
                    {week.tasks.map((task) => (
                      <div
                        key={task}
                        className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm leading-6 text-slate-300"
                      >
                        {task}
                      </div>
                    ))}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        <Card className="sticky top-8 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bloco selecionado</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{selectedWeek?.focus}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{selectedWeek?.goal}</p>
          <div className="mt-5 rounded-2xl border border-purple-300/20 bg-purple-300/[0.07] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-purple-200">Resultado esperado</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{selectedWeek?.expectedOutcome}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}

function TodayPrescription({ prescription }) {
  const [completed, setCompleted] = useState(false);
  const [sentToPractice, setSentToPractice] = useState(false);

  return (
    <section>
      <SectionHeading
        eyebrow="Trabalho diário"
        title="Prescrição de hoje"
        description="Uma tarefa concreta para a sessão de treino de hoje, ligada à prioridade atual do perfil."
      />

      <Card className="overflow-hidden border-amber-200/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.11),rgba(168,85,247,0.10),rgba(15,23,42,0.64))] p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={completed ? "emerald" : "yellow"}>
                {completed ? "Concluído" : prescription.difficulty}
              </Badge>
              <Badge tone={modeTone(prescription.mode)}>{prescription.mode}</Badge>
              <Badge tone="slate">{prescription.duration}</Badge>
            </div>
            <h3 className="mt-4 text-3xl font-semibold text-white">{prescription.task}</h3>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{prescription.reason}</p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fraqueza ligada</p>
                <p className="mt-2 text-sm font-semibold text-white">{prescription.linkedWeakness}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ganho esperado</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{prescription.expectedGain}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
            <p className="text-sm font-semibold text-white">Checklist</p>
            <div className="mt-4 grid gap-2">
              {prescription.checklist.map((item) => (
                <label
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm leading-6 text-slate-300"
                >
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-purple-500" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSentToPractice(true)}
            className="rounded-2xl border border-purple-300/30 bg-purple-300/10 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-300/20"
          >
            {sentToPractice ? "Enviado para Practice" : "Enviar para Practice"}
          </button>
          <button
            type="button"
            onClick={() => setCompleted(true)}
            disabled={completed}
            className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:bg-emerald-500"
          >
            {completed ? "Marcado como concluído" : "Marcar como concluído"}
          </button>
        </div>
      </Card>
    </section>
  );
}

function TrainingBlockCard({ block, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(block)}
      className={[
        "group flex h-full flex-col rounded-[26px] border p-5 text-left transition-all duration-300",
        selected
          ? "border-purple-300/40 bg-purple-500/[0.10] shadow-[0_0_40px_rgba(168,85,247,0.14)]"
          : "border-white/10 bg-white/[0.035] hover:-translate-y-1 hover:border-purple-300/30 hover:bg-purple-500/[0.055]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={severityTone(block.difficulty)}>{block.difficulty}</Badge>
        <Badge tone="slate">{block.frequency}</Badge>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{block.title}</h3>
      <p className="mt-2 text-sm text-purple-200">{block.category}</p>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{block.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {block.modes.map((mode) => (
          <Badge key={mode} tone={modeTone(mode)}>
            {mode}
          </Badge>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Alvo</p>
        <p className="mt-1 text-sm font-medium text-slate-200">{block.targetWeakness}</p>
      </div>
    </button>
  );
}

function TrainingBlocks({ blocks = [] }) {
  const [selectedBlock, setSelectedBlock] = useState(blocks[0] || null);

  useEffect(() => {
    if (!blocks.length) {
      setSelectedBlock(null);
      return;
    }

    setSelectedBlock((current) =>
      current && blocks.some((block) => block.id === current.id) ? current : blocks[0]
    );
  }, [blocks]);

  return (
    <section>
      <SectionHeading
        eyebrow="Biblioteca de exercícios"
        title="Blocos de treino recomendados"
        description="Blocos concretos gerados a partir de fraquezas, recomendações e sinais do mapa de habilidades."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {blocks.map((block) => (
            <TrainingBlockCard
              key={block.id}
              block={block}
              selected={selectedBlock?.id === block.id}
              onSelect={setSelectedBlock}
            />
          ))}
        </div>

        <Card className="sticky top-8 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bloco selecionado</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{selectedBlock?.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{selectedBlock?.description}</p>
          <div className="mt-5 grid gap-3">
            <StatTile label="Duração" value={selectedBlock?.duration} />
            <StatTile label="Frequência" value={selectedBlock?.frequency} />
            <StatTile label="Evidência" value={selectedBlock?.evidence} />
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400"
          >
            Iniciar este bloco
          </button>
        </Card>
      </div>
    </section>
  );
}

function TrainingProgress({ progress, confidence }) {
  const habitLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const habitClass = {
    completed: "border-purple-300/40 bg-purple-400/80 text-slate-950",
    missed: "border-rose-300/30 bg-rose-400/20 text-rose-100",
    rest: "border-white/10 bg-slate-700/50 text-slate-300",
    pending: "border-white/10 bg-slate-950/65 text-slate-500",
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <SectionHeading
          eyebrow="Consistência"
          title="Progresso de treino"
          description="Prévia de progresso do seu plano atual de treino."
        />
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-5">
            <StatTile label="Conclusão semanal" value={`${progress.weeklyCompletion}%`} />
            <StatTile label="Sequência atual" value={`${progress.currentStreak} dias`} />
            <StatTile label="Tarefas concluídas" value={progress.tasksCompleted} />
            <StatTile label="Consistência do foco" value={`${progress.focusConsistency}%`} />
            <StatTile label="Progresso do plano" value={`${progress.estimatedPlanProgress}%`} />
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Últimos 7 dias</p>
              <Badge tone="slate">grade de hábito</Badge>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {progress.habitDays.map((status, index) => (
                <div
                  key={`${status}-${index}`}
                  className={`grid aspect-square place-items-center rounded-2xl border text-xs font-semibold ${habitClass[status] || habitClass.pending}`}
                  title={`${habitLabels[index]}: ${status}`}
                >
                  {habitLabels[index].slice(0, 1)}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <PlanConfidenceCard confidence={confidence} />
    </section>
  );
}

function PlanConfidenceCard({ confidence }) {
  const overall = Number(confidence?.overall || 0);
  const basedOnGames = Number(confidence?.basedOnGames || 0);
  const early = overall < 75 || basedOnGames < 25 || Boolean(confidence?.warning);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Qualidade dos dados</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Confiança do plano</h3>
        </div>
        <Badge tone={early ? "yellow" : "emerald"}>{overall || "N/A"}/100</Badge>
      </div>
      <ProgressBar value={overall} tone={early ? "yellow" : "emerald"} className="mt-5" />
      <div className="mt-5 grid gap-3">
        <StatTile label="Baseado em partidas" value={basedOnGames || "Pendente"} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-sm leading-6 text-slate-300">
            {confidence?.warning ||
              "Este plano de treino fica mais preciso conforme mais partidas são analisadas."}
          </p>
          {early ? (
            <p className="mt-3 text-sm leading-6 text-yellow-100/90">
              O perfil ainda está no início. Analise mais partidas para melhorar as recomendações.
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function CoachTrainingPlan({ plan }) {
  const { t } = useLanguage();
  const normalizedPlan = useMemo(() => plan, [plan]);

  if (!normalizedPlan) return null;

  return (
    <div className="grid gap-8">
      <div className="rounded-[32px] border border-purple-300/20 bg-purple-500/[0.045] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-300">
              {t("aiCoachTraining.commandLabel", "Camada de comando de treino")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              {t("aiCoachTraining.title", "Seu roadmap de evolução")}
            </h2>
          </div>
          <Badge tone={normalizedPlan.isFallback ? "yellow" : "emerald"}>
            {normalizedPlan.isFallback ? "Demo provisório" : "Personalizado"}
          </Badge>
        </div>
      </div>

      <GrowthBlockerStrip blockers={normalizedPlan.growthBlockers} isFallback={normalizedPlan.isFallback} />
      <TrainingCommandCenter plan={normalizedPlan} />
      <WeeklyRoadmap roadmap={normalizedPlan.weeklyRoadmap} />
      <TodayPrescription prescription={normalizedPlan.todayPrescription} />
      <TrainingBlocks blocks={normalizedPlan.trainingBlocks} />
      <TrainingProgress progress={normalizedPlan.progress} confidence={normalizedPlan.confidence} />
    </div>
  );
}
