import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import * as profileApi from "@/lib/profile";
import * as authApi from "@/lib/auth";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

const push = vi.fn();
vi.mock("next/router", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/profile", async () => {
  const actual = await vi.importActual<typeof profileApi>("@/lib/profile");
  return { ...actual, deleteAccount: vi.fn() };
});
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof authApi>("@/lib/auth");
  return { ...actual, logout: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("DeleteAccountSection", () => {
  it("requires typing the confirm phrase before the confirm button is enabled", () => {
    renderWithQueryClient(<DeleteAccountSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    const confirmButton = screen.getByRole("button", { name: /confirm deletion/i });
    expect(confirmButton).toHaveProperty("disabled", true);

    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "nope" } });
    expect(confirmButton).toHaveProperty("disabled", true);

    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "DELETE" } });
    expect(confirmButton).toHaveProperty("disabled", false);
  });

  it("deletes the account, logs out, and redirects on confirm", async () => {
    vi.mocked(profileApi.deleteAccount).mockResolvedValue(undefined);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
    renderWithQueryClient(<DeleteAccountSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    await waitFor(() => expect(profileApi.deleteAccount).toHaveBeenCalled());
    await waitFor(() => expect(authApi.logout).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  });

  it("shows an error and does not redirect when deletion fails", async () => {
    vi.mocked(profileApi.deleteAccount).mockRejectedValue(new Error("failed"));
    renderWithQueryClient(<DeleteAccountSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/failed to delete the account/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("cancel returns to the initial state without calling the api", () => {
    renderWithQueryClient(<DeleteAccountSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByRole("button", { name: /^delete my account$/i })).toBeTruthy();
    expect(profileApi.deleteAccount).not.toHaveBeenCalled();
  });
});
