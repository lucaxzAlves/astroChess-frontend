import { apiClient } from "./api.client";

type AnyRecord = Record<string, any>;

function unwrapPayload(payload: unknown): AnyRecord {
  const data = (payload || {}) as AnyRecord;

  if (data.profile && typeof data.profile === "object") {
    return data.profile as AnyRecord;
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as AnyRecord;
    if (nested.profile && typeof nested.profile === "object") {
      return nested.profile as AnyRecord;
    }
    return nested;
  }

  return data;
}

export function extractPlayerProfile(payload: unknown): AnyRecord {
  return unwrapPayload(payload);
}

export function extractChessComUsername(payload: unknown): string {
  const profile = unwrapPayload(payload);
  const username = profile?.identities?.chessCom?.username;
  return typeof username === "string" ? username.trim() : "";
}

export function extractChessComAvatarUrl(payload: unknown): string {
  const profile = unwrapPayload(payload);
  const avatarUrl =
    profile?.identities?.chessCom?.avatarUrl ||
    profile?.chessCom?.avatarUrl;

  return typeof avatarUrl === "string" ? avatarUrl.trim() : "";
}

export async function getMyPlayerProfile() {
  return apiClient("/player-profile/me", {
    method: "GET",
    auth: true,
  });
}

export async function getMyPlayerProfileVersions() {
  return apiClient("/player-profile/versions", {
    method: "GET",
    auth: true,
  });
}

export async function getMyPlayerProfileVersion(versionId: string) {
  return apiClient(`/player-profile/versions/${encodeURIComponent(versionId)}`, {
    method: "GET",
    auth: true,
  });
}

export async function getMyPlayerProfileVersionProfileView(versionId: string) {
  return apiClient(
    `/player-profile/versions/${encodeURIComponent(versionId)}/profile-view`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export async function restoreMyPlayerProfileVersion(versionId: string) {
  return apiClient(`/player-profile/versions/${encodeURIComponent(versionId)}/restore`, {
    method: "POST",
    auth: true,
  });
}

export async function updateMyChessComUsername(username: string) {
  return apiClient("/player-profile/me/chess-com", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ username }),
  });
}

export async function updateMyPlayerProfilePreferences(data: Record<string, unknown>) {
  return apiClient("/player-profile/me/preferences", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(data),
  });
}
