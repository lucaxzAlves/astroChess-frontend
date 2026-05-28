import {
  Badge,
  Card,
  EmptyState,
  SectionHeading,
  severityTone,
} from "../profileDelta/ProfileDeltaUi.jsx";

function tokenize(value = "") {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 4);
}

function findRelatedMistakes(blocker, recurringMistakes = []) {
  const blockerTokens = new Set(
    tokenize(`${blocker?.title ?? ""} ${blocker?.whatHappens ?? ""} ${blocker?.howToImprove ?? ""}`),
  );

  return recurringMistakes
    .map((mistake) => {
      const mistakeText = `${mistake?.category ?? ""} ${mistake?.name ?? ""} ${mistake?.description ?? ""}`;
      const score = tokenize(mistakeText).filter((token) => blockerTokens.has(token)).length;
      return { mistake, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ mistake }) => mistake);
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeGameReference(reference) {
  if (!reference) return null;

  if (typeof reference === "string") {
    const isUrl = reference.startsWith("http://") || reference.startsWith("https://");
    return {
      id: reference,
      label: isUrl ? "Partida externa" : "Referência de partida disponível",
      url: isUrl ? reference : null,
      gameId: isUrl ? null : reference,
    };
  }

  const url =
    reference.url ||
    reference.gameUrl ||
    reference.chessComUrl ||
    reference.sourceUrl ||
    reference.reviewUrl ||
    null;
  const opponent = reference.opponent || reference.opponentName || reference.vs;
  const date = reference.date || reference.playedAt || reference.createdAt;
  const result = reference.result || reference.outcome;
  const move = reference.moveNumber ? `lance ${reference.moveNumber}` : null;
  const label = [opponent ? `vs ${opponent}` : reference.title || reference.gameId || reference.id, date, result, move]
    .filter(Boolean)
    .join(" · ");

  return {
    id: reference.id || reference.gameId || url || label,
    label: label || "Referência de partida disponível",
    url,
    gameId: reference.gameId || reference.id || null,
  };
}

function getGameReferences(blocker) {
  const references = [
    ...asArray(blocker?.referencedGames),
    ...asArray(blocker?.relatedGames),
    ...asArray(blocker?.gameRefs),
    ...asArray(blocker?.gameIds),
    ...asArray(blocker?.gameUrls),
    ...asArray(blocker?.examples).filter((example) => typeof example === "object"),
  ];

  const seen = new Set();
  return references
    .map(normalizeGameReference)
    .filter(Boolean)
    .filter((reference) => {
      const key = reference.url || reference.gameId || reference.label;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

function BlockerCard({ blocker, index, recurringMistakes }) {
  const relatedMistakes = findRelatedMistakes(blocker, recurringMistakes);
  const gameReferences = getGameReferences(blocker);

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-white/[0.04] to-slate-950/50 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-purple-300">Bloqueador de evolução {index + 1}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{blocker?.title}</h3>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">{blocker?.whatHappens}</p>
        </div>
        <Badge tone={severityTone(blocker?.severity)} className="px-3 py-1.5 text-sm">
          {blocker?.severity ?? "Desconhecido"}
        </Badge>
      </div>

      {relatedMistakes.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {relatedMistakes.map((mistake) => (
            <Badge key={mistake?.name} tone="slate">
              Erro ligado: {mistake?.name}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">O que acontece</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{blocker?.whatHappens}</p>
        </div>
        <div className="rounded-xl bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Como melhorar</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{blocker?.howToImprove}</p>
        </div>
        <div className="rounded-xl bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Exercícios</p>
          <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
            {(blocker?.exercises ?? []).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {gameReferences.length ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Partidas referenciadas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {gameReferences.map((reference) =>
              reference.url ? (
                <a
                  key={reference.id}
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-purple-300/25 bg-purple-300/[0.08] px-3 py-1.5 text-xs font-medium text-purple-100 transition hover:border-purple-300/45 hover:bg-purple-300/[0.14]"
                >
                  {reference.label}
                </a>
              ) : (
                <span
                  key={reference.id}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300"
                  title={reference.gameId || reference.label}
                >
                  {reference.label}
                </span>
              ),
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-purple-200">
          Impacto estimado: {blocker?.estimatedImpactLabel ?? "Impacto pendente"}
        </p>
        <button
          type="button"
          className="rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:bg-purple-400"
        >
          Iniciar exercício do bloqueador
        </button>
      </div>
    </Card>
  );
}

export default function GrowthBlockersSection({ growthBlockers = [], recurringMistakes = [] }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Diagnóstico prioritário"
        title="Principais bloqueadores de evolução"
        description="O coach transforma estes vazamentos do perfil em treino. Eles ficam em destaque porque são os limites de maior impacto no crescimento de rating."
      />

      {growthBlockers.length ? (
        <div className="grid gap-5">
          {growthBlockers.map((blocker, index) => (
            <BlockerCard
              key={blocker?.title}
              blocker={blocker}
              index={index}
              recurringMistakes={recurringMistakes}
            />
          ))}
        </div>
      ) : (
        <EmptyState label="Ainda não foram gerados bloqueadores de evolução." />
      )}
    </section>
  );
}
