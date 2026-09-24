import { describe, expect, it } from "vitest";
import { credentialsSchema } from "@/utils/schema";

describe("credentialsSchema", () => {
  it("accepts a valid email and password and trims the email", () => {
    const parsed = credentialsSchema.parse({ email: "  trader@example.com ", password: "secret123" });
    expect(parsed.email).toBe("trader@example.com");
  });

  it.each([
    ["not an email", { email: "trader", password: "secret123" }],
    ["short password", { email: "trader@example.com", password: "12345" }],
    ["long password", { email: "trader@example.com", password: "x".repeat(73) }],
    ["missing email", { email: null, password: "secret123" }],
  ])("rejects %s", (_name, input) => {
    expect(credentialsSchema.safeParse(input).success).toBe(false);
  });
});
