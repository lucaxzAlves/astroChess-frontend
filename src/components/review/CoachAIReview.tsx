import {
  findMovePlyByPartialReference,
  findMovePlyByReference,
  formatMoveReference,
  splitTextByMoveReferences,
} from "../../utils/reviewMoveNavigation";
import { getUserFriendlyError } from "../../utils/userFriendlyErrors";

type ReviewedMove = {
  ply?: number;
  moveNumber?: number;
  color?: string;
  san?: string;
};

type AiReview = {
  success?: boolean;
  error?: string | null;
  reviewText?: string;
  structuredSummary?: Record<string, any> | null;
};

type CentralLesson = {
  title: string;
  text: string;
  source?: string;
};

type CoachAIReviewProps = {
  aiReview: AiReview | null;
  hasAnalysis: boolean;
  analyzedMoves: ReviewedMove[];
  onNavigateToPly: (ply: number) => void;
};

function SeverityBadge({ severity }: { severity?: string | null }) {
  if (!severity) return null;

  const normalized = severity.toLowerCase();
  const tone =
    normalized === "critical" || normalized === "high"
      ? `coach-ai-severity-${normalized === "critical" ? "critical" : "high"}`
      : normalized === "medium"
        ? "coach-ai-severity-medium"
        : "coach-ai-severity-low";

  return <span className={`coach-ai-badge ${tone}`}>{severity}</span>;
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="coach-ai-field">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

function MoveLink({
  moveRef,
  analyzedMoves,
  onNavigateToPly,
}: {
  moveRef: unknown;
  analyzedMoves: ReviewedMove[];
  onNavigateToPly: (ply: number) => void;
}) {
  const ply = findMovePlyByReference(moveRef, analyzedMoves);
  const label = typeof moveRef === "string" || typeof moveRef === "number" ? String(moveRef) : "";

  if (!ply) {
    return label ? <span>{label}</span> : null;
  }

  return (
    <button type="button" className="review-move-link" onClick={() => onNavigateToPly(ply)}>
      {label}
    </button>
  );
}

function PartialMoveLink({
  moveNumber,
  san,
  color,
  analyzedMoves,
  onNavigateToPly,
}: {
  moveNumber?: number | null;
  san?: string | null;
  color?: string | null;
  analyzedMoves: ReviewedMove[];
  onNavigateToPly: (ply: number) => void;
}) {
  const ply = findMovePlyByPartialReference({
    moveNumber,
    san,
    color,
    analyzedMoves,
  });

  const label = formatMoveReference({ moveNumber, color, san }) || (moveNumber ? `Lance ${moveNumber}` : "");

  if (!ply || !label) {
    return label ? <span>{label}</span> : null;
  }

  return (
    <button type="button" className="review-move-link" onClick={() => onNavigateToPly(ply)}>
      {label}
    </button>
  );
}

function renderReviewText(
  reviewText: string | undefined,
  analyzedMoves: ReviewedMove[],
  onNavigateToPly: (ply: number) => void
) {
  if (!reviewText?.trim()) return null;

  const lines = reviewText.split("\n");

  return (
    <div className="coach-ai-markdown">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`space-${index}`} className="coach-ai-markdown-space" />;
        }

        if (trimmed.startsWith("###")) {
          return (
            <h4 key={`heading-${index}`} className="coach-ai-markdown-heading">
              {trimmed.replace(/^###\s*/, "")}
            </h4>
          );
        }

        const content = splitTextByMoveReferences(trimmed).map((part, partIndex) => {
          const ply = findMovePlyByReference(part, analyzedMoves);

          if (ply) {
            return (
              <button
                key={`move-${index}-${partIndex}`}
                type="button"
                className="review-move-link"
                onClick={() => onNavigateToPly(ply)}
              >
                {part}
              </button>
            );
          }

          return <span key={`text-${index}-${partIndex}`}>{part}</span>;
        });

        if (trimmed.startsWith("*")) {
          return (
            <div key={`bullet-${index}`} className="coach-ai-markdown-bullet">
              <span>•</span>
              <p>{content}</p>
            </div>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="coach-ai-markdown-paragraph">
            {content}
          </p>
        );
      })}
    </div>
  );
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getObjectText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  return (
    normalizeString(record.text) ||
    normalizeString(record.summary) ||
    normalizeString(record.lesson) ||
    normalizeString(record.description) ||
    normalizeString(record.value)
  );
}

