import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TradeEntryForm from "@/components/tradeEntry/TradeEntryForm";
import * as tradesApi from "@/lib/trades";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

// the account/pair/outcome pickers are Radix selects covered by their own
// tests; stand them up as simple buttons here so this file can focus on the
// form's own validation and submission logic
vi.mock("@/components/AccountSelect", () => ({
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <button type="button" onClick={() => onChange("account-1")}>
      choose account
    </button>
  ),
}));
vi.mock("@/components/tradeEntry/CurrencyPairPicker", () => ({
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <button type="button" onClick={() => onChange("EURUSD")}>
      choose pair
    </button>
  ),
}));
vi.mock("@/lib/trades", async () => {
  const actual = await vi.importActual<typeof tradesApi>("@/lib/trades");
  return { ...actual, createTrade: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function fillPrices({ entry = "1.1", exit = "1.2", stop = "1.05" } = {}) {
  fireEvent.change(screen.getByPlaceholderText("Entry price"), { target: { value: entry } });
  fireEvent.change(screen.getByPlaceholderText("Close price"), { target: { value: exit } });
  fireEvent.change(screen.getByPlaceholderText("Stop loss"), { target: { value: stop } });
}

function chooseAccountPairAndDirection(direction: "Long" | "Short" = "Long") {
  fireEvent.click(screen.getByRole("button", { name: /choose account/i }));
  fireEvent.click(screen.getByRole("button", { name: /choose pair/i }));
  fireEvent.click(screen.getByRole("radio", { name: direction }));
}

const savedTrade = {
  id: "t1",
  created_at: "now",
  account_id: "account-1",
  user_id: "u1",
  currency_pair: "EURUSD",
  direction: "long" as const,
  entry_price: 1.1,
  exit_price: 1.2,
  stop_loss: 1.05,
  r_multiple: 2,
  take_profit: null,
  risk_ratio: null,
  notes: "",
  outcome: "win" as const,
};

describe("TradeEntryForm", () => {
  it("submits direction and prices, and reports the outcome the backend derived", async () => {
    vi.mocked(tradesApi.createTrade).mockResolvedValue(savedTrade);
    renderWithQueryClient(<TradeEntryForm />);

    chooseAccountPairAndDirection();
    fillPrices();
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    await waitFor(() =>
      expect(tradesApi.createTrade).toHaveBeenCalledWith({
        account_id: "account-1",
        currency_pair: "EURUSD",
        direction: "long",
        entry_price: 1.1,
        exit_price: 1.2,
        stop_loss: 1.05,
        notes: "",
      })
    );
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Trade recorded as a win (+2R).");
  });

  it("sends a null stop loss when it is left empty", async () => {
    vi.mocked(tradesApi.createTrade).mockResolvedValue({ ...savedTrade, stop_loss: null, r_multiple: null });
    renderWithQueryClient(<TradeEntryForm />);

    chooseAccountPairAndDirection();
    fillPrices({ stop: "" });
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    await waitFor(() =>
      expect(tradesApi.createTrade).toHaveBeenCalledWith(expect.objectContaining({ stop_loss: null }))
    );
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Trade recorded as a win.");
  });

  it("blocks submission without an account", () => {
    renderWithQueryClient(<TradeEntryForm />);

    fireEvent.click(screen.getByRole("button", { name: /choose pair/i }));
    fireEvent.click(screen.getByRole("radio", { name: "Long" }));
    fillPrices();
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/select the account/i);
    expect(tradesApi.createTrade).not.toHaveBeenCalled();
  });

  it("blocks submission without a direction", () => {
    renderWithQueryClient(<TradeEntryForm />);

    fireEvent.click(screen.getByRole("button", { name: /choose account/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose pair/i }));
    fillPrices();
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/long or short/i);
    expect(tradesApi.createTrade).not.toHaveBeenCalled();
  });

  it("blocks submission when a price is zero or missing", () => {
    renderWithQueryClient(<TradeEntryForm />);

    chooseAccountPairAndDirection();
    fillPrices({ entry: "0" });
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/greater than 0/i);
    expect(tradesApi.createTrade).not.toHaveBeenCalled();
  });

  it("blocks a stop loss on the wrong side of the entry", () => {
    renderWithQueryClient(<TradeEntryForm />);

    chooseAccountPairAndDirection("Short");
    fillPrices({ entry: "1.1", exit: "1.0", stop: "1.05" });
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/above the entry price/i);
    expect(tradesApi.createTrade).not.toHaveBeenCalled();
  });

  it("shows an error when the backend rejects the trade", async () => {
    vi.mocked(tradesApi.createTrade).mockRejectedValue(new Error("invalid trade"));
    renderWithQueryClient(<TradeEntryForm />);

    chooseAccountPairAndDirection();
    fillPrices();
    fireEvent.click(screen.getByRole("button", { name: /submit trade/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/failed to submit the trade/i);
  });
});
