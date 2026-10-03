import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login, logout, resendConfirmation, signup } from "@/lib/auth";

afterEach(() => vi.unstubAllGlobals());

describe("auth api", () => {
  it("logs in with the credentials and returns the user, never a token", async () => {
    const user = { id: "u1", email: "trader@example.com" };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("trader@example.com", "secret123")).resolves.toEqual(user);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/auth/login");
    expect(init).toMatchObject({
      method: "POST",
      body: JSON.stringify({ email: "trader@example.com", password: "secret123" }),
    });
  });

  it("rejects a failed login with its status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(login("trader@example.com", "wrong")).rejects.toMatchObject({ status: 401 });
  });

  it.each([
    [{ email_confirmation_required: true }, true],
    [{ email_confirmation_required: false }, false],
    [{}, false],
  ])("reports whether sign up needs email confirmation (%j)", async (body, required) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 201 })));
    await expect(signup("trader@example.com", "secret123")).resolves.toEqual({ emailConfirmationRequired: required });
  });

  it("logs out through the backend, which clears the httpOnly cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await logout();

    expect(fetchMock.mock.calls[0]).toMatchObject(["/backend/auth/logout", { method: "POST" }]);
  });

  it("asks the backend to resend the confirmation email", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await resendConfirmation("trader@example.com");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/auth/resend");
    expect(init).toMatchObject({ method: "POST", body: JSON.stringify({ email: "trader@example.com" }) });
  });

  it("resolves the signed in user from the session cookie", async () => {
    const user = { id: "u1", email: "trader@example.com" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ user }), { status: 200 })));
    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it("resolves to null when the backend rejects the session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("rejects on a network failure instead of reporting a logout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(getCurrentUser()).rejects.toBeInstanceOf(TypeError);
  });
});
