import { apiClient } from "./api.client";

type AuthPayload = {
  name?: string;
  email: string;
  password: string;
};

type AuthResult = {
  token: string;
  user: Record<string, unknown>;
};

function normalizeAuthResponse(payload: unknown): AuthResult {
  const data = (payload || {}) as Record<string, any>;
  const nestedData = (data.data || {}) as Record<string, any>;

  const token =
    data.token ||
    data.accessToken ||
    data.access_token ||
    nestedData.token ||
    nestedData.accessToken ||
    nestedData.access_token;

  const user = data.user || nestedData.user || {
    name: data.name || nestedData.name || "Usuário",
    email: data.email || nestedData.email || "",
  };

  if (!token) {
    throw new Error("Token inválido retornado pela API.");
  }

  return {
    token,
    user,
  };
}

export async function login(data: Pick<AuthPayload, "email" | "password">) {
  const response = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return normalizeAuthResponse(response);
}

export async function register(data: Required<AuthPayload>) {
  const response = await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return normalizeAuthResponse(response);
}

export async function getMe() {
  return apiClient("/auth/me", {
    method: "GET",
    auth: true,
  });
}

export async function logout() {
  return Promise.resolve();
}
