import { Badge } from "../profileDelta/ProfileDeltaUi.jsx";

const deliverables = [
  "Mapa de habilidades e perfil de decisão",
  "Erros recorrentes e pontos fortes",
  "Padrões do repertório de aberturas",
  "Prioridades de treino e próximos exercícios",
];

export default function GeneralAnalysisCard({
  connectedUsername,
  onStart,
  hasDraftReady = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-purple-500/25 bg-[linear-gradient(135deg,rgba(29,18,51,0.96),rgba(12,14,22,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:p-7">
      <div className="absolute inset-0">
        <div className="absolute left-[-6%] top-[-20%] h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[10%] h-48 w-48 rounded-full bg-fuchsia-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Fluxo principal</Badge>
            <Badge tone={hasDraftReady ? "emerald" : "slate"}>
              {hasDraftReady ? "Configuração pronta" : "Precisa configurar"}
            </Badge>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Revele seu perfil de xadrez
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Analise um grupo selecionado de partidas para revelar erros recorrentes,
            pontos fortes, sinais de estilo, padrões de abertura e prioridades
            de treino que o coach deve atacar primeiro.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {deliverables.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Fonte da análise
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {connectedUsername
                ? `Conta Chess.com conectada como ${connectedUsername}`
                : "Nenhum usuário do Chess.com conectado ainda. Você ainda pode configurar a análise e conectar o usuário depois."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(88,28,135,0.45)] transition hover:bg-purple-400"
            >
              Iniciar análise
            </button>
            <p className="text-sm text-slate-400">
              Isso enviará as partidas selecionadas ao AstroChess e atualizará seu perfil de coach.
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-purple-200">
              O que o coach vai produzir
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              Uma análise profunda do perfil com consequências práticas para o treino.
            </p>
          </div>

          {[
            ["Mapa de habilidades", "Mostra o equilíbrio entre cálculo, técnica, aberturas e gestão de tempo."],
            ["Vazamentos recorrentes", "Identifica erros repetidos que prejudicam sua evolução de rating."],
            ["Plano de treino", "Transforma o diagnóstico em exercícios, prioridades e próximos passos."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
