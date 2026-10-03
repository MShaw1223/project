import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";
import LoginPage from "@/pages/index";
import { login, resendConfirmation } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("@/lib/auth", () => ({ login: vi.fn(), resendConfirmation: vi.fn() }));

beforeEach(() => navigate.mockReset());
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
  it("starts the new session from an empty cache and goes to the dashboard", async () => {
    const user = { id: "u2", email: "trader@example.com" };
    vi.mocked(login).mockResolvedValue(user);
    const { queryClient } = renderWithQueryClient(<LoginPage />);
    queryClient.setQueryData(["accounts"], [{ id: "a1", name: "previous user's account" }]);

    submit();

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/dashboard"));
    expect(queryClient.getQueryData(["accounts"])).toBeUndefined();
    expect(queryClient.getQueryData(["session"])).toEqual(user);
  });

  it("tells the user to confirm their email when the backend says it isn't confirmed", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(403, "email not confirmed"));
    renderWithQueryClient(<LoginPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toMatch(/confirm your email before logging in/i);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("offers to resend the confirmation email to the address that couldn't log in", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(403, "email not confirmed"));
    vi.mocked(resendConfirmation).mockResolvedValue(undefined);
    renderWithQueryClient(<LoginPage />);

    submit();
    fireEvent.click(await screen.findByRole("button", { name: /resend confirmation email/i }));

    await waitFor(() => expect(resendConfirmation).toHaveBeenCalledWith("trader@example.com"));
    expect((await screen.findByRole("status")).textContent).toMatch(/new confirmation link/i);
  });

  it("says the email or password is wrong on a 401", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, "invalid email or password"));
    renderWithQueryClient(<LoginPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("Incorrect email or password.");
    expect(screen.queryByRole("button", { name: /resend/i })).toBeNull();
  });

  it("says how long to wait when login attempts are rate limited", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(429, "too many requests", 240));
    renderWithQueryClient(<LoginPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("Too many login attempts. Try again in 4 minutes.");
  });

  it("confirms the email and clears the tokens from the url after the confirmation link", async () => {
    window.history.replaceState(null, "", "/#access_token=secret&type=signup");
    renderWithQueryClient(<LoginPage />);

    expect((await screen.findByRole("status")).textContent).toMatch(/your email is confirmed/i);
    expect(window.location.hash).toBe("");
  });

  it("explains an expired confirmation link", async () => {
    window.history.replaceState(null, "", "/#error=access_denied&error_code=otp_expired");
    renderWithQueryClient(<LoginPage />);

    expect((await screen.findByRole("alert")).textContent).toMatch(/invalid or has expired/i);
    expect(window.location.hash).toBe("");
  });
});
