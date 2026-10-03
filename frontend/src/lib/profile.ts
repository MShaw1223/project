import { json, request } from "@/lib/api";

export const PROFILE_QUERY_KEY = ["profile"];

export type Profile = {
  username: string | null;
};

export async function getProfile(): Promise<Profile> {
  const { profile } = await request<{ profile: Profile }>("/profile");
  return profile;
}

export async function updateUsername(username: string): Promise<Profile> {
  const { profile } = await request<{ profile: Profile }>("/profile/username", json("PUT", { username }));
  return profile;
}

export async function updatePassword(password: string): Promise<void> {
  await request("/profile/password", json("PUT", { password }));
}

// permanently deletes the user with all of their brokerage accounts and trades; the backend also
// clears the session cookie
export async function deleteUser(): Promise<void> {
  await request("/profile", { method: "DELETE" });
}
