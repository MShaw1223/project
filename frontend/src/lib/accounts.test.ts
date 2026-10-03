import { afterEach, describe, expect, it, vi } from "vitest";
import { createAccount, deleteAccount, getAccounts, updateAccount } from "@/lib/accounts";

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe("accounts api", () => {
  it("lists accounts through the backend proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(200, { accounts: [{ id: "1", name: "main" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAccounts()).resolves.toEqual([{ id: "1", name: "main" }]);
    expect(fetchMock.mock.calls[0][0]).toBe("/backend/accounts");
  });

  it("addresses updates and deletes by id and never sends a token itself", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => respond(200, { account: { id: "abc", name: "new" } }));
    vi.stubGlobal("fetch", fetchMock);

    await updateAccount("abc", "new");
    await deleteAccount("abc");

    const [updateCall, deleteCall] = fetchMock.mock.calls;
    expect(updateCall[0]).toBe("/backend/accounts/abc");
    expect(updateCall[1]).toMatchObject({ method: "PUT", body: JSON.stringify({ name: "new" }) });
    expect(deleteCall[0]).toBe("/backend/accounts/abc");
    expect(deleteCall[1]).toMatchObject({ method: "DELETE" });
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/authorization/i);
  });

  it("creates an account and returns it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(201, { account: { id: "abc", name: "main" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createAccount("main")).resolves.toEqual({ id: "abc", name: "main" });
    expect(fetchMock.mock.calls[0]).toMatchObject(["/backend/accounts", { method: "POST", body: JSON.stringify({ name: "main" }) }]);
  });

  it("surfaces the backend error message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(400, { error: "invalid account name" })));
    await expect(createAccount("")).rejects.toThrow("invalid account name");
  });

});
