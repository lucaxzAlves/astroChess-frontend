import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  SectionHeading,
  formatDate,
  formatPercent,
} from "../profileDelta/ProfileDeltaUi.jsx";

function OpeningCard({ opening }) {
  const eco = opening?.ECO ?? opening?.eco ?? "ECO";
  const commonMistakes = opening?.commonMistakes ?? opening?.mistakes ?? [];
  const recurringIssues = opening?.recurringIssues ?? opening?.issues ?? opening?.keyIssues ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="purple">{eco}</Badge>
            <Badge tone="slate">{opening?.games ?? 0} partidas</Badge>
          </div>
          <h3 className="mt-3 font-semibold text-white">{opening?.name ?? "Abertura sem nome"}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">{opening?.moves ?? "Lances indisponíveis"}</p>
        </div>
        <div className="min-w-24 text-left sm:text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pontuação</p>
          <p className="mt-1 text-lg font-semibold text-purple-200">{formatPercent(opening?.scorePercent)}</p>
        </div>
      </div>

      <ProgressBar value={opening?.scorePercent} className="mt-4" />

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Erros comuns</p>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-slate-300">
            {commonMistakes.length ? commonMistakes.map((mistake) => (
              <li key={String(mistake)}>- {String(mistake)}</li>
            )) : <li>Nenhum erro comum registrado.</li>}
          </ul>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Estudo recomendado</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {opening?.recommendedStudy ?? "Sem recomendação específica ainda."}
          </p>
          <p className="mt-3 text-xs text-slate-500">Visto por último: {formatDate(opening?.lastSeenAt)}</p>
        </div>
      </div>

      {recurringIssues.length ? (
        <div className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-100/70">Problemas recorrentes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recurringIssues.map((issue) => (
              <span
                key={String(issue)}
                className="rounded-full border border-amber-300/20 bg-slate-950/40 px-2.5 py-1 text-xs text-amber-100"
              >
                {String(issue)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OpeningGroup({ title, description, openings }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        <Badge tone="slate">{openings.length} linhas</Badge>
      </div>
      <div className="grid gap-4">
        {openings.length ? (
          openings.map((opening) => (
            <OpeningCard key={`${opening?.ECO ?? opening?.eco}-${opening?.name}`} opening={opening} />
          ))
        ) : (
          <EmptyState label="Ainda não há evidências de abertura neste grupo." />
        )}
      </div>
    </div>
  );
}

export default function OpeningRepertoireSection({ openingRepertoire }) {
  const whiteOpenings = openingRepertoire?.asWhite ?? [];
  const blackGroups = [
    ["Contra 1.e4", "Defesas e sistemas usados contra o primeiro lance mais tático.", openingRepertoire?.asBlack?.againstE4 ?? []],
    ["Contra 1.d4", "Estruturas de peões e planos recorrentes contra jogos fechados.", openingRepertoire?.asBlack?.againstD4 ?? []],
    ["Contra outros primeiros lances", "Respostas contra Inglesa, Réti, sistemas laterais e transposições.", openingRepertoire?.asBlack?.againstOther ?? []],
  ];

  return (
    <section>
      <SectionHeading
        eyebrow="Mapa de ordem de lances"
        title="Repertório de aberturas"
        description="Evidências compactas do repertório, com planos, pontuação e lacunas comuns que alimentam o diagnóstico do perfil."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <OpeningGroup
            title="Jogando de brancas"
            description="Linhas em que você dita o primeiro plano e precisa transformar iniciativa em posições jogáveis."
            openings={whiteOpenings}
          />
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Jogando de pretas</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Separação por primeiro lance do adversário para deixar claro onde o repertório precisa de reforço.
              </p>
            </div>
            <Badge tone="purple">
              {blackGroups.reduce((sum, [, , openings]) => sum + openings.length, 0)} linhas
            </Badge>
          </div>
          <div className="grid gap-4">
            {blackGroups.map(([title, description, openings]) => (
              <OpeningGroup key={title} title={title} description={description} openings={openings} />
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
