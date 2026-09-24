import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChangePassword from "@/components/profile/ChangePassword";
import * as profileApi from "@/lib/profile";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

vi.mock("@/lib/profile", async () => {
  const actual = await vi.importActual<typeof profileApi>("@/lib/profile");
  return { ...actual, updatePassword: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function fillAndSubmit(newPassword: string, confirmPassword: string) {
  fireEvent.change(screen.getByPlaceholderText("New password....."), { target: { value: newPassword } });
  fireEvent.change(screen.getByPlaceholderText("Re-enter password..."), { target: { value: confirmPassword } });
  fireEvent.click(screen.getByRole("button", { name: /update password/i }));
}

describe("ChangePassword", () => {
  it("submits matching, valid passwords", async () => {
    vi.mocked(profileApi.updatePassword).mockResolvedValue(undefined);
    renderWithQueryClient(<ChangePassword />);

    fillAndSubmit("new-secret", "new-secret");

    await waitFor(() => expect(profileApi.updatePassword).toHaveBeenCalledWith("new-secret"));
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Password updated.");
  });

  it("rejects mismatched passwords without calling the api", async () => {
    renderWithQueryClient(<ChangePassword />);

    fillAndSubmit("new-secret", "different");

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Entries do not match");
    expect(profileApi.updatePassword).not.toHaveBeenCalled();
  });

  it("rejects a too-short password without calling the api", async () => {
    renderWithQueryClient(<ChangePassword />);

    fillAndSubmit("abc", "abc");

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/between 6 and 72 characters/i);
    expect(profileApi.updatePassword).not.toHaveBeenCalled();
  });

  it("shows an error when the backend rejects the update", async () => {
    vi.mocked(profileApi.updatePassword).mockRejectedValue(new Error("invalid password"));
    renderWithQueryClient(<ChangePassword />);

    fillAndSubmit("new-secret", "new-secret");

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/failed to update the password/i);
  });
});
