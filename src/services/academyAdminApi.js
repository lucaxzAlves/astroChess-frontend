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
    throw new Error("Não foi possível conectar ao painel da Academy agora.");
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? payload.message || payload.error
        : typeof payload === "string"
          ? payload
          : "";

    throw new Error(getAdminFriendlyError(message, "Não foi possível salvar ou carregar esse conteúdo."));
  }

  return payload;
}

function unwrapCollection(payload, keys) {
  if (Array.isArray(payload)) return payload;

  const data = payload?.data || payload;
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function unwrapItem(payload, keys) {
  const data = payload?.data || payload;

  for (const key of keys) {
    if (payload?.[key] && typeof payload[key] === "object") return payload[key];
    if (data?.[key] && typeof data[key] === "object") return data[key];
  }

  return data || payload;
}

const jsonBody = (payload) => JSON.stringify(payload);

export const academyAdminApi = {
  async listPaths() {
    return unwrapCollection(await request("/academy/paths"), ["paths", "items", "results"]);
  },
  async getPath(pathId) {
    return unwrapItem(await request(`/academy/paths/${encodeURIComponent(pathId)}`), ["path"]);
  },
  async createPath(payload) {
    return unwrapItem(
      await request("/academy/paths", { method: "POST", body: jsonBody(payload) }),
      ["path"],
    );
  },
  async updatePath(pathId, payload) {
    return unwrapItem(
      await request(`/academy/paths/${encodeURIComponent(pathId)}`, {
        method: "PATCH",
        body: jsonBody(payload),
      }),
      ["path"],
    );
  },
  async deletePath(pathId) {
    return request(`/academy/paths/${encodeURIComponent(pathId)}`, { method: "DELETE" });
  },
  async getFullPath(pathId) {
    const payload = await request(`/academy/paths/${encodeURIComponent(pathId)}/full`);
    const data = payload?.data || payload;
    return data && typeof data === "object" ? data : { path: null, modules: [] };
  },

  async listModules(pathId) {
    const endpoint = pathId
      ? `/academy/paths/${encodeURIComponent(pathId)}/modules`
      : "/academy/modules";
    return unwrapCollection(await request(endpoint), ["modules", "items", "results"]);
  },
  async getModule(moduleId) {
    return unwrapItem(await request(`/academy/modules/${encodeURIComponent(moduleId)}`), ["module"]);
  },
  async createModule(payload) {
    return unwrapItem(
      await request("/academy/modules", { method: "POST", body: jsonBody(payload) }),
      ["module"],
    );
  },
  async updateModule(moduleId, payload) {
    return unwrapItem(
      await request(`/academy/modules/${encodeURIComponent(moduleId)}`, {
        method: "PATCH",
        body: jsonBody(payload),
      }),
      ["module"],
    );
  },
  async deleteModule(moduleId) {
    return request(`/academy/modules/${encodeURIComponent(moduleId)}`, { method: "DELETE" });
  },

  async listLessons(moduleId, options = {}) {
    const query = options.pathId ? `?pathId=${encodeURIComponent(options.pathId)}` : "";
    const endpoint = moduleId
      ? `/academy/modules/${encodeURIComponent(moduleId)}/lessons`
      : `/academy/lessons${query}`;
    return unwrapCollection(await request(endpoint), ["lessons", "items", "results"]);
  },
  async getLesson(lessonId) {
    return unwrapItem(await request(`/academy/lessons/${encodeURIComponent(lessonId)}`), ["lesson"]);
  },
  async createLesson(payload) {
    return unwrapItem(
      await request("/academy/lessons", { method: "POST", body: jsonBody(payload) }),
      ["lesson"],
    );
  },
  async updateLesson(lessonId, payload) {
    return unwrapItem(
      await request(`/academy/lessons/${encodeURIComponent(lessonId)}`, {
        method: "PATCH",
        body: jsonBody(payload),
      }),
      ["lesson"],
    );
  },
  async deleteLesson(lessonId) {
    return request(`/academy/lessons/${encodeURIComponent(lessonId)}`, { method: "DELETE" });
  },
};
