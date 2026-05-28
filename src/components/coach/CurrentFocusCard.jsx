import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  SectionHeading,
  humanizeKey,
} from "../profileDelta/ProfileDeltaUi.jsx";

function getWeakestSkills(skillMap = {}) {
  return Object.entries(skillMap)
    .filter(([key, value]) => key !== "overallScore" && value && typeof value === "object")
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value: value?.value ?? 0,
      description: value?.description,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);
}

export default function CurrentFocusCard({ profileDelta }) {
  const currentFocus = profileDelta?.recommendations?.currentFocus;
  const weakestSkills = getWeakestSkills(profileDelta?.skillMap);
  const linkedMistakes = currentFocus?.linkedMistakes ?? [];
  const decisionPatterns = profileDelta?.decisionPatterns;

  if (!currentFocus) {
    return <EmptyState label="O foco atual aparecerá depois que as recomendações forem geradas." />;
  }

  return (
    <Card className="p-6">
      <SectionHeading
        eyebrow="Foco do coach"
        title="Foco atual"
        description="Por que o coach está priorizando este tema de treino agora."
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-purple-500/25 bg-purple-500/10 p-5">
          <Badge tone="purple">Treinando agora</Badge>
          <h3 className="mt-4 text-2xl font-semibold text-white">{currentFocus?.title}</h3>
          <p className="mt-3 text-sm leading-6 text-purple-50/85">{currentFocus?.summary}</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">{currentFocus?.whyItMatters}</p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Evidência da habilidade mais fraca</p>
            <div className="mt-4 grid gap-3">
              {weakestSkills.map((skill) => (
                <div key={skill.key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{skill.label}</span>
                    <span className="font-medium text-rose-200">{skill.value}</span>
                  </div>
                  <ProgressBar value={skill.value} tone="rose" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Diagnóstico ligado</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {linkedMistakes.map((mistake) => (
                <Badge key={mistake} tone="slate">
                  {mistake}
                </Badge>
              ))}
              <Badge tone="purple">{decisionPatterns?.riskProfile ?? "Perfil de risco pendente"}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{decisionPatterns?.description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
