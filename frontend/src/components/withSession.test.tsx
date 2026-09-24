import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import withSession, { SessionProps } from "@/components/withSession";
import { getCurrentUser } from "@/lib/auth";

const replace = vi.fn();
vi.mock("next/router", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));

const Protected = ({ user }: SessionProps) => <p>signed in as {user.email}</p>;
const Guarded = withSession(Protected);

beforeEach(() => replace.mockReset());
afterEach(cleanup);

describe("withSession", () => {
  it("renders nothing and redirects to login without a session", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const { container } = render(<Guarded />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(container.innerHTML).toBe("");
  });

  it("redirects to login when the session check fails", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("network"));
    render(<Guarded />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it("renders the page with the resolved user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", email: "trader@example.com" });
    render(<Guarded />);

    expect(await screen.findByText("signed in as trader@example.com")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });
});
