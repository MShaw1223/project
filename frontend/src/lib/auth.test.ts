import { afterEach, describe, expect, it, vi } from "vitest";
import { resendConfirmation } from "@/lib/auth";

afterEach(() => vi.unstubAllGlobals());

describe("auth api", () => {
  it("asks the backend to resend the confirmation email", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await resendConfirmation("trader@example.com");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/auth/resend");
    expect(init).toMatchObject({ method: "POST", body: JSON.stringify({ email: "trader@example.com" }) });
  });
});
