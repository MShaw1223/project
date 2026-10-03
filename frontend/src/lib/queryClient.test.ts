import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { createQueryClient } from "@/lib/queryClient";
import { router } from "@/router";

vi.mock("@/router", () => ({ router: { state: { location: { pathname: "/dashboard" } }, navigate: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
  router.state.location.pathname = "/dashboard";
});

async function failQuery(error: unknown) {
  const queryClient = createQueryClient();
  queryClient.setQueryData(["accounts"], [{ id: "a1", name: "previous user's account" }]);
  await queryClient.fetchQuery({ queryKey: ["trades"], queryFn: () => Promise.reject(error), retry: false }).catch(() => undefined);
  return queryClient;
}

describe("createQueryClient", () => {
  it("sends the user to login and clears the cache when a request comes back 401", async () => {
    vi.mocked(router.navigate).mockResolvedValue(undefined);
    const queryClient = await failQuery(new ApiError(401, "missing or invalid authorization header"));

    expect(router.navigate).toHaveBeenCalledWith("/", { replace: true });
    await vi.waitFor(() => expect(queryClient.getQueryData(["accounts"])).toBeUndefined());
  });

  it("leaves other failures to the component that made the request", async () => {
    const queryClient = await failQuery(new ApiError(500, "failed to get trades"));

    expect(router.navigate).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(["accounts"])).toBeDefined();
  });

  it("treats a 401 on a signed-out page as a wrong password, not an expired session", async () => {
    router.state.location.pathname = "/";
    await failQuery(new ApiError(401, "invalid email or password"));

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("does not retry client errors", () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (count: number, error: unknown) => boolean;
    expect(retry(0, new ApiError(404, "not found"))).toBe(false);
    expect(retry(0, new ApiError(503, "unavailable"))).toBe(true);
    expect(retry(0, new TypeError("Failed to fetch"))).toBe(true);
    expect(retry(2, new TypeError("Failed to fetch"))).toBe(false);
  });
});
