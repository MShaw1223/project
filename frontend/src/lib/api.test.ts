import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, json, request } from "@/lib/api";

afterEach(() => vi.unstubAllGlobals());

describe("request", () => {
  it("calls the backend through the same-origin proxy without attaching a token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(request("/accounts", json("POST", { name: "main" }))).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/accounts");
    expect(init).toMatchObject({ method: "POST", body: JSON.stringify({ name: "main" }) });
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/authorization/i);
  });

  it("resolves to undefined for an empty response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(request("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("rejects with the status and the backend's error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "username is already taken" }), { status: 409 }))
    );

    const error = await request("/profile/username").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, message: "username is already taken", retryAfter: undefined });
  });

  it("falls back to the status when the error body is not json", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bad gateway", { status: 502 })));
    await expect(request("/trades")).rejects.toMatchObject({ status: 502, message: "request failed: 502" });
  });

  it("keeps Retry-After on a rate limited response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 429, headers: { "Retry-After": "240" } }))
    );
    await expect(request("/auth/login")).rejects.toMatchObject({ status: 429, retryAfter: 240 });
  });

  it("lets a network failure through untouched so callers can tell it from a backend error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await request("/accounts").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
  });
});
