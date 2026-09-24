---
name: frontend-backend-integration
description: Use when wiring the Next.js frontend to the Go backend on localhost:8080 (adding/changing fetch calls, migrating pages off frontend/src/pages/api/*, auth/session cookies, debugging CORS, 401s, 404s or payload mismatches). Also the place to record new findings about this integration.
---

# Frontend → Go backend integration

## How requests reach the backend
- The Go (Gin) server listens on `:8080` (see [backend/main.go](backend/main.go)) and has **no CORS middleware**. The browser must never call it cross-origin directly.
- [frontend/next.config.js](frontend/next.config.js) rewrites `/backend/:path*` → `${BACKEND_URL ?? "http://localhost:8080"}/:path*`. Browser code calls `/backend/<route>` (leading slash, same origin). Restart `next dev` after changing it.
- Fetch wrappers live in `frontend/src/lib/` (see [frontend/src/lib/auth.ts](frontend/src/lib/auth.ts)) and use `BACKEND_PREFIX`. Pages and components call the wrapper, never `fetch` directly.

## Auth: httpOnly session cookie (decided design)
- `POST /auth/login` ([backend/handlers/auth.go](backend/handlers/auth.go)) signs in with Supabase, sets the `access_token` cookie (httpOnly, SameSite=Lax, Path=/, MaxAge = `expires_in`, Secure only on https) and returns `{"user": ...}`. **The token is deliberately not in the response body**, so JS never sees it. Do not "helpfully" add it back or copy it into localStorage/context.
- `POST /auth/logout` clears the cookie (204).
- `ParseAuthHeader` ([backend/handlers/provider.go](backend/handlers/provider.go)) accepts `Authorization: Bearer <token>` first, then falls back to the cookie. Every protected handler must go through it; a new protected route needs no frontend token plumbing.
- Because the proxy keeps everything same-origin, `fetch` sends the cookie automatically. Do not set `credentials` tricks or call `:8080` directly.
- Guarding pages: wrap migrated pages in `withSession` ([frontend/src/components/withSession.tsx](frontend/src/components/withSession.tsx)). It calls `/backend/auth/user`, redirects to `/` when there is no valid session, and passes `user` as a prop. Use `getCurrentUser`, `logout` from `lib/auth.ts` and the account functions (`getAccounts`, `createAccount`, `updateAccount`, `deleteAccount`) from `lib/accounts.ts`.
- The refresh token is not stored anywhere yet, so sessions end when the access token expires (Supabase default 1h). Adding a refresh cookie + `/auth/refresh` is the next step if that is a problem.

## Semantics to check on every migration
1. **Payload shape.** Go models use different field names than the legacy Next API routes. Login: Go expects `{email, password}`; legacy sent `{username, passwd}`. Read the Go `models/` struct's json tags before writing the wrapper.
2. **Status codes.** The login handler returns 500 for *any* service error (including bad credentials), so the UI cannot tell "wrong password" from "server down". Fix the handler (401 for bad credentials) if the UI needs it.
3. **Response shape.** Go wraps results (`{"accounts": ...}`, `{"user": ...}`), unlike the legacy routes.
4. **No Next API routes.** `frontend/src/pages/api/` no longer exists and must not come back; add a Go route instead.
5. **Relative vs absolute URLs.** `fetch("auth/login")` (no leading slash) resolves against the current path and breaks on nested pages.
6. **Backend tests.** Cookie, login, signup and account behavior is covered by the `*_flow_test.go` / `*_handler_test.go` / `provider_test.go` files. The Supabase integration tests skip unless `SUPABASE_URL`, `SUPABASE_KEY` and `SUPABASE_TEST_TOKEN` (plus `SUPABASE_TEST_ACCOUNT_ID` for the by-id test) are set.

## Migration status
Decided with the user: **no `?li=` hash anywhere; identity comes only from the httpOnly session cookie, and the frontend never uses Next.js API routes (`pages/api`), everything goes to the Go backend.** Never reintroduce identifiers in URLs, client-readable storage, or `pages/api` routes. Migrate remaining features one at a time (Go handler/service/repo + frontend port).
- Migrated (Go + cookie): `/` login, `/signUp` (`POST /auth/signup`, creates a Supabase user and does **not** start a session, the user logs in next; requires a valid email and a 6-72 character password; Supabase may additionally require email confirmation before login works), `/home`, `/account-management` (`POST /accounts`, `PUT /accounts/:id`, `DELETE /accounts/:id`), logout from the side drawer (`POST /auth/logout`).
- Login/sign up use `credentialsSchema` ([frontend/src/utils/schema.ts](frontend/src/utils/schema.ts)), which mirrors the Go limits, and show inline errors.
- **Migrated**: `/users` (self-service profile — `PUT /profile/password` to change password via Supabase's self-update `client.Auth.WithToken(token).UpdateUser`, no service-role key needed; `POST /profile/deactivate` soft-deletes: bulk-deletes the caller's `brokerage_account` rows — which cascades to `trade` rows via FK — then sets `profile.active = false` and clears the session cookie). `/Trade-Entry` (`POST /trades`, plus `GET/POST/DELETE /currency-pairs` to manage the pair picker's saved symbols). `/entry-management` (`GET /trades?account_id=<uuid>`, `DELETE /trades/:id`). Client wrappers: `frontend/src/lib/profile.ts`, `frontend/src/lib/trades.ts`. Schema: `backend/migrations/0001_profile_trades_currency_pairs.sql` (run by hand against Supabase — there is no migration runner yet, so any future schema change needs a new numbered file and a manual apply).
- **Login refuses a deactivated account**: `AuthService.CreateSession` checks `profile.active` (via the optional, nil-safe `ProfileRepo` field) after a successful Supabase sign-in and returns `ErrAccountDeactivated` → the handler responds 401 `{"error": "account is deactivated"}` without setting the session cookie. A user who never got a `profile` row (shouldn't happen — see next point) fails login closed (500), not open.
- `profile` rows are created automatically by a Postgres trigger (`on_auth_user_created` → `handle_new_user()`) on every new `auth.users` insert, plus a one-time backfill in the migration for pre-existing users. If you add a new per-user table, follow this pattern rather than creating rows from the Go signup path (which doesn't have a session token yet to do an RLS-scoped insert).
- **Deleted for good:** `pages/api/**`, `utils/encodeUser.ts`, `utils/extractBody.ts`, `withKey`, the Neon/`sqlstring` dependencies, `selectAccount`/`selectPair` and the old entry/user components. If you find any of these referenced, it is a mistake.
- Legacy data lived in Neon and was not copied to Supabase; migrated features use Supabase (`brokerage_account`, `profile`, `currency_pair`, `trade`).
- `/home`'s stat tiles (`totalTrades`, `winPercentage`, `bestPair`, `worstPair`) are computed **client-side** in `frontend/src/pages/home.tsx` by fetching each account's trades (`getTrades`) and reducing them with `frontend/src/lib/tradeStats.ts#computeAccountStats` — there is no backend stats endpoint. Semantics mirror the legacy `home.ts` route: win % truncated to 2 decimals, best/worst pair = the pair with the most wins/losses (ties broken by first occurrence). If trade volume ever makes per-account client-side fetch+reduce too slow, move this into a Go endpoint that aggregates in the query instead.

## Conventions established by the accounts port (reuse for the next features)
- Go layering (every method takes `ctx` first; each layer depends on a small consumer-side interface; files are named `brokerage_accounts.go` etc.): handler (auth via `ParseAuthHeader`, bind + id validation, error → status via a `respond*Error` mapper) → service (input validation, returns `ErrInvalidInput`) → repository (user-scoped PostgREST client, so RLS applies; every query also filters `user_id`; sentinels `ErrUnauthenticated`/`ErrNotFound`). Status mapping: 400 invalid, 401 unauthenticated, 404 no matching row, 500 otherwise.
- The user-scoped-client helper is now shared: `repositories/client.go`'s `userScopedClient(ctx, provider, token)` (resolves the caller's id via `GetUser` and calls `client.UpdateAuthSession`) — every repository (`AccountsRepository`, `ProfileRepository`, `TradesRepository`, `CurrencyPairsRepository`) calls this instead of each having its own copy. Add new repositories on top of it rather than re-implementing.
- Address rows by **id (uuid), never by name** (legacy renamed/deleted every user's account sharing a name). Validate `:id` with `uuid.Parse` in the handler.
- Frontend: fetch functions in `lib/<feature>.ts`, `useQuery`/`useMutation` in components, invalidate the query key after mutations, inline `role="alert"` errors instead of `alert()`, no `FormData` non-null assertions. `AccountSelect` (id based) replaces `selectAccount.tsx` for migrated pages.
- Tests: backend behavior must ship with unit tests using the store-interface fakes (see the Testing policy in `backend-code-quality`); frontend tests only for critical logic (see `frontend-code-quality`). Both suites run in CI.
- `brokerage_account` deletes now cascade to `trade` via an explicit `on delete cascade` FK (`trade.account_id → brokerage_account.id`) added in `backend/migrations/0001_profile_trades_currency_pairs.sql` — no explicit trade deletion needed in the repository.
- Row-level security also enforces cross-table ownership where it matters: the `trade` insert policy checks `account_id` belongs to `auth.uid()` via a subquery on `brokerage_account`, so a user can't attach a trade to someone else's account id even if they guess it. Consider the same pattern for any future table that references another user-owned table by id.

## Self-growth
When you learn something new about this integration (a route added, status code changed, env var, gotcha), update this file in the same change: add it to the relevant section, update the migration status, and remove anything now false.
