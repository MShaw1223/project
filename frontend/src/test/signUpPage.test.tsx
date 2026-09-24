import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SignUpPage from "@/pages/signUp";
import { signup } from "@/lib/auth";

const push = vi.fn();
vi.mock("next/router", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth", () => ({ signup: vi.fn(), resendConfirmation: vi.fn() }));

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

beforeEach(() => push.mockReset());
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function submit(email = "trader@example.com", password = "secret123") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
}

describe("sign up page", () => {
  it("asks the user to confirm their email when Supabase requires it", async () => {
    vi.mocked(signup).mockResolvedValue(
      respond(201, { user: { email: "trader@example.com" }, email_confirmation_required: true })
    );
    render(<SignUpPage />);

    submit();

    const status = await screen.findByRole("status");
    expect(status.textContent).toMatch(/sent a confirmation link to trader@example\.com/i);
    expect(screen.getByRole("link", { name: /go to log in/i }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("button", { name: /resend confirmation email/i })).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });

  it("goes straight to login when the email is already confirmed", async () => {
    vi.mocked(signup).mockResolvedValue(
      respond(201, { user: { email: "trader@example.com" }, email_confirmation_required: false })
    );
    render(<SignUpPage />);

    submit();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(screen.queryByText(/check your email/i)).toBeNull();
  });

  it("shows an error and stays on the form when sign up is rejected", async () => {
    vi.mocked(signup).mockResolvedValue(respond(400, { error: "could not sign up with those details" }));
    render(<SignUpPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toMatch(/failed to sign up/i);
    expect(push).not.toHaveBeenCalled();
  });
});
