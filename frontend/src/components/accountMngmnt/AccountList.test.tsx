import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AccountList from "@/components/accountMngmnt/AccountList";
import * as accountsApi from "@/lib/accounts";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

vi.mock("@/lib/accounts", async () => {
  const actual = await vi.importActual<typeof accountsApi>("@/lib/accounts");
  return { ...actual, getAccounts: vi.fn(), updateAccount: vi.fn(), deleteAccount: vi.fn() };
});

beforeEach(() => {
  vi.mocked(accountsApi.getAccounts).mockResolvedValue([{ id: "acc-1", name: "Main" }]);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

async function startRename(newName: string) {
  renderWithQueryClient(<AccountList />);
  fireEvent.click(await screen.findByRole("button", { name: "Rename Main" }));
  fireEvent.change(screen.getByLabelText("New name for Main"), { target: { value: newName } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
}

describe("AccountList", () => {
  it("shows an empty state when there are no accounts", async () => {
    vi.mocked(accountsApi.getAccounts).mockResolvedValue([]);
    renderWithQueryClient(<AccountList />);

    expect(await screen.findByText(/no accounts yet/i)).toBeTruthy();
  });

  it("renames an account with the trimmed name", async () => {
    vi.mocked(accountsApi.updateAccount).mockResolvedValue({ id: "acc-1", name: "Swing" });

    await startRename("  Swing ");

    await waitFor(() => expect(accountsApi.updateAccount).toHaveBeenCalledWith("acc-1", "Swing"));
  });

  it("blocks an empty name before calling the backend", async () => {
    await startRename("   ");

    expect(screen.getByRole("alert").textContent).toMatch(/enter a name/i);
    expect(accountsApi.updateAccount).not.toHaveBeenCalled();
  });

  it("only deletes after the deletion is confirmed", async () => {
    vi.mocked(accountsApi.deleteAccount).mockResolvedValue(undefined);
    renderWithQueryClient(<AccountList />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete Main" }));
    expect(accountsApi.deleteAccount).not.toHaveBeenCalled();
    expect(screen.getByText(/cannot be undone/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() => expect(accountsApi.deleteAccount).toHaveBeenCalledWith("acc-1"));
  });

  it("shows an error when the delete fails", async () => {
    vi.mocked(accountsApi.deleteAccount).mockRejectedValue(new Error("boom"));
    renderWithQueryClient(<AccountList />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete Main" }));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/failed to delete/i);
  });
});
