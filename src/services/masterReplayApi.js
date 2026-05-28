import { API_URL } from "../config/api";
import { getAdminFriendlyError } from "../utils/userFriendlyErrors";

const TOKEN_KEY = "aura_token";

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
    throw new Error("Não foi possível conectar ao Master Replay agora.");
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? payload.message || payload.error
        : typeof payload === "string"
          ? payload
          : "";

    throw new Error(getAdminFriendlyError(message, "Não foi possível concluir a ação no Master Replay."));
  }

  return payload;
}

function unwrapCollection(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  const data = payload?.data || payload;
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function unwrapItem(payload, keys = []) {
  const data = payload?.data || payload;

  for (const key of keys) {
    if (payload?.[key] && typeof payload[key] === "object") return payload[key];
    if (data?.[key] && typeof data[key] === "object") return data[key];
  }

  return data || payload;
}

function toQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

const jsonBody = (payload) => JSON.stringify(payload);

export const masterReplayApi = {
  async listGames(params = {}) {
    const payload = await request(`/master-replay/games${toQuery(params)}`);
    const data = payload?.data || payload;
    return {
      items: unwrapCollection(data, ["items", "games", "results"]),
      pagination: data?.pagination || payload?.pagination || null,
    };
  },

  async getGame(gameId) {
    return unwrapItem(
      await request(`/master-replay/games/${encodeURIComponent(gameId)}`),
      ["game"],
    );
  },

  async getPlayableGameById(gameId) {
    const payload = await request(`/master-replay/games/${encodeURIComponent(gameId)}/play`);
    return unwrapItem(payload, ["game"]);
  },

  async getPlayableGameBySlug(slug) {
    const payload = await request(`/master-replay/games/slug/${encodeURIComponent(slug)}/play`);
    return unwrapItem(payload, ["game"]);
  },

  async createGame(payload) {
    return unwrapItem(
      await request("/master-replay/games", { method: "POST", body: jsonBody(payload) }),
      ["game"],
    );
  },

  async updateGame(gameId, payload) {
    return unwrapItem(
      await request(`/master-replay/games/${encodeURIComponent(gameId)}`, {
        method: "PATCH",
        body: jsonBody(payload),
      }),
      ["game"],
    );
  },

  async deleteGame(gameId) {
    return request(`/master-replay/games/${encodeURIComponent(gameId)}`, { method: "DELETE" });
  },

  async addAnnotatedMove(gameId, payload) {
    return unwrapItem(
      await request(`/master-replay/games/${encodeURIComponent(gameId)}/annotated-moves`, {
        method: "POST",
        body: jsonBody(payload),
      }),
      ["annotatedMove", "move"],
    );
  },

  async updateAnnotatedMove(gameId, ply, payload) {
    return unwrapItem(
      await request(
        `/master-replay/games/${encodeURIComponent(gameId)}/annotated-moves/${encodeURIComponent(ply)}`,
        { method: "PATCH", body: jsonBody(payload) },
      ),
      ["annotatedMove", "move"],
    );
  },

  async deleteAnnotatedMove(gameId, ply) {
    return request(
      `/master-replay/games/${encodeURIComponent(gameId)}/annotated-moves/${encodeURIComponent(ply)}`,
      { method: "DELETE" },
    );
  },

  async addKeyMoment(gameId, payload) {
    return unwrapItem(
      await request(`/master-replay/games/${encodeURIComponent(gameId)}/key-moments`, {
        method: "POST",
        body: jsonBody(payload),
      }),
      ["keyMoment", "moment"],
    );
  },

  async updateKeyMoment(gameId, momentId, payload) {
    return unwrapItem(
      await request(
        `/master-replay/games/${encodeURIComponent(gameId)}/key-moments/${encodeURIComponent(momentId)}`,
        { method: "PATCH", body: jsonBody(payload) },
      ),
      ["keyMoment", "moment"],
    );
  },

  async deleteKeyMoment(gameId, momentId) {
    return request(
      `/master-replay/games/${encodeURIComponent(gameId)}/key-moments/${encodeURIComponent(momentId)}`,
      { method: "DELETE" },
    );
  },
};
