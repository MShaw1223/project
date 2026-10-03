import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/router";
import { getCurrentUser } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn(), logout: vi.fn() }));

function visit(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("routes", () => {
  it("serves the login page at the root, with its title", async () => {
    visit("/");

    expect(await screen.findByText("Welcome back")).toBeTruthy();
    expect(document.title).toBe("FXTrax - Login");
  });

  it("guards the signed-in pages: without a session they send the visitor to login", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const router = visit("/profile");

    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(await screen.findByText("Welcome back")).toBeTruthy();
  });

  it.each([
    ["/home", "/dashboard"],
    ["/Trade-Entry", "/trades/new"],
    ["/entry-management", "/trades"],
    ["/account-management", "/accounts"],
    ["/users", "/profile"],
  ])("redirects the old path %s to %s", async (from, to) => {
    // the session check never settles, so the page behind the shell doesn't load
    vi.mocked(getCurrentUser).mockReturnValue(new Promise(() => undefined));
    const router = visit(from);

    await waitFor(() => expect(router.state.location.pathname).toBe(to));
  });

  it("still serves sign up at its old mixed-case path", async () => {
    visit("/signUp");

    expect(await screen.findByText("Create an account")).toBeTruthy();
  });

  it("says so when there is nothing at the address", async () => {
    visit("/nope");

    expect(await screen.findByText("Page not found")).toBeTruthy();
  });
});
