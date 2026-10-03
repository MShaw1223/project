// Post-deploy checks against a running environment, through the same path a browser takes: TLS at
// Traefik, nginx serving the app, its /backend proxy to the Go server and on to Supabase. They only read or use
// throwaway inputs, so they are safe to run against any environment.
// Run with: BASE_URL=https://<host> node --test
import assert from "node:assert/strict";
import { test } from "node:test";

const base = process.env.BASE_URL;
assert.ok(base, "BASE_URL must be set");
const origin = new URL(base).origin;

const post = (path, body, headers = {}) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("the app is served over https", async () => {
  const res = await fetch(base);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
});

test("pages carry the security headers", async () => {
  const res = await fetch(base);
  assert.match(res.headers.get("strict-transport-security") ?? "", /max-age=\d+/);
  assert.equal(res.headers.get("x-frame-options"), "DENY");
  assert.match(res.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
});

test("plain http doesn't serve the app", async () => {
  const res = await fetch(base.replace(/^https:/, "http:"), { redirect: "manual" });
  assert.equal(res.status, 404);
});

test("the backend is reachable through the frontend proxy", async () => {
  const res = await fetch(`${base}/backend/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("the session cookie is HttpOnly, Secure and SameSite=Lax", async () => {
  // logout sets the cookie through the same code as login, without needing an account
  const res = await post("/backend/auth/logout", "");
  assert.equal(res.status, 204);
  const cookie = res.headers.get("set-cookie") ?? "";
  assert.match(cookie, /access_token=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/, "https isn't reaching the backend through the proxies");
  assert.match(cookie, /SameSite=Lax/);
});

test("logging in with wrong credentials is refused by Supabase without a cookie", async () => {
  const res = await post("/backend/auth/login", { email: "smoke-test@example.com", password: "not-the-password-1" });
  assert.equal(res.status, 401);
  assert.equal(res.headers.get("set-cookie"), null);
});

test("data needs a session", async () => {
  const res = await fetch(`${base}/backend/trades`);
  assert.equal(res.status, 401);
});

test("cross-site writes are refused", async () => {
  const res = await post("/backend/auth/logout", "", { Origin: "https://attacker.example" });
  assert.equal(res.status, 403);
});

test("oversized bodies are refused", async () => {
  const res = await post("/backend/auth/login", JSON.stringify({ email: "a".repeat(70_000) }));
  assert.equal(res.status, 413);
});
