import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeleteUserSection } from "@/components/profile/DeleteUserSection";
import * as profileApi from "@/lib/profile";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
navigate.mockResolvedValue(true);
vi.mock("@/lib/profile", async () => {
  const actual = await vi.importActual<typeof profileApi>("@/lib/profile");
  return { ...actual, deleteUser: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("DeleteUserSection", () => {
  it("requires typing the confirm phrase before the confirm button is enabled", () => {
    renderWithQueryClient(<DeleteUserSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    const confirmButton = screen.getByRole("button", { name: /confirm deletion/i });
    expect(confirmButton).toHaveProperty("disabled", true);

    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "nope" } });
    expect(confirmButton).toHaveProperty("disabled", true);

    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "DELETE" } });
    expect(confirmButton).toHaveProperty("disabled", false);
  });

  it("deletes the account and redirects to login on confirm", async () => {
    vi.mocked(profileApi.deleteUser).mockResolvedValue(undefined);
    renderWithQueryClient(<DeleteUserSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    await waitFor(() => expect(profileApi.deleteUser).toHaveBeenCalled());
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/"));
  });

  it("shows an error and does not redirect when deletion fails", async () => {
    vi.mocked(profileApi.deleteUser).mockRejectedValue(new Error("failed"));
    renderWithQueryClient(<DeleteUserSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    fireEvent.change(screen.getByLabelText(/confirm account deletion/i), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/failed to delete the account/i);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("cancel returns to the initial state without calling the api", () => {
    renderWithQueryClient(<DeleteUserSection />);

    fireEvent.click(screen.getByRole("button", { name: /^delete my account$/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByRole("button", { name: /^delete my account$/i })).toBeTruthy();
    expect(profileApi.deleteUser).not.toHaveBeenCalled();
  });
});