function extractSectionFromReviewText(
  reviewText: string | undefined,
  headingMatchers: RegExp[]
): string {
  if (!reviewText?.trim()) return "";

  const lines = reviewText.split("\n");
  const startIndex = lines.findIndex((line) => {
    const cleaned = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
    return headingMatchers.some((matcher) => matcher.test(cleaned));
  });

  if (startIndex < 0) return "";

  const collected: string[] = [];
  const cleanedStartLine = lines[startIndex].replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
  const inlineText = cleanedStartLine.replace(/^[^:：]+[:：]\s*/, "").trim();

  if (inlineText && inlineText !== cleanedStartLine) {
    collected.push(inlineText);
  }

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    const possibleHeading = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
    const isHeadingBoundary =
      Boolean(trimmed) &&
      (/^#{1,6}\s+/.test(trimmed) ||
        (/^\*\*[^*]{2,90}\*\*:?\s*$/.test(trimmed) && !trimmed.includes(". ")) ||
        (/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][^.!?]{2,80}:\s*$/.test(possibleHeading) &&
          !headingMatchers.some((matcher) => matcher.test(possibleHeading))));

    if (isHeadingBoundary) break;
    if (trimmed && headingMatchers.some((matcher) => matcher.test(trimmed.replace(/\*\*/g, "")))) {
      continue;
    }

    collected.push(
      trimmed
        .replace(/^[-*]\s+/, "")
        .replace(/\*\*/g, "")
        .trim()
    );
  }

  return collected.join(" ").replace(/\s+/g, " ").trim();
}

function getCentralLesson(
  structured: Record<string, any>,
  reviewText: string | undefined
): CentralLesson | null {
  const candidates = [
    structured.centralLesson,
    structured.coreLesson,
    structured.mainLesson,
    structured.matchCentralLesson,
    structured.gameLesson,
    structured.lesson,
  ];

  for (const candidate of candidates) {
    const text = getObjectText(candidate);
    if (text) {
      const title =
        typeof candidate === "object" && candidate
          ? normalizeString((candidate as Record<string, unknown>).title)
          : "";
      return {
        title: title || "Lição central da partida",
        text,
        source: "structuredSummary",
      };
    }
  }

  const extracted = extractSectionFromReviewText(reviewText, [
    /li[cç][aã]o central/i,
    /central lesson/i,
    /main lesson/i,
    /principal li[cç][aã]o/i,
  ]);

  if (extracted) {
    return {
      title: "Lição central da partida",
      text: extracted,
      source: "reviewText",
    };
  }

  const decisiveMoment = structured.decisiveMoment;
  const victoryConstruction = structured.victoryConstruction;
  const fallbackText =
    normalizeString(decisiveMoment?.betterPlan) ||
    normalizeString(victoryConstruction?.mainStrategicCause) ||
    (Array.isArray(structured.recommendedFocus) ? normalizeString(structured.recommendedFocus[0]) : "");

  if (!fallbackText) return null;

  return {
    title: "Lição central da partida",
    text: fallbackText,
    source: "derived",
  };
}

