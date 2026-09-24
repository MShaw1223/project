export const BACKEND_PREFIX = "/backend";

export type BackendUser = {
  id: string;
  email: string;
};

// on success the backend sets an httpOnly session cookie, so no token is ever handled in JS
export async function login(email: string, password: string): Promise<Response> {
  return fetch(`${BACKEND_PREFIX}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
}

// creating an account does not start a session, the caller logs in afterwards
export async function signup(email: string, password: string): Promise<Response> {
  return fetch(`${BACKEND_PREFIX}/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
}

// asks for a new sign-up confirmation email, 429 when Supabase says one was sent too recently
export async function resendConfirmation(email: string): Promise<Response> {
  return fetch(`${BACKEND_PREFIX}/auth/resend`, {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
}

export async function logout(): Promise<void> {
  await fetch(`${BACKEND_PREFIX}/auth/logout`, { method: "POST" });
}

// resolves to null when there is no valid session cookie
export async function getCurrentUser(): Promise<BackendUser | null> {
  const response = await fetch(`${BACKEND_PREFIX}/auth/user`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const { user } = await response.json();
  return user as BackendUser;
}
