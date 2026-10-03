import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { AppShell } from "@/components/layout/AppShell";
import { useUser } from "@/hooks/useSession";
import { getCurrentUser, logout } from "@/lib/auth";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn(), logout: vi.fn() }));

const Page = () => <p>signed in as {useUser().email}</p>;

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("AppShell session guard", () => {
  it("renders nothing and redirects to login without a session", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const { container } = renderWithQueryClient(
      <AppShell>
        <Page />
      </AppShell>
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/", { replace: true }));
    expect(container.innerHTML).toBe("");
  });

  it("renders the page with the signed in user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", email: "trader@example.com" });
    renderWithQueryClient(
      <AppShell>
        <Page />
      </AppShell>
    );

    expect(await screen.findByText("signed in as trader@example.com")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("says the server is unreachable instead of logging the user out when the check fails", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new TypeError("Failed to fetch"));
    renderWithQueryClient(
      <AppShell>
        <Page />
      </AppShell>
    );

    expect((await screen.findByRole("alert")).textContent).toMatch(/unable to reach the server/i);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("logs out, leaves for login and only then drops the cached data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", email: "trader@example.com" });
    vi.mocked(logout).mockResolvedValue(undefined);
    let cacheWhenLeaving: unknown;
    const { queryClient } = renderWithQueryClient(
      <AppShell>
        <Page />
      </AppShell>
    );
    queryClient.setQueryData(["accounts"], [{ id: "a1", name: "main" }]);
    navigate.mockImplementation(async () => {
      cacheWhenLeaving = queryClient.getQueryData(["accounts"]);
      return true;
    });

    // the desktop sidebar's button, the mobile drawer is closed
    fireEvent.click((await screen.findAllByRole("button", { name: /log out/i }))[0]);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/"));
    expect(logout).toHaveBeenCalled();
    expect(cacheWhenLeaving).toBeDefined();
    await waitFor(() => expect(queryClient.getQueryData(["accounts"])).toBeUndefined());
  });

  it("still leaves for login when the logout request fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", email: "trader@example.com" });
    vi.mocked(logout).mockRejectedValue(new TypeError("Failed to fetch"));
    navigate.mockResolvedValue(true);
    renderWithQueryClient(
      <AppShell>
        <Page />
      </AppShell>
    );

    fireEvent.click((await screen.findAllByRole("button", { name: /log out/i }))[0]);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/"));
  });
});
