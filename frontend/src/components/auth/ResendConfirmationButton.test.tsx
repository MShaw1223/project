import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";
import { RESEND_COOLDOWN_SECONDS, ResendConfirmationButton } from "@/components/auth/ResendConfirmationButton";
import { resendConfirmation } from "@/lib/auth";
import { ApiError } from "@/lib/api";

vi.mock("@/lib/auth", () => ({ resendConfirmation: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  cleanup();
});

async function clickResend() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /resend confirmation email/i }));
  });
}

describe("ResendConfirmationButton", () => {
  it("resends, confirms, and waits out the cooldown before allowing another", async () => {
    vi.useFakeTimers();
    vi.mocked(resendConfirmation).mockResolvedValue(undefined);
    renderWithQueryClient(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect(resendConfirmation).toHaveBeenCalledWith("trader@example.com");
    expect(screen.getByRole("status").textContent).toMatch(/new confirmation link to trader@example\.com/i);
    const button = screen.getByRole("button", { name: /resend confirmation email/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toMatch("(1:00)");

    for (let second = 0; second < RESEND_COOLDOWN_SECONDS; second++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(button.disabled).toBe(false);
  });

  it("waits a minute when Supabase refuses without saying how long", async () => {
    vi.mocked(resendConfirmation).mockRejectedValue(new ApiError(429, "too many requests"));
    renderWithQueryClient(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect((await screen.findByRole("alert")).textContent).toMatch(/too many emails/i);
    const button = screen.getByRole("button", { name: /resend/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toMatch("(1:00)");
  });

  it("waits as long as the backend's Retry-After says", async () => {
    vi.mocked(resendConfirmation).mockRejectedValue(new ApiError(429, "too many requests", 125));
    renderWithQueryClient(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect(screen.getByRole("button", { name: /resend/i }).textContent).toMatch("(2:05)");
  });

  it("lets the user retry straight away after an unexpected failure", async () => {
    vi.mocked(resendConfirmation).mockRejectedValue(new ApiError(500, "failed"));
    renderWithQueryClient(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect((await screen.findByRole("alert")).textContent).toMatch(/couldn't resend/i);
    expect((screen.getByRole("button", { name: /resend/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("says the server is unreachable when the request never gets there", async () => {
    vi.mocked(resendConfirmation).mockRejectedValue(new TypeError("Failed to fetch"));
    renderWithQueryClient(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect((await screen.findByRole("alert")).textContent).toMatch(/unable to reach the server/i);
  });
});
