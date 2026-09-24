import { BACKEND_PREFIX } from "@/lib/auth";

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 72;

// mirrors the backend's services.usernamePattern
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
export const USERNAME_MAX_LENGTH = 20;
export const PROFILE_QUERY_KEY = ["profile"];

export type Profile = {
  username: string | null;
};

// keeps the status so callers can tell eg a taken username (409) apart from other failures
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// every call authenticates with the httpOnly session cookie the backend set at login
async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BACKEND_PREFIX}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: undefined }));
    throw new ApiError(response.status, error ?? `request failed: ${response.status}`);
  }
  return response;
}

export async function updatePassword(password: string): Promise<void> {
  await request("/profile/password", {
    method: "PUT",
    body: JSON.stringify({ password }),
    headers: { "Content-Type": "application/json" },
  });
}

// permanently deletes the account with all of its brokerage accounts and trades; the backend also
// clears the session cookie
export async function deleteAccount(): Promise<void> {
  await request("/profile", { method: "DELETE" });
}

export async function getProfile(): Promise<Profile> {
  const response = await request("/profile");
  const { profile } = await response.json();
  return profile as Profile;
}

export async function updateUsername(username: string): Promise<Profile> {
  const response = await request("/profile/username", {
    method: "PUT",
    body: JSON.stringify({ username }),
    headers: { "Content-Type": "application/json" },
  });
  const { profile } = await response.json();
  return profile as Profile;
}
