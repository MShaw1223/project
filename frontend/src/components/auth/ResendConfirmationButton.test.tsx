import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RESEND_COOLDOWN_SECONDS, ResendConfirmationButton } from "@/components/auth/ResendConfirmationButton";
import { resendConfirmation } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({ resendConfirmation: vi.fn() }));

const respond = (status: number) => new Response(null, { status });

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
    vi.mocked(resendConfirmation).mockResolvedValue(respond(204));
    render(<ResendConfirmationButton email="trader@example.com" />);

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
    vi.mocked(resendConfirmation).mockResolvedValue(respond(429));
    render(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect(screen.getByRole("alert").textContent).toMatch(/too many emails/i);
    const button = screen.getByRole("button", { name: /resend/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toMatch("(1:00)");
  });

  it("waits as long as the backend's Retry-After says", async () => {
    vi.mocked(resendConfirmation).mockResolvedValue(
      new Response(null, { status: 429, headers: { "Retry-After": "125" } })
    );
    render(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect(screen.getByRole("button", { name: /resend/i }).textContent).toMatch("(2:05)");
  });

  it("lets the user retry straight away after an unexpected failure", async () => {
    vi.mocked(resendConfirmation).mockResolvedValue(respond(500));
    render(<ResendConfirmationButton email="trader@example.com" />);

    await clickResend();

    expect(screen.getByRole("alert").textContent).toMatch(/couldn't resend/i);
    expect((screen.getByRole("button", { name: /resend/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});
