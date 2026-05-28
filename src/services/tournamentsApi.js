import { API_URL } from "../config/api";
import { getUserFriendlyError } from "../utils/userFriendlyErrors";

const TOKEN_KEY = "aura_token";

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getHeaders(headers = {}) {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  return requestHeaders;
}

async function fetchJson(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: getHeaders(options.headers),
    });
  } catch {
    throw new Error("Não foi possível carregar os torneios agora.");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sua sessão expirou. Entre novamente para atualizar os torneios.");
    }

    if (isJson && payload && typeof payload === "object") {
      const message = payload.message || payload.error || payload.details;
      if (typeof message === "string") {
        throw new Error(getUserFriendlyError(message, "Não foi possível carregar os torneios agora."));
      }
    }

    if (typeof payload === "string" && payload.trim()) {
      throw new Error(getUserFriendlyError(payload, "Não foi possível carregar os torneios agora."));
    }

    throw new Error("Não foi possível concluir a ação de torneios.");
  }

  return payload;
}

export async function getTournaments(params = {}) {
  const query = buildQuery(params);
  return fetchJson(`/tournaments/search${query}`);
}

export async function getTournamentFilters() {
  return fetchJson("/tournaments/meta/filters");
}

export async function refreshTournaments(params = {}) {
  return fetchJson("/tournaments/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}
