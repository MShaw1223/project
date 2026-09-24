import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CurrencyPairPicker from "@/components/tradeEntry/CurrencyPairPicker";
import * as tradesApi from "@/lib/trades";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";

vi.mock("@/lib/trades", async () => {
  const actual = await vi.importActual<typeof tradesApi>("@/lib/trades");
  return { ...actual, getCurrencyPairs: vi.fn(), createCurrencyPair: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("CurrencyPairPicker", () => {
  it("adds a new, valid symbol and reports it to the parent", async () => {
    vi.mocked(tradesApi.getCurrencyPairs).mockResolvedValue([]);
    vi.mocked(tradesApi.createCurrencyPair).mockResolvedValue({
      id: "1",
      created_at: "now",
      user_id: "u1",
      symbol: "EURUSD",
    });
    const onChange = vi.fn();
    renderWithQueryClient(<CurrencyPairPicker value="" onChange={onChange} />);

    fireEvent.click(await screen.findByRole("button", { name: /add new pair/i }));
    fireEvent.change(screen.getByLabelText(/new currency pair symbol/i), { target: { value: "eurusd" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    await waitFor(() => expect(tradesApi.createCurrencyPair).toHaveBeenCalledWith("EURUSD"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("EURUSD"));
  });

  it("rejects an invalid symbol without calling the api", async () => {
    vi.mocked(tradesApi.getCurrencyPairs).mockResolvedValue([]);
    renderWithQueryClient(<CurrencyPairPicker value="" onChange={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: /add new pair/i }));
    fireEvent.change(screen.getByLabelText(/new currency pair symbol/i), { target: { value: "$$" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/3-10 letters/i);
    expect(tradesApi.createCurrencyPair).not.toHaveBeenCalled();
  });
});
