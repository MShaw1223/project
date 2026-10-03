import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UsernameForm } from "@/components/profile/UsernameForm";
import * as profileApi from "@/lib/profile";
import { ApiError } from "@/lib/api";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

vi.mock("@/lib/profile", async () => {
  const actual = await vi.importActual<typeof profileApi>("@/lib/profile");
  return { ...actual, getProfile: vi.fn(), updateUsername: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

async function renderAndSubmit(username: string) {
  renderWithQueryClient(<UsernameForm />);
  const input = await screen.findByLabelText("Username");
  fireEvent.change(input, { target: { value: username } });
  fireEvent.click(screen.getByRole("button", { name: /username/i }));
}

describe("UsernameForm", () => {
  it("saves a trimmed, valid username", async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue({ username: null });
    vi.mocked(profileApi.updateUsername).mockResolvedValue({ username: "trader_1" });

    await renderAndSubmit("  trader_1 ");

    await waitFor(() => expect(vi.mocked(profileApi.updateUsername).mock.calls[0]?.[0]).toEqual("trader_1"));
    expect((await screen.findByRole("status")).textContent).toBe("Username saved.");
  });

  it("prefills the current username", async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue({ username: "trader_1" });
    renderWithQueryClient(<UsernameForm />);

    const input = (await screen.findByLabelText("Username")) as HTMLInputElement;
    expect(input.value).toBe("trader_1");
  });

  it("blocks an invalid username before calling the backend", async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue({ username: null });

    await renderAndSubmit("no spaces");

    expect(screen.getByRole("alert").textContent).toMatch(/3-20 letters/i);
    expect(profileApi.updateUsername).not.toHaveBeenCalled();
  });

  it("says when the username is already taken", async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue({ username: null });
    vi.mocked(profileApi.updateUsername).mockRejectedValue(
      new ApiError(409, "username is already taken")
    );

    await renderAndSubmit("taken_name");

    expect((await screen.findByRole("alert")).textContent).toMatch(/already taken/i);
  });

  it("shows a generic error for other failures", async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue({ username: null });
    vi.mocked(profileApi.updateUsername).mockRejectedValue(new ApiError(500, "failed to update username"));

    await renderAndSubmit("trader_1");

    expect((await screen.findByRole("alert")).textContent).toMatch(/failed to save the username/i);
  });
});
