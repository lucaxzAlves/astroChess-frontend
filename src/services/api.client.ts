import { API_URL } from "../config/api";
import { getUserFriendlyError } from "../utils/userFriendlyErrors";

const TOKEN_KEY = "aura_token";

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiClient(path: string, options: ApiRequestOptions = {}) {
  const { auth = false, headers, ...rest } = options;

  const requestHeaders = new Headers(headers || {});
  const hasBody = rest.body !== undefined;

  if (hasBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      if (path === "/auth/login") {
        throw new Error("Email ou senha inválidos");
      }
      throw new Error("Não autorizado. Faça login novamente.");
    }

    if (isJson && payload && typeof payload === "object") {
      const message =
        (payload as Record<string, unknown>).message ||
        (payload as Record<string, unknown>).error;

      if (typeof message === "string") {
        throw new Error(getUserFriendlyError(message, "Não foi possível concluir a requisição."));
      }
    }

    throw new Error("Não foi possível concluir a requisição.");
  }

  return payload;
}
