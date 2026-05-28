import { apiClient } from "./api.client";

export async function startGeneralAnalysis({ userId, games, options }) {
  return apiClient("/analysis/batch", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      games,
      options,
    }),
  });
}

export async function getAnalyzedGameIds({ source = "chess.com" } = {}) {
  const params = source ? `?source=${encodeURIComponent(source)}` : "";

  return apiClient(`/analysis/batch/analyzed-game-ids${params}`, {
    method: "GET",
    auth: true,
  });
}

export async function getAnalysisBatchStatus({ userId, batchId }) {
  return apiClient(`/analysis/batch/${encodeURIComponent(batchId)}`, {
    method: "GET",
    auth: true,
  });
}

export async function getAnalysisBatchGames({ userId, batchId, includePgn = false }) {
  const path = `/analysis/batch/${encodeURIComponent(batchId)}/games?includePgn=${
    includePgn ? "true" : "false"
  }`;

  return apiClient(path, {
    method: "GET",
    auth: true,
  });
}

export async function triggerAnalysisBatchProfileUpdate({ userId, batchId }) {
  return apiClient(`/analysis/batch/${encodeURIComponent(batchId)}/profile-update`, {
    method: "POST",
    auth: true,
  });
}
