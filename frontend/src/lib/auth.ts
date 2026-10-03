import { ApiError, json, request } from "@/lib/api";

export type BackendUser = {
  id: string;
  email: string;
};

// on success the backend sets an httpOnly session cookie, so no token is ever handled in JS
export async function login(email: string, password: string): Promise<BackendUser> {
  const { user } = await request<{ user: BackendUser }>("/auth/login", json("POST", { email, password }));
  return user;
}

// creating an account does not start a session, the caller logs in afterwards
export async function signup(email: string, password: string): Promise<{ emailConfirmationRequired: boolean }> {
  const body = await request<{ email_confirmation_required?: boolean }>("/auth/signup", json("POST", { email, password }));
  return { emailConfirmationRequired: body?.email_confirmation_required === true };
}

// asks for a new sign-up confirmation email, 429 when one was sent too recently
export async function resendConfirmation(email: string): Promise<void> {
  await request("/auth/resend", json("POST", { email }));
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

// resolves to null when there is no valid session cookie
export async function getCurrentUser(): Promise<BackendUser | null> {
  try {
    const { user } = await request<{ user: BackendUser }>("/auth/user");
    return user;
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
