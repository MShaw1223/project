import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";
import SignUpPage from "@/pages/signup";
import { signup } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("@/lib/auth", () => ({ signup: vi.fn(), resendConfirmation: vi.fn() }));

beforeEach(() => navigate.mockReset());
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
    vi.mocked(signup).mockResolvedValue({ emailConfirmationRequired: true });
    renderWithQueryClient(<SignUpPage />);

    submit();

    const status = await screen.findByRole("status");
    expect(status.textContent).toMatch(/sent a confirmation link to trader@example\.com/i);
    expect(screen.getByRole("link", { name: /go to log in/i }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("button", { name: /resend confirmation email/i })).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("goes straight to login when the email is already confirmed", async () => {
    vi.mocked(signup).mockResolvedValue({ emailConfirmationRequired: false });
    renderWithQueryClient(<SignUpPage />);

    submit();

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/"));
    expect(screen.queryByText(/check your email/i)).toBeNull();
  });

  it("shows an error and stays on the form when sign up is rejected", async () => {
    vi.mocked(signup).mockRejectedValue(new ApiError(400, "could not sign up with those details"));
    renderWithQueryClient(<SignUpPage />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toMatch(/failed to sign up/i);
    expect(navigate).not.toHaveBeenCalled();
  });
});
