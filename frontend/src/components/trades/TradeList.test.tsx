import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TradeList } from "@/components/trades/TradeList";
import * as tradesApi from "@/lib/trades";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

vi.mock("@/lib/trades", async () => {
  const actual = await vi.importActual<typeof tradesApi>("@/lib/trades");
  return { ...actual, getTrades: vi.fn(), deleteTrade: vi.fn() };
});

const trade = {
  id: "t1",
  created_at: "2024-01-01T00:00:00.000Z",
  account_id: "acc-1",
  user_id: "u1",
  currency_pair: "EURUSD",
  direction: "long" as const,
  entry_price: 1.1,
  exit_price: 1.2,
  stop_loss: 1.05,
  r_multiple: 2,
  take_profit: null,
  risk_ratio: null,
  notes: "note",
  outcome: "win" as const,
};

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("TradeList", () => {
  it("prompts for an account when none is selected", () => {
    renderWithQueryClient(<TradeList accountId="" />);
    expect(screen.getByText(/select an account/i)).toBeTruthy();
    expect(tradesApi.getTrades).not.toHaveBeenCalled();
  });

  it("shows an empty state when the account has no trades", async () => {
    vi.mocked(tradesApi.getTrades).mockResolvedValue([]);
    renderWithQueryClient(<TradeList accountId="acc-1" />);
    expect(await screen.findByText(/no trades recorded/i)).toBeTruthy();
  });

  it("renders trades for the selected account", async () => {
    vi.mocked(tradesApi.getTrades).mockResolvedValue([trade]);
    renderWithQueryClient(<TradeList accountId="acc-1" />);

    expect(await screen.findByText("EURUSD")).toBeTruthy();
    expect(tradesApi.getTrades).toHaveBeenCalledWith("acc-1");
  });

  it("deletes a trade after a confirm step", async () => {
    vi.mocked(tradesApi.getTrades).mockResolvedValue([trade]);
    vi.mocked(tradesApi.deleteTrade).mockResolvedValue(undefined);
    renderWithQueryClient(<TradeList accountId="acc-1" />);

    fireEvent.click(await screen.findByRole("button", { name: /^delete$/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => expect(vi.mocked(tradesApi.deleteTrade).mock.calls[0]?.[0]).toEqual("t1"));
  });
});
