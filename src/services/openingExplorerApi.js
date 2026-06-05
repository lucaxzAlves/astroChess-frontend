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

function getHeaders() {
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
  return contentType.includes("application/json") ? response.json() : response.text();
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Não foi possível carregar o explorador de aberturas agora.");
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? payload.message || payload.error || payload.details
        : typeof payload === "string"
          ? payload
          : "";

    throw new Error(getUserFriendlyError(message, "Não foi possível carregar o explorador de aberturas agora."));
  }

  return payload;
}

export const openingExplorerApi = {
  getRoot() {
    return request("/openings");
  },

  getNode(fen) {
    return request(`/openings/node${buildQuery({ fen })}`);
  },

  getSummary() {
    return request("/openings/summary");
  },

  getInsights(fen) {
    return request(`/openings/insights${buildQuery({ fen })}`);
  },

  getPath(moves) {
    return request("/openings/path", {
      method: "POST",
      body: JSON.stringify({ moves }),
    });
  },
};
