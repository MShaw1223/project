import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/index";
import { login, resendConfirmation } from "@/lib/auth";

const push = vi.fn();
vi.mock("next/router", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth", () => ({ login: vi.fn(), resendConfirmation: vi.fn() }));

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

beforeEach(() => push.mockReset());
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  window.history.replaceState(null, "", "/");
});

function submit() {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "trader@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));
}

describe("login page", () => {
  it("tells the user to confirm their email when the backend says it isn't confirmed", async () => {
    vi.mocked(login).mockResolvedValue(respond(403, { error: "email not confirmed" }));
    render(<LoginPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toMatch(/confirm your email before logging in/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("offers to resend the confirmation email to the address that couldn't log in", async () => {
    vi.mocked(login).mockResolvedValue(respond(403, { error: "email not confirmed" }));
    vi.mocked(resendConfirmation).mockResolvedValue(respond(204));
    render(<LoginPage />);

    submit();
    fireEvent.click(await screen.findByRole("button", { name: /resend confirmation email/i }));

    await waitFor(() => expect(resendConfirmation).toHaveBeenCalledWith("trader@example.com"));
    expect((await screen.findByRole("status")).textContent).toMatch(/new confirmation link/i);
  });

  it("says the email or password is wrong on a 401", async () => {
    vi.mocked(login).mockResolvedValue(respond(401, { error: "invalid email or password" }));
    render(<LoginPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("Incorrect email or password.");
    expect(screen.queryByRole("button", { name: /resend/i })).toBeNull();
  });

  it("says how long to wait when login attempts are rate limited", async () => {
    vi.mocked(login).mockResolvedValue(
      new Response(JSON.stringify({ error: "too many requests" }), { status: 429, headers: { "Retry-After": "240" } })
    );
    render(<LoginPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("Too many login attempts. Try again in 4 minutes.");
  });

  it("confirms the email and clears the tokens from the url after the confirmation link", async () => {
    window.history.replaceState(null, "", "/#access_token=secret&type=signup");
    render(<LoginPage />);

    expect((await screen.findByRole("status")).textContent).toMatch(/your email is confirmed/i);
    expect(window.location.hash).toBe("");
  });

  it("explains an expired confirmation link", async () => {
    window.history.replaceState(null, "", "/#error=access_denied&error_code=otp_expired");
    render(<LoginPage />);

    expect((await screen.findByRole("alert")).textContent).toMatch(/invalid or has expired/i);
    expect(window.location.hash).toBe("");
  });
});
