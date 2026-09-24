import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, deleteAccount, getProfile, updatePassword, updateUsername } from "@/lib/profile";

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe("profile api", () => {
  it("updates the password through the backend proxy and never sends a token itself", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(204));
    vi.stubGlobal("fetch", fetchMock);

    await updatePassword("new-password");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/profile/password");
    expect(init).toMatchObject({ method: "PUT", body: JSON.stringify({ password: "new-password" }) });
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/authorization/i);
  });

  it("surfaces the backend error message when the password update is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(400, { error: "invalid password" })));
    await expect(updatePassword("x")).rejects.toThrow("invalid password");
  });

  it("deletes the account through the backend proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(204));
    vi.stubGlobal("fetch", fetchMock);

    await deleteAccount();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/profile");
    expect(init).toMatchObject({ method: "DELETE" });
  });

  it("falls back to the status when the error body is not json", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(502)));
    await expect(deleteAccount()).rejects.toThrow("request failed: 502");
  });

  it("gets the caller's profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(200, { profile: { username: null } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getProfile()).resolves.toEqual({ username: null });
    expect(fetchMock.mock.calls[0][0]).toBe("/backend/profile");
  });

  it("updates the username and returns the stored profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(200, { profile: { username: "trader_1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateUsername("trader_1")).resolves.toEqual({ username: "trader_1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/profile/username");
    expect(init).toMatchObject({ method: "PUT", body: JSON.stringify({ username: "trader_1" }) });
  });

  it("rejects with the status when the username is taken", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(409, { error: "username is already taken" })));

    const error = await updateUsername("taken").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, message: "username is already taken" });
  });
});
