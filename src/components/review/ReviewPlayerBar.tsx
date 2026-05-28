type ReviewPlayerBarProps = {
  name: string;
  rating?: number | string | null;
  color: "white" | "black";
};

export default function ReviewPlayerBar({ name, rating, color }: ReviewPlayerBarProps) {
  const formattedRating =
    typeof rating === "number" || typeof rating === "string"
      ? String(rating)
      : "N/A";

  return (
    <div className="game-review-player-bar">
      <div className="game-review-player-meta">
        <p className="game-review-player-color">{color === "white" ? "Brancas" : "Pretas"}</p>
        <p className="game-review-player-name">{name}</p>
      </div>
      <span className="game-review-player-rating">{formattedRating}</span>
    </div>
  );
}
