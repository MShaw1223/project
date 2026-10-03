import { describe, expect, it } from "vitest";
import {
  accountNameSchema,
  changePasswordSchema,
  credentialsSchema,
  currencyPairSchema,
  newTradeSchema,
  signupSchema,
  usernameSchema,
} from "@/lib/validation";

const firstIssue = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? undefined : result.error?.issues[0].message;

describe("credentialsSchema", () => {
  it("accepts a valid email and password and trims the email", () => {
    const parsed = credentialsSchema.parse({ email: "  trader@example.com ", password: "secret123" });
    expect(parsed.email).toBe("trader@example.com");
  });

  it.each([
    ["not an email", { email: "trader", password: "secret123" }],
    ["short password", { email: "trader@example.com", password: "12345" }],
    ["long password", { email: "trader@example.com", password: "x".repeat(73) }],
    ["missing email", { password: "secret123" }],
  ])("rejects %s", (_name, input) => {
    expect(credentialsSchema.safeParse(input).success).toBe(false);
  });
});

describe("password confirmation", () => {
  it("rejects a sign up whose passwords differ", () => {
    const result = signupSchema.safeParse({ email: "t@example.com", password: "secret123", confirmPassword: "other123" });
    expect(firstIssue(result)).toBe("Passwords do not match");
  });

  it("rejects a password change whose entries differ", () => {
    expect(firstIssue(changePasswordSchema.safeParse({ password: "secret123", confirmPassword: "x" }))).toBe(
      "Entries do not match"
    );
  });

  it("accepts matching entries", () => {
    expect(changePasswordSchema.safeParse({ password: "secret123", confirmPassword: "secret123" }).success).toBe(true);
  });
});

describe("single field schemas", () => {
  it("trims account names and rejects blank or long ones", () => {
    expect(accountNameSchema.parse({ name: "  Main " }).name).toBe("Main");
    expect(accountNameSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(accountNameSchema.safeParse({ name: "x".repeat(16) }).success).toBe(false);
  });

  it("allows 3-20 letters, numbers and underscores in usernames", () => {
    expect(usernameSchema.safeParse({ username: "trader_1" }).success).toBe(true);
    expect(usernameSchema.safeParse({ username: "no spaces" }).success).toBe(false);
    expect(usernameSchema.safeParse({ username: "ab" }).success).toBe(false);
  });

  it("upper-cases currency pair symbols before checking them", () => {
    expect(currencyPairSchema.parse({ symbol: " eurusd " }).symbol).toBe("EURUSD");
    expect(currencyPairSchema.safeParse({ symbol: "EUR/USD" }).success).toBe(false);
  });
});

describe("newTradeSchema", () => {
  const valid = {
    account_id: "acc-1",
    currency_pair: "EURUSD",
    direction: "long",
    entry_price: "1.10",
    exit_price: "1.20",
    stop_loss: "1.05",
    notes: "",
  };

  it("turns form strings into the backend's trade request", () => {
    expect(newTradeSchema.parse(valid)).toEqual({ ...valid, entry_price: 1.1, exit_price: 1.2, stop_loss: 1.05 });
  });

  it("sends a null stop loss when it is left empty", () => {
    expect(newTradeSchema.parse({ ...valid, stop_loss: "" }).stop_loss).toBeNull();
  });

  it.each([
    ["no account", { account_id: "" }, "Select the account for this trade"],
    ["no pair", { currency_pair: "" }, "Select or add a currency pair"],
    ["no direction", { direction: "" }, "Choose whether the trade was long or short"],
    ["an empty entry price", { entry_price: "" }, "Entry and close price must both be greater than 0"],
    ["a non-numeric close price", { exit_price: "abc" }, "Entry and close price must both be greater than 0"],
    ["a negative stop loss", { stop_loss: "-1" }, "Stop loss must be greater than 0, or left empty"],
    ["a long stop above entry", { stop_loss: "1.15" }, "For a long trade the stop loss must be below the entry price"],
    [
      "a short stop below entry",
      { direction: "short", stop_loss: "1.05" },
      "For a short trade the stop loss must be above the entry price",
    ],
    ["notes that are too long", { notes: "x".repeat(1001) }, "Notes must be at most 1000 characters"],
  ])("rejects %s", (_name, override, message) => {
    expect(firstIssue(newTradeSchema.safeParse({ ...valid, ...override }))).toBe(message);
  });
});
