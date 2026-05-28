import {
  getClassificationMeta,
  type ReviewClassification,
} from "../../utils/reviewClassification";
import MoveQualityIcon from "./MoveQualityIcon";

type VariationSource = {
  ply?: number;
  moveNumber?: number;
  color?: string;
  bestMove?: string;
  classification?: string;
  pv?: string[];
  comment?: string;
};

export type ReviewMove = {
  san: string;
  fen: string;
  uci?: string;
  annotation?: "?!" | "?" | "??";
};

export type ReviewMoveRow = {
  moveNumber: number;
  white?: {
    san: string;
    classification?: ReviewClassification;
  };
  black?: {
    san: string;
    classification?: ReviewClassification;
  };
  whiteVariation?: VariationSource | null;
  blackVariation?: VariationSource | null;
};

type ReviewMoveListProps = {
  moveRows: ReviewMoveRow[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onStartVariation: (source: VariationSource) => void;
  reviewMode: "mainline" | "backendVariation" | "freeAnalysis";
  activeVariationPly?: number | null;
  freeLineMoves?: string[];
};

function VariationBlock({
  variation,
  onStartVariation,
  isActive,
}: {
  variation: VariationSource | null | undefined;
  onStartVariation: (source: VariationSource) => void;
  isActive: boolean;
}) {
  if (!variation || !Array.isArray(variation.pv) || variation.pv.length === 0) {
    return null;
  }

  const meta = variation.classification
    ? getClassificationMeta(variation.classification)
    : null;

  return (
    <button
      type="button"
      className={`variation-line ${isActive ? "variation-active" : ""}`}
      onClick={() => onStartVariation(variation)}
    >
      <div className="variation-line-header">
        <span>{variation.bestMove ? "Melhor linha" : "Linha sugerida"}</span>
        {meta ? (
          <span className={`game-review-classification-badge ${meta.cssClass}`}>
            <MoveQualityIcon classification={variation.classification} />
            {meta.label}
          </span>
        ) : null}
      </div>
      {variation.bestMove ? <div className="variation-line-best">Melhor: {variation.bestMove}</div> : null}
      <div className="variation-line-moves">
        {variation.pv.map((move, index) => (
          <span key={`${variation.ply || "variation"}-${index}`} className="variation-move-pill">
            {move}
          </span>
        ))}
      </div>
      {variation.comment ? <p className="variation-line-comment">{variation.comment}</p> : null}
    </button>
  );
}

export default function ReviewMoveList({
  moveRows,
  currentMoveIndex,
  onSelectMove,
  onStartVariation,
  reviewMode,
  activeVariationPly,
  freeLineMoves = [],
}: ReviewMoveListProps) {
  return (
    <div className="game-review-move-list">
      <div className="game-review-move-head">
        <span>#</span>
        <span>Brancas</span>
        <span>Pretas</span>
      </div>

      <div className="game-review-move-scroll">
        {moveRows.map((row, rowIndex) => {
          const whiteIndex = rowIndex * 2 + 1;
          const blackIndex = whiteIndex + 1;
          const whiteMeta = getClassificationMeta(row.white?.classification);
          const blackMeta = getClassificationMeta(row.black?.classification);

          return (
            <div key={`row-${rowIndex}`} className="game-review-move-entry">
              <div className="game-review-move-row">
                <span className="game-review-move-index">{row.moveNumber}.</span>

                <button
                  type="button"
                  onClick={() => onSelectMove(whiteIndex)}
                  className={`game-review-move-btn ${
                    currentMoveIndex === whiteIndex && reviewMode === "mainline" ? "active" : ""
                  }`}
                  disabled={!row.white}
                >
                  {row.white ? (
                    <span className="game-review-move-btn-content">
                      <span className="game-review-move-san">{row.white.san}</span>
                      <span className={`game-review-classification-badge ${whiteMeta.cssClass}`}>
                        <MoveQualityIcon classification={row.white.classification} />
                      </span>
                    </span>
                  ) : (
                    "-"
                  )}
                </button>

                <button
                  type="button"
                  disabled={!row.black}
                  onClick={() => onSelectMove(blackIndex)}
                  className={`game-review-move-btn ${
                    currentMoveIndex === blackIndex && reviewMode === "mainline" ? "active" : ""
                  }`}
                >
                  {row.black ? (
                    <span className="game-review-move-btn-content">
                      <span className="game-review-move-san">{row.black.san}</span>
                      <span className={`game-review-classification-badge ${blackMeta.cssClass}`}>
                        <MoveQualityIcon classification={row.black.classification} />
                      </span>
                    </span>
                  ) : (
                    "-"
                  )}
                </button>
              </div>

              <VariationBlock
                variation={row.whiteVariation}
                onStartVariation={onStartVariation}
                isActive={reviewMode === "backendVariation" && activeVariationPly === row.whiteVariation?.ply}
              />
              <VariationBlock
                variation={row.blackVariation}
                onStartVariation={onStartVariation}
                isActive={reviewMode === "backendVariation" && activeVariationPly === row.blackVariation?.ply}
              />
            </div>
          );
        })}

        {reviewMode === "freeAnalysis" ? (
          <section className="free-analysis-line">
            <div className="variation-line-header">
              <span>Análise livre</span>
              <span className="game-review-label">Fora da partida original</span>
            </div>
            <div className="variation-line-moves">
              {freeLineMoves.length > 0 ? (
                freeLineMoves.map((move, index) => (
                  <span key={`free-${index}`} className="variation-move-pill">
                    {move}
                  </span>
                ))
              ) : (
                <span className="game-review-label">Nenhum lance livre ainda.</span>
              )}
            </div>
            <p className="variation-line-comment">
              A avaliação do motor ainda não está ativa para a análise livre.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
