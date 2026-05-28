import CoachAIReview from "./CoachAIReview";
import MoveQualityIcon from "./MoveQualityIcon";
import ReviewMoveList, { type ReviewMoveRow } from "./ReviewMoveList";
import ReviewSummary from "./ReviewSummary";
import { getClassificationMeta, type ReviewClassificationSummary } from "../../utils/reviewClassification";

type ReviewSummaryData = {
  white: {
    username?: string;
    avatar?: string;
    accuracy?: number | string | null;
    classifications: ReviewClassificationSummary;
  };
  black: {
    username?: string;
    avatar?: string;
    accuracy?: number | string | null;
    classifications: ReviewClassificationSummary;
  };
};

type ReviewGameInfo = {
  result: string;
  timeControl: string;
  date: string;
  opening: string;
  rated: string;
};

type ReviewPanelProps = {
  activeTab: "report" | "analysis" | "coach";
  onTabChange: (tab: "report" | "analysis" | "coach") => void;
  summary: ReviewSummaryData | null;
  gameInfo: ReviewGameInfo;
  moveRows: ReviewMoveRow[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onStartVariation: (source: {
    ply?: number;
    moveNumber?: number;
    color?: string;
    bestMove?: string;
    classification?: string;
    pv?: string[];
    comment?: string;
    fenBefore?: string;
    fenAfter?: string;
  }) => void;
  analyzedMoves: Array<{
    ply?: number;
    moveNumber?: number;
    color?: string;
    san?: string;
  }>;
  reviewMode: "mainline" | "backendVariation" | "freeAnalysis";
  activeVariationPly?: number | null;
  freeLineMoves?: string[];
  aiReview: {
    success?: boolean;
    error?: string | null;
    reviewText?: string;
    structuredSummary?: Record<string, any> | null;
  } | null;
  hasAnalysis: boolean;
  isAnalyzing: boolean;
  analysisError: string;
  onStartReview: () => void;
  currentMoveLabel?: {
    san: string;
    classification?: string | null;
    moveNumber?: number | null;
    color?: "white" | "black" | null;
  } | null;
};

function MoveSpotlight({
  currentMoveLabel,
}: {
  currentMoveLabel?: ReviewPanelProps["currentMoveLabel"];
}) {
  if (!currentMoveLabel?.san || !currentMoveLabel.classification) {
    return null;
  }

  const meta = getClassificationMeta(currentMoveLabel.classification);
  const prefix =
    currentMoveLabel.moveNumber && currentMoveLabel.color
      ? `${currentMoveLabel.moveNumber}${currentMoveLabel.color === "black" ? "..." : "."}`
      : "";

  return (
    <div className="game-review-current-move-card">
      <span className="game-review-current-move-label">Lance atual</span>
      <div className="game-review-current-move-row">
        <strong>
          {prefix} {currentMoveLabel.san}
        </strong>
        <span className={`game-review-classification-badge ${meta.cssClass}`}>
          <MoveQualityIcon classification={currentMoveLabel.classification} />
          {meta.label}
        </span>
      </div>
    </div>
  );
}

export default function ReviewPanel({
  activeTab,
  onTabChange,
  summary,
  gameInfo,
  moveRows,
  currentMoveIndex,
  onSelectMove,
  onStartVariation,
  analyzedMoves,
  reviewMode,
  activeVariationPly,
  freeLineMoves,
  aiReview,
  hasAnalysis,
  isAnalyzing,
  analysisError,
  onStartReview,
  currentMoveLabel,
}: ReviewPanelProps) {
  return (
    <aside className="game-review-panel">
      <div className="game-review-panel-header">
        <div>
          <h2 className="game-review-panel-title">Revisão da partida</h2>
          <p className="game-review-panel-subtitle">
            Analise momentos críticos, compare decisões e entenda os lances da partida.
          </p>
        </div>
        {!hasAnalysis && !isAnalyzing ? (
          <button
            type="button"
            className="game-review-start-button"
            onClick={onStartReview}
            disabled={isAnalyzing}
          >
            Iniciar revisão
          </button>
        ) : null}
        {hasAnalysis ? <span className="game-review-review-completed">Revisão concluída</span> : null}
      </div>

      <hr className="game-review-divider" />

      <div className="game-review-tabs">
        {[
          ["report", "Relatório"],
          ["analysis", "Análise"],
          ["coach", "Coach IA"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key as "report" | "analysis" | "coach")}
            className={`game-review-tab ${activeTab === key ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="game-review-panel-stack">
        {isAnalyzing ? (
          <section className="game-review-loading-card">
            <div className="game-review-loading-spinner" />
            <div className="game-review-loading-copy">
              <h3>Analyzing game...</h3>
              <p>O motor está revisando os momentos críticos. Isso pode levar alguns segundos.</p>
            </div>
            <div className="game-review-loading-bar">
              <span />
            </div>
          </section>
        ) : null}

        {analysisError ? (
          <section className="game-review-error-card">
            <h3>Análise indisponível</h3>
            <p>{analysisError}</p>
          </section>
        ) : null}

        {hasAnalysis ? <MoveSpotlight currentMoveLabel={currentMoveLabel} /> : null}

        {activeTab === "report" &&
          (hasAnalysis && summary ? (
            <>
              <ReviewSummary summary={summary} />

              <section className="game-review-card">
                <p className="game-review-card-title">Detalhes da partida</p>
                <div className="game-review-detail-list">
                  {[
                    ["Resultado", gameInfo.result],
                    ["Ritmo", gameInfo.timeControl],
                    ["Data", gameInfo.date],
                    ["Abertura", gameInfo.opening],
                    ["Ranqueada", gameInfo.rated],
                  ].map(([label, value]) => (
                    <div key={label} className="game-review-detail-row">
                      <span className="game-review-label">{label}</span>
                      <span className="game-review-value">{value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="game-review-empty-card">
              <h3>Nenhuma revisão ainda</h3>
              <p>Inicie uma revisão para ver precisão e classificação dos lances.</p>
            </section>
          ))}

        {activeTab === "analysis" &&
          (hasAnalysis ? (
            <>
              <ReviewMoveList
                moveRows={moveRows}
                currentMoveIndex={currentMoveIndex}
                onSelectMove={onSelectMove}
                onStartVariation={onStartVariation}
                reviewMode={reviewMode}
                activeVariationPly={activeVariationPly}
                freeLineMoves={freeLineMoves}
              />

              <section className="game-review-card">
                <p className="game-review-card-title">Legenda das classificações</p>
                <div className="game-review-pills">
                  {[
                    "brilliant",
                    "great",
                    "best",
                    "excellent",
                    "good",
                    "book",
                    "inaccuracy",
                    "mistake",
                    "missedChance",
                    "blunder",
                    "forced",
                  ].map((classification) => {
                    const meta = getClassificationMeta(classification);

                    return (
                      <span
                        key={classification}
                        className={`game-review-classification-badge ${meta.cssClass}`}
                      >
                        <MoveQualityIcon classification={classification} />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="game-review-empty-card">
              <h3>Nenhuma análise de lances ainda</h3>
              <p>Rode a revisão para classificar cada lance e navegar pela notação analisada.</p>
            </section>
          ))}

        {activeTab === "coach" && (
          <CoachAIReview
            aiReview={aiReview}
            hasAnalysis={hasAnalysis}
            analyzedMoves={analyzedMoves}
            onNavigateToPly={onSelectMove}
          />
        )}

        <div className="game-review-action-buttons">
          {!hasAnalysis ? (
            <button type="button" className="game-review-action-btn primary" onClick={onStartReview} disabled={isAnalyzing}>
              Iniciar revisão
            </button>
          ) : null}
          <button type="button" className="game-review-action-btn secondary">
            Enviar para o AI Coach
          </button>
        </div>
      </div>
    </aside>
  );
}
