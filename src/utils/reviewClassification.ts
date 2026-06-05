export type ReviewClassification =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "book"
  | "inaccuracy"
  | "mistake"
  | "missedChance"
  | "blunder"
  | "forced";

export type ReviewClassificationSummary = Record<ReviewClassification, number>;

export const reviewClassificationOrder: ReviewClassification[] = [
  "brilliant",
  "excellent",
  "best",
  "great",
  "good",
  "book",
  "inaccuracy",
  "mistake",
  "missedChance",
  "blunder",
];

export const emptyReviewClassificationSummary: ReviewClassificationSummary = {
  brilliant: 0,
  great: 0,
  best: 0,
  excellent: 0,
  good: 0,
  book: 0,
  inaccuracy: 0,
  mistake: 0,
  missedChance: 0,
  blunder: 0,
  forced: 0,
};

export function normalizeClassification(
  classification?: string | null
): ReviewClassification | undefined {
  if (!classification) return undefined;

  const normalized = classification.trim().toLowerCase();

  if (normalized === "miss") return "missedChance";
  if (normalized === "missed chance") return "missedChance";
  if (normalized === "missed_chance") return "missedChance";
  if (normalized === "missedchance") return "missedChance";
  if (normalized === "great") return "great";
  if (normalized === "good") return "good";

  const supported = new Set<ReviewClassification>([
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
  ]);

  if (supported.has(normalized as ReviewClassification)) {
    return normalized as ReviewClassification;
  }

  return undefined;
}

export function getClassificationMeta(classification?: string | null) {
  const normalized = normalizeClassification(classification) || "good";

  const map = {
    brilliant: {
      label: "Brilhante",
      symbol: "!!",
      assetId: "brilliant",
      color: "#67e8f9",
      squareColor: "rgba(6, 182, 212, 0.46)",
      cssClass: "brilliant",
    },
    great: {
      label: "Ótimo",
      symbol: "↯",
      assetId: "great",
      color: "#7dd3fc",
      squareColor: "rgba(14, 165, 233, 0.42)",
      cssClass: "great",
    },
    best: {
      label: "Melhor",
      symbol: "★",
      assetId: "best",
      color: "#86efac",
      squareColor: "rgba(34, 197, 94, 0.42)",
      cssClass: "best",
    },
    excellent: {
      label: "Excelente",
      symbol: "!",
      assetId: "excellent",
      color: "#93c5fd",
      squareColor: "rgba(59, 130, 246, 0.38)",
      cssClass: "excellent",
    },
    good: {
      label: "Bom",
      symbol: "✓",
      assetId: "good",
      color: "#a7f3d0",
      squareColor: "rgba(16, 185, 129, 0.35)",
      cssClass: "good",
    },
    book: {
      label: "Teoria",
      symbol: "♜",
      assetId: "book",
      color: "#d8b4fe",
      squareColor: "rgba(168, 85, 247, 0.34)",
      cssClass: "book",
    },
    inaccuracy: {
      label: "Imprecisão",
      symbol: "?!",
      assetId: "inaccuracy",
      color: "#fde68a",
      squareColor: "rgba(245, 158, 11, 0.4)",
      cssClass: "inaccuracy",
    },
    mistake: {
      label: "Erro",
      symbol: "?",
      assetId: "mistake",
      color: "#fdba74",
      squareColor: "rgba(249, 115, 22, 0.44)",
      cssClass: "mistake",
    },
    missedChance: {
      label: "Chance perdida",
      symbol: "×",
      assetId: "missed_chance",
      color: "#fda4af",
      squareColor: "rgba(244, 114, 182, 0.38)",
      cssClass: "missed-chance",
    },
    blunder: {
      label: "Capivarada",
      symbol: "??",
      assetId: "blunder",
      color: "#fca5a5",
      squareColor: "rgba(239, 68, 68, 0.5)",
      cssClass: "blunder",
    },
    forced: {
      label: "Forçado",
      symbol: "→",
      color: "#cbd5e1",
      squareColor: "rgba(148, 163, 184, 0.34)",
      cssClass: "forced",
    },
  } as const;

  return map[normalized];
}
