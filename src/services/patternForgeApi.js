import { getUserFriendlyError } from "../utils/userFriendlyErrors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";
const TOKEN_KEY = "aura_token";

function getAuthHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function readPayload(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao Pattern Forge agora.");
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? payload.message || payload.error
        : typeof payload === "string"
          ? payload
          : "";

    throw new Error(
      getUserFriendlyError(message, "Não foi possível concluir a ação no Pattern Forge."),
    );
  }

  return payload;
}

export function getActivePatternForgeCycle(username) {
  const query = username ? `?username=${encodeURIComponent(username)}` : "";
  return request(`/pattern-forge/cycles/active${query}`, {
    method: "GET",
  });
}

export function getPatternForgeThemes() {
  return request("/pattern-forge/themes", {
    method: "GET",
  });
}

export function getPatternForgeLeaderboards(limit = 50) {
  const query = Number.isFinite(Number(limit)) ? `?limit=${encodeURIComponent(limit)}` : "";
  return request(`/pattern-forge/leaderboards${query}`, {
    method: "GET",
  });
}

export function createPatternForgeCycle(payload) {
  return request("/pattern-forge/cycles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitPatternForgeAttempt(payload) {
  return request("/pattern-forge/attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completePatternForgeDailySession(sessionId) {
  return request(`/pattern-forge/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: "POST",
  });
}
