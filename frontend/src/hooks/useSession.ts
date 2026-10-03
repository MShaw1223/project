import { useQuery } from "@tanstack/react-query";
import { BackendUser, getCurrentUser } from "@/lib/auth";

export const SESSION_QUERY_KEY = ["session"];

// the signed in user from the httpOnly session cookie, null when there is none. Fetched once and
// kept until login, logout or a 401 clears the query cache
export function useSession() {
  return useQuery({ queryKey: SESSION_QUERY_KEY, queryFn: getCurrentUser, staleTime: Infinity });
}

// for pages inside AppShell, which only renders them once the session has resolved to a user
export function useUser(): BackendUser {
  const { data } = useSession();
  if (!data) throw new Error("useUser called outside a signed-in page");
  return data;
}
