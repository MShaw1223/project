import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCurrencyPair,
  createTrade,
  deleteTrade,
  getCurrencyPairs,
  getTrades,
} from "@/lib/trades";

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const newTrade = {
  account_id: "acc-1",
  currency_pair: "EURUSD",
  direction: "long" as const,
  entry_price: 1.1,
  exit_price: 1.2,
  stop_loss: 1.05,
  notes: "",
};

afterEach(() => vi.unstubAllGlobals());

describe("trades api", () => {
  it("lists trades for an account through the backend proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(200, { trades: [{ id: "1" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTrades("acc-1")).resolves.toEqual([{ id: "1" }]);
    expect(fetchMock.mock.calls[0][0]).toBe("/backend/trades?account_id=acc-1");
  });

  it("creates a trade and never sends a token itself", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(201, { trade: { id: "1", ...newTrade } }));
    vi.stubGlobal("fetch", fetchMock);

    await createTrade(newTrade);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/backend/trades");
    expect(init).toMatchObject({ method: "POST", body: JSON.stringify(newTrade) });
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/authorization/i);
  });

  it("deletes a trade by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(204));
    vi.stubGlobal("fetch", fetchMock);

    await deleteTrade("trade-1");

    expect(fetchMock.mock.calls[0]).toMatchObject(["/backend/trades/trade-1", { method: "DELETE" }]);
  });

  it("surfaces the backend error message on a rejected create", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(400, { error: "invalid trade" })));
    await expect(createTrade(newTrade)).rejects.toThrow("invalid trade");
  });

  it("lists and creates currency pairs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respond(200, { pairs: [{ id: "1", symbol: "EURUSD" }] }))
      .mockResolvedValueOnce(respond(201, { pair: { id: "2", symbol: "GBPUSD" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrencyPairs()).resolves.toEqual([{ id: "1", symbol: "EURUSD" }]);
    await expect(createCurrencyPair("GBPUSD")).resolves.toEqual({ id: "2", symbol: "GBPUSD" });
    expect(fetchMock.mock.calls[0][0]).toBe("/backend/currency-pairs");
    expect(fetchMock.mock.calls[1]).toMatchObject([
      "/backend/currency-pairs",
      { method: "POST", body: JSON.stringify({ symbol: "GBPUSD" }) },
    ]);
  });

});