export default function CoachAIReview({
  aiReview,
  hasAnalysis,
  analyzedMoves,
  onNavigateToPly,
}: CoachAIReviewProps) {
  if (!hasAnalysis) {
    return (
      <section className="coach-ai-empty-state">
        <h3>Start a review to generate AI coach insights.</h3>
        <p>The Coach AI tab will populate automatically from the same analysis response.</p>
      </section>
    );
  }

  if (!aiReview) {
    return (
      <section className="coach-ai-empty-state">
        <h3>AI review was not generated for this game.</h3>
        <p>The analysis finished, but no AI coach content was returned.</p>
      </section>
    );
  }

  if (aiReview.success === false) {
    return (
      <section className="coach-ai-empty-state">
        <h3>AI review was not generated for this game.</h3>
        {aiReview.error ? (
          <p>{getUserFriendlyError(aiReview.error, "Os comentários do coach não ficaram disponíveis para esta partida.")}</p>
        ) : (
          <p>Os comentários do coach não ficaram disponíveis para esta partida.</p>
        )}
      </section>
    );
  }

  const structured = aiReview.structuredSummary || {};
  const centralLesson = getCentralLesson(structured, aiReview.reviewText);
  const victoryConstruction = structured.victoryConstruction || null;
  const keyPreparatoryMoves = Array.isArray(victoryConstruction?.keyPreparatoryMoves)
    ? victoryConstruction.keyPreparatoryMoves
    : [];
  const decisiveMoment = structured.decisiveMoment || null;
  const missedOpportunities = Array.isArray(structured.missedOpportunities)
    ? structured.missedOpportunities
    : [];
  const mistakePatterns = Array.isArray(structured.mistakePatterns)
    ? structured.mistakePatterns
    : [];
  const styleSignals = Array.isArray(structured.styleSignals) ? structured.styleSignals : [];
  const openingInsights = Array.isArray(structured.openingInsights)
    ? structured.openingInsights
    : [];
  const endgameInsights = Array.isArray(structured.endgameInsights)
    ? structured.endgameInsights
    : [];
  const strengths = Array.isArray(structured.strengths) ? structured.strengths : [];
  const recommendedFocus = Array.isArray(structured.recommendedFocus)
    ? structured.recommendedFocus
    : [];
  const profileTags = Array.isArray(structured.profileTags) ? structured.profileTags : [];

  return (
    <div className="coach-ai-review">
      {structured.gameNarrative ? (
        <section className="coach-ai-section-card">
          <h3>Resumo da partida</h3>
          <p>{structured.gameNarrative}</p>
        </section>
      ) : null}

      {victoryConstruction ? (
        <section className="coach-ai-section-card coach-ai-victory-card">
          <div className="coach-ai-section-head">
            <h3>Construção da vitória</h3>
            <span className="coach-ai-badge">Novo resumo</span>
          </div>
          {victoryConstruction.summary ? (
            <p className="coach-ai-victory-summary">{victoryConstruction.summary}</p>
          ) : null}

          {keyPreparatoryMoves.length > 0 ? (
            <div className="coach-ai-list coach-ai-prep-list">
              {keyPreparatoryMoves.map((item: any, index: number) => (
                <article key={`prep-${index}`} className="coach-ai-list-card coach-ai-prep-card">
                  <div className="coach-ai-section-head">
                    <strong>Preparação {index + 1}</strong>
                    <PartialMoveLink
                      moveNumber={item.moveNumber}
                      san={item.move}
                      color={item.side}
                      analyzedMoves={analyzedMoves}
                      onNavigateToPly={onNavigateToPly}
                    />
                  </div>
                  {item.idea ? <p>{item.idea}</p> : null}
                </article>
              ))}
            </div>
          ) : null}

          {victoryConstruction.mainStrategicCause ? (
            <div className="coach-ai-callout">
              <span>Causa estratégica principal</span>
              <strong>{victoryConstruction.mainStrategicCause}</strong>
            </div>
          ) : null}
        </section>
      ) : null}

      {decisiveMoment ? (
        <section className="coach-ai-section-card coach-ai-decisive-card">
          <div className="coach-ai-section-head">
            <h3>O lance que decidiu a partida</h3>
            <SeverityBadge severity={decisiveMoment.severity} />
          </div>
          <div className="coach-ai-grid">
            <Field label="Lance" value={decisiveMoment.moveNumber} />
            <Field label="Lado" value={decisiveMoment.side} />
            <Field label="Categoria" value={decisiveMoment.category} />
            <Field label="Jogado" value={decisiveMoment.playedMove} />
          </div>
          <div className="coach-ai-move-row">
            <PartialMoveLink
              moveNumber={decisiveMoment.moveNumber}
              san={decisiveMoment.playedMove}
              color={decisiveMoment.side}
              analyzedMoves={analyzedMoves}
              onNavigateToPly={onNavigateToPly}
            />
          </div>
          {decisiveMoment.humanReason ? <p>{decisiveMoment.humanReason}</p> : null}
          {decisiveMoment.betterPlan ? (
            <div className="coach-ai-callout">
              <span>Plano melhor</span>
              <strong>{decisiveMoment.betterPlan}</strong>
            </div>
          ) : null}
        </section>
      ) : null}

      {missedOpportunities.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Oportunidades perdidas</h3>
          <div className="coach-ai-list">
            {missedOpportunities.map((item, index) => (
              <article key={`missed-${index}`} className="coach-ai-list-card">
                <div className="coach-ai-section-head">
                  <strong>{item.theme || "Oportunidade perdida"}</strong>
                  <Field label="Lado" value={item.sideThatErred} />
                </div>
                <div className="coach-ai-move-row">
                  <PartialMoveLink
                    moveNumber={item.moveNumber}
                    san={item.playedMove || item.san}
                    color={item.sideThatErred}
                    analyzedMoves={analyzedMoves}
                    onNavigateToPly={onNavigateToPly}
                  />
                </div>
                {item.whatHappened ? <p>{item.whatHappened}</p> : null}
                {item.howToPunish ? (
                  <div className="coach-ai-callout">
                    <span>Como punir</span>
                    <strong>{item.howToPunish}</strong>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {centralLesson ? (
        <section className="coach-ai-section-card coach-ai-central-lesson-card">
          <div className="coach-ai-section-head">
            <h3>{centralLesson.title}</h3>
            {centralLesson.source ? <span className="coach-ai-badge">{centralLesson.source}</span> : null}
          </div>
          <p>{centralLesson.text}</p>
        </section>
      ) : null}

      {mistakePatterns.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Padrões de erro</h3>
          <div className="coach-ai-list">
            {mistakePatterns.map((pattern, index) => (
              <article key={`pattern-${index}`} className="coach-ai-list-card">
                <div className="coach-ai-section-head">
                  <strong>{pattern.name || pattern.category || "Padrão"}</strong>
                  <SeverityBadge severity={pattern.severity} />
                </div>
                <div className="coach-ai-grid">
                  <Field label="Categoria" value={pattern.category} />
                  <Field label="Fase" value={pattern.phase} />
                </div>
                {Array.isArray(pattern.relatedMoves) && pattern.relatedMoves.length > 0 ? (
                  <div className="coach-ai-tag-row">
                    {pattern.relatedMoves.map((moveRef: unknown, moveIndex: number) => {
                      const ply = findMovePlyByReference(moveRef, analyzedMoves);
                      const label =
                        typeof moveRef === "string" || typeof moveRef === "number"
                          ? String(moveRef)
                          : "";

                      if (!ply) {
                        return (
                          <span key={`pattern-move-${moveIndex}`} className="coach-ai-tag">
                            {label || "Lance"}
                          </span>
                        );
                      }

                      return (
                        <button
                          key={`pattern-move-${moveIndex}`}
                          type="button"
                          className="review-move-link coach-ai-tag"
                          onClick={() => onNavigateToPly(ply)}
                        >
                          {label || "Lance"}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {pattern.evidence ? <p>{pattern.evidence}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {styleSignals.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Sinais de estilo</h3>
          <div className="coach-ai-list">
            {styleSignals.map((signal, index) => (
              <article key={`style-${index}`} className="coach-ai-list-card">
                <div className="coach-ai-section-head">
                  <strong>{signal.trait || "Sinal de estilo"}</strong>
                  <Field label="Confiança" value={signal.confidence} />
                </div>
                {signal.evidence ? <p>{signal.evidence}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {openingInsights.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Insights de abertura</h3>
          <div className="coach-ai-list">
            {openingInsights.map((item, index) => (
              <article key={`opening-${index}`} className="coach-ai-list-card">
                <div className="coach-ai-section-head">
                  <strong>{item.openingName || "Insight de abertura"}</strong>
                  <Field label="ECO" value={item.eco} />
                </div>
                <div className="coach-ai-grid">
                  <Field label="Cor" value={item.color} />
                  <Field label="Problema" value={item.issue} />
                </div>
                {item.recommendation ? <p>{item.recommendation}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {endgameInsights.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Insights de final</h3>
          <div className="coach-ai-list">
            {endgameInsights.map((item, index) => (
              <article key={`endgame-${index}`} className="coach-ai-list-card">
                <div className="coach-ai-section-head">
                  <strong>{item.type || "Insight de final"}</strong>
                </div>
                <div className="coach-ai-grid">
                  <Field label="Problema" value={item.issue} />
                  <Field label="Recomendação" value={item.recommendation} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {strengths.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Pontos fortes</h3>
          <div className="coach-ai-list">
            {strengths.map((item, index) => (
              <article key={`strength-${index}`} className="coach-ai-list-card">
                <strong>{item.name || "Ponto forte"}</strong>
                {item.evidence ? <p>{item.evidence}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {recommendedFocus.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Foco recomendado</h3>
          <div className="coach-ai-tag-row">
            {recommendedFocus.map((item, index) => (
              <span key={`focus-${index}`} className="coach-ai-tag">
                {typeof item === "string" ? item : item.name || item.label || "Foco"}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {profileTags.length > 0 ? (
        <section className="coach-ai-section-card">
          <h3>Tags do perfil</h3>
          <div className="coach-ai-tag-row">
            {profileTags.map((item, index) => (
              <span key={`tag-${index}`} className="coach-ai-badge">
                {typeof item === "string" ? item : item.name || item.label || "Tag"}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {aiReview.reviewText?.trim() ? (
        <details className="coach-ai-full-review">
          <summary>Revisão completa da IA</summary>
          {renderReviewText(aiReview.reviewText, analyzedMoves, onNavigateToPly)}
        </details>
      ) : null}
    </div>
  );
}
