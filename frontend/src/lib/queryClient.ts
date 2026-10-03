import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { PUBLIC_ROUTES, ROUTES } from "@/lib/routes";
import { router } from "@/router";

export function createQueryClient() {
  // a 401 from any request means the session expired or was revoked: drop everything cached for
  // this user and go back to login. On the signed-out pages a 401 is a wrong password instead
  const onError = (error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return;
    if (PUBLIC_ROUTES.includes(router.state.location.pathname)) return;
    router.navigate(ROUTES.login, { replace: true }).then(() => queryClient.clear());
  };
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      // a 4xx won't change on retry, only retry network and server errors
      queries: { retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2 },
    },
  });
  return queryClient;
}
