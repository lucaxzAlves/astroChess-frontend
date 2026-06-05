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

function SkillConstellationChart({ skills, overallScore }) {
  const visibleSkills = skills.slice(0, 8).map((skill) => ({
    ...skill,
    value: clampScore(skill.value),
  }));
  const center = 50;
  const maxRadius = 34;
  const labelRadius = 45;
  const points = visibleSkills.map((skill, index) => {
    const angle = -90 + (360 / visibleSkills.length) * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 7 + (skill.value / 100) * maxRadius;

    return {
      ...skill,
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
      axisX: center + maxRadius * Math.cos(radians),
      axisY: center + maxRadius * Math.sin(radians),
      labelX: center + labelRadius * Math.cos(radians),
      labelY: center + labelRadius * Math.sin(radians),
    };
  });
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-3xl border border-purple-500/25 bg-slate-950/60 p-4 shadow-inner shadow-purple-950/20">
      <div className="relative mx-auto aspect-square w-full max-w-[460px]">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Skill Matrix com pontuação geral ${overallScore}`}
        >
          <defs>
            <radialGradient id="analysisSkillGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
              <stop offset="62%" stopColor="rgba(168,85,247,0.12)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0)" />
            </radialGradient>
            <linearGradient id="analysisSkillFill" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.34)" />
              <stop offset="56%" stopColor="rgba(168,85,247,0.28)" />
              <stop offset="100%" stopColor="rgba(236,72,153,0.16)" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="43" fill="url(#analysisSkillGlow)" />
          {[12, 23, 34].map((radius) => (
            <circle
              key={radius}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="0.45"
            />
          ))}

          {points.map((point) => (
            <line
              key={`${point.key}-axis`}
              x1="50"
              y1="50"
              x2={point.axisX}
              y2={point.axisY}
              stroke="rgba(168,85,247,0.22)"
              strokeWidth="0.45"
            />
          ))}

          <polygon
            points={polygonPoints}
            fill="url(#analysisSkillFill)"
            stroke="rgba(34,211,238,0.78)"
            strokeLinejoin="round"
            strokeWidth="0.9"
          />

          {points.map((point) => (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="1.9" fill="#e9d5ff" />
              <circle
                cx={point.x}
                cy={point.y}
                r="3.8"
                fill="none"
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {points.map((point) => (
            <div
              key={`${point.key}-label`}
              className="absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${point.labelX}%`, top: `${point.labelY}%` }}
            >
              <p className="truncate text-[11px] font-semibold text-slate-200">{point.label}</p>
              <p className="text-[10px] text-purple-200">{point.value}</p>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-purple-300/30 bg-[#070711]/90 text-center shadow-[0_0_34px_rgba(168,85,247,0.24)]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">Score</p>
            <p className="mt-1 text-3xl font-semibold text-white">{overallScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
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

      <div className="grid gap-8 xl:grid-cols-[minmax(380px,0.9fr)_1.1fr] xl:items-center">
        <div className="grid gap-4">
          <SkillConstellationChart skills={skillEntries} overallScore={overallScore} />
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
