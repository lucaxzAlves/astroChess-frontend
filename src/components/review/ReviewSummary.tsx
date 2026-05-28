import { useState } from "react";
import {
  emptyReviewClassificationSummary,
  getClassificationMeta,
  reviewClassificationOrder,
  type ReviewClassificationSummary,
} from "../../utils/reviewClassification";
import MoveQualityIcon from "./MoveQualityIcon";

type ReviewSummaryPlayer = {
  username?: string;
  avatar?: string;
  accuracy?: number | string | null;
  classifications: ReviewClassificationSummary;
};

type ReviewSummaryProps = {
  summary: {
    white: ReviewSummaryPlayer;
    black: ReviewSummaryPlayer;
  };
};

function getInitials(username?: string) {
  const value = (username || "Desconhecido").trim();
  if (!value) return "U";

  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatAccuracy(accuracy?: number | string | null) {
  if (typeof accuracy === "number") {
    return `${accuracy.toFixed(1)}%`;
  }

  if (typeof accuracy === "string" && accuracy.trim()) {
    return accuracy;
  }

  return "N/A";
}

function SummaryAvatar({
  username,
  avatar,
}: {
  username?: string;
  avatar?: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(avatar) && !hasImageError;

  if (showImage) {
    return (
      <img
        src={avatar}
        alt={username ? `Avatar de ${username}` : "Avatar do jogador"}
        className="game-review-summary-avatar"
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div className="game-review-summary-avatar fallback" aria-hidden="true">
      {getInitials(username)}
    </div>
  );
}

export default function ReviewSummary({ summary }: ReviewSummaryProps) {
  const whiteClassifications = summary.white.classifications || emptyReviewClassificationSummary;
  const blackClassifications = summary.black.classifications || emptyReviewClassificationSummary;

  return (
    <section className="game-review-card">
      <p className="game-review-card-title">Resumo da revisão</p>

      <div className="game-review-summary">
        <div className="game-review-summary-player white">
          <div className="game-review-summary-identity">
            <SummaryAvatar
              username={summary.white.username}
              avatar={summary.white.avatar}
            />
            <div className="game-review-summary-copy">
              <p className="game-review-summary-name">{summary.white.username || "Desconhecido"}</p>
              <p className="game-review-summary-side">Brancas</p>
            </div>
          </div>
          <div className="game-review-summary-accuracy">
            <span>Precisão</span>
            <strong>{formatAccuracy(summary.white.accuracy)}</strong>
          </div>
        </div>

        <div className="game-review-summary-player black">
          <div className="game-review-summary-identity">
            <SummaryAvatar
              username={summary.black.username}
              avatar={summary.black.avatar}
            />
            <div className="game-review-summary-copy">
              <p className="game-review-summary-name">{summary.black.username || "Desconhecido"}</p>
              <p className="game-review-summary-side">Pretas</p>
            </div>
          </div>
          <div className="game-review-summary-accuracy">
            <span>Precisão</span>
            <strong>{formatAccuracy(summary.black.accuracy)}</strong>
          </div>
        </div>
      </div>

      <div className="game-review-summary-table">
        {reviewClassificationOrder.map((classification) => {
          const meta = getClassificationMeta(classification);

          return (
            <div key={classification} className="game-review-summary-row">
              <span className="game-review-summary-count">
                {whiteClassifications[classification]}
              </span>
              <div className="game-review-summary-center">
                <span className={`game-review-classification-badge ${meta.cssClass}`}>
                  <MoveQualityIcon classification={classification} />
                </span>
                <span className="game-review-summary-label">{meta.label}</span>
              </div>
              <span className="game-review-summary-count">
                {blackClassifications[classification]}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
