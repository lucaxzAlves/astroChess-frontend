import { useEffect, useMemo, useRef, useState } from "react";

type EvaluationBarProps = {
  evaluation: number | string | null;
  labelOverride?: string;
  variant?: "vertical" | "horizontal";
};

function parseEvaluationValue(evaluation: number | string | null) {
  if (evaluation === null || evaluation === undefined) {
    return { label: "0.0", whitePercent: 50, numericValue: 0 };
  }

  if (typeof evaluation === "number") {
    const clamped = Math.max(-5, Math.min(5, evaluation));
    return {
      label: evaluation >= 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1),
      whitePercent: 50 + clamped * 9,
      numericValue: evaluation,
    };
  }

  if (typeof evaluation === "string" && evaluation.trim()) {
    const trimmed = evaluation.trim();
    const mateMatch = trimmed.match(/^#(-?\d+)$/);

    if (mateMatch) {
      const value = Number(mateMatch[1]);
      return {
        label: value >= 0 ? `M${value}` : `-M${Math.abs(value)}`,
        whitePercent: value > 0 ? 96 : 4,
        numericValue: value > 0 ? 10 : -10,
      };
    }

    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(-5, Math.min(5, parsed));
      return {
        label: parsed >= 0 ? `+${parsed.toFixed(1)}` : parsed.toFixed(1),
        whitePercent: 50 + clamped * 9,
        numericValue: parsed,
      };
    }
  }

  return { label: "0.0", whitePercent: 50, numericValue: 0 };
}

export default function EvaluationBar({ evaluation, labelOverride, variant = "vertical" }: EvaluationBarProps) {
  const previousValueRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const { label, whitePercent, numericValue } = useMemo(
    () => parseEvaluationValue(evaluation),
    [evaluation]
  );

  useEffect(() => {
    const previous = previousValueRef.current;
    previousValueRef.current = numericValue;

    if (previous === null) return;

    if (Math.abs(numericValue - previous) >= 1.5) {
      setPulse(true);
      const timeout = window.setTimeout(() => setPulse(false), 420);
      return () => window.clearTimeout(timeout);
    }
  }, [numericValue]);

  const displayLabel = labelOverride || label;

  if (variant === "horizontal") {
    return (
      <div
        className={`game-review-eval-bar horizontal ${pulse ? "eval-bar-swing" : ""}`}
        aria-label={`Evaluation ${displayLabel}`}
      >
        <div className="game-review-eval-track horizontal">
          <div
            className="game-review-eval-fill-black horizontal"
            style={{ width: `${100 - whitePercent}%` }}
          />
          <div
            className="game-review-eval-fill-white horizontal"
            style={{ width: `${whitePercent}%` }}
          />
          <div className="game-review-eval-marker horizontal" style={{ left: `${whitePercent}%` }} />
        </div>
        <div className="game-review-eval-label horizontal">{displayLabel}</div>
      </div>
    );
  }

  return (
    <div className={`game-review-eval-bar ${pulse ? "eval-bar-swing" : ""}`} aria-label={`Evaluation ${displayLabel}`}>
      <div className="game-review-eval-track">
        <div
          className="game-review-eval-fill-black"
          style={{ height: `${100 - whitePercent}%` }}
        />
        <div
          className="game-review-eval-fill-white"
          style={{ height: `${whitePercent}%` }}
        />
        <div className="game-review-eval-marker" style={{ bottom: `${whitePercent}%` }} />
      </div>
      <div className="game-review-eval-label">{displayLabel}</div>
    </div>
  );
}
