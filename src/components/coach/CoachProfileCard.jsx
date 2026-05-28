import { Badge, Card } from "../profileDelta/ProfileDeltaUi.jsx";

const coach = {
  name: "Coach Orion",
  personality: "Calmo, preciso, exigente",
  level: "Avançado",
  philosophy: "Pequenas correções diárias criam crescimento de rating no longo prazo.",
};

export default function CoachProfileCard({ profileDelta }) {
  const primaryStyle = profileDelta?.playingStyle?.primaryStyle ?? "Estilo desconhecido";
  const currentFocus = profileDelta?.recommendations?.currentFocus;
  const riskProfile = profileDelta?.decisionPatterns?.riskProfile ?? "Perfil de risco pendente";
  const warning = profileDelta?.profileConfidence?.warning;
  const tags = [
    currentFocus?.title,
    primaryStyle,
    "Decisões práticas",
    "Conversão",
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-white/[0.05] to-slate-950/60 p-6 shadow-2xl shadow-purple-950/20">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-center">
        <div className="flex flex-col items-center rounded-3xl border border-purple-500/25 bg-slate-950/55 p-6 text-center">
          <div className="grid h-28 w-28 place-items-center rounded-3xl border border-purple-400/40 bg-purple-500/10 text-4xl font-semibold text-purple-200 shadow-[0_0_50px_rgba(168,85,247,0.28)]">
            CO
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-white">{coach.name}</h2>
          <p className="mt-1 text-sm text-purple-300">Mentor de {primaryStyle}</p>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            "Seu próximo salto vem de transformar o diagnóstico em escolhas de lance repetíveis,
            especialmente quando o relógio começa a apertar."
          </p>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Personalidade", coach.personality],
              ["Foco principal", currentFocus?.title ?? "Aguardando foco do perfil"],
              ["Perfil de risco", riskProfile],
              ["Filosofia", coach.philosophy],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="purple">{coach.level}</Badge>
            {tags.map((tag) => (
              <Badge key={tag} tone="slate">
                {tag}
              </Badge>
            ))}
          </div>

          {warning ? (
            <p className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm leading-6 text-yellow-100">
              Este plano pode mudar depois que mais partidas forem analisadas.
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
