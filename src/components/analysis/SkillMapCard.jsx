import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  clampScore,
  formatPercent,
  humanizeKey,
} from "../profileDelta/ProfileDeltaUi.jsx";

const skillLabels = {
  calculation: "Cálculo",
  positionalUnderstanding: "Compreensão posicional",
  openings: "Aberturas",
  tacticalThemes: "Temas táticos",
  endgames: "Finais",
  middlegame: "Meio-jogo",
  timeManagement: "Gestão do tempo",
  psychologicalResilience: "Resiliência psicológica",
};

function getSkillEntries(skillMap = {}) {
  return Object.entries(skillMap)
    .filter(([key, value]) => key !== "overallScore" && value && typeof value === "object")
    .map(([key, value]) => ({
      key,
      label: skillLabels[key] ?? humanizeKey(key),
      ...value,
      value: value?.value ?? 0,
    }));
}

export default function SkillMapCard({ skillMap, timeRange }) {
  const skillEntries = getSkillEntries(skillMap);
  const overallScore =
    skillMap?.overallScore ??
    Math.round(skillEntries.reduce((sum, skill) => sum + Number(skill.value || 0), 0) / (skillEntries.length || 1));
  const weakestSkill = [...skillEntries].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
  const strongestSkill = [...skillEntries].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];

  if (!skillEntries.length) {
    return <EmptyState label="Ainda não foi gerado nenhum mapa de habilidades." />;
  }

  return (
    <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-white/[0.05] to-slate-950/60 p-5 shadow-2xl shadow-purple-950/20 sm:p-8">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent" />

      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-300">
            Núcleo diagnóstico
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Skill Matrix</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            O painel principal do diagnóstico: força prática, confiança e evidências
            por área para mostrar onde o AstroChess enxerga evolução imediata.
          </p>
        </div>
        <Badge tone="purple" className="px-4 py-2 text-sm">
          {timeRange}
        </Badge>
      </div>

      <div className="grid gap-8 xl:grid-cols-[380px_1fr] xl:items-center">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-purple-500/25 bg-slate-950/60 p-8 shadow-inner shadow-purple-950/20">
          <div
            className="grid h-56 w-56 place-items-center rounded-full border border-purple-400/40 shadow-[0_0_70px_rgba(168,85,247,0.28)]"
            style={{
              background: `conic-gradient(rgb(168 85 247) ${clampScore(overallScore) * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            }}
          >
            <div className="grid h-40 w-40 place-items-center rounded-full border border-white/10 bg-[#090b10] text-center shadow-2xl shadow-black/40">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-purple-300">
                  Pontuação geral
                </p>
                <p className="mt-2 text-6xl font-semibold text-white">{overallScore}</p>
                <p className="mt-1 text-xs text-slate-500">de 100</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid w-full gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Leitura mais forte</p>
              <p className="mt-1 text-sm font-medium text-emerald-200">
                {strongestSkill?.label ?? "Aguardando dados"} {strongestSkill ? `(${strongestSkill.value})` : ""}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Vazamento mais urgente</p>
              <p className="mt-1 text-sm font-medium text-rose-200">
                {weakestSkill?.label ?? "Aguardando dados"} {weakestSkill ? `(${weakestSkill.value})` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {skillEntries.map((skill) => (
            <div
              key={skill.key}
              className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 transition duration-200 hover:border-purple-500/30 hover:bg-purple-500/[0.06]"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-white">{skill.label}</p>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-sm font-semibold text-purple-300">
                  {skill.value}
                </span>
              </div>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-400">{skill.description}</p>
              <div className="mt-4">
                <ProgressBar value={skill.value} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Badge tone="slate">Confiança {formatPercent(skill.confidence)}</Badge>
                <Badge tone="slate">{skill.evidenceCount ?? 0} evidências</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
