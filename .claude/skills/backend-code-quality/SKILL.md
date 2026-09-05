---
name: backend-code-quality
description: Use when writing, reviewing, or refactoring Go code under backend/ (handlers, services, repositories, models) — covers code smells/semantics review and unit testing conventions for this project's Gin + Supabase layered backend. Trigger on requests like "review this handler", "add tests for this service", "is this Go code clean", or any change under backend/.
---

# Backend code quality (Go / Gin / Supabase)

This backend follows a layered architecture:

```
handlers/  -> parses HTTP, calls a service, writes the gin.Context response
services/  -> business logic, calls one or more repositories
repositories/ -> talks to the Supabase provider / models
models/    -> plain data structs
```

Every review or new piece of code should respect that layering and the conventions below.

## Code semantics & smells to check for

When reviewing or writing Go code in this repo, actively look for:

1. **Concrete-type dependencies instead of interfaces.** Handlers, services, and repositories currently hold fields like `Repo *repositories.AccountsRepository` and `Provider *SupabaseProvider` (concrete structs, see [backend/services/accounts.go](backend/services/accounts.go) and [backend/repositories/provider.go](backend/repositories/provider.go)). This makes the code impossible to unit test without hitting real Supabase. When touching a layer, prefer defining a small interface for the dependency it calls (e.g. `type accountsRepo interface { GetUserAccounts(token string) (*[]models.BrokerageAccount, error) }`) and accepting that interface, so a fake/mock can be substituted in tests.
2. **Stub methods that silently do nothing.** e.g. `GetAccountByID` in [backend/repositories/accounts.go](backend/repositories/accounts.go) ignores `accountID` entirely and always returns `nil, nil`. Flag any function whose body doesn't use one of its parameters, or that returns a zero value regardless of input — that's either dead code or an unfinished implementation masquerading as done.
3. **Swallowed error context.** Prefer `fmt.Errorf("...: %w", err)` (wrapping) over `fmt.Errorf("...: %v", err)` when the caller might need `errors.Is`/`errors.As`, and never discard an `error` return with `_` unless it is genuinely unrecoverable/unused.
4. **Generic HTTP error responses that lose the real cause.** Handlers return the same `{"error": "failed to ..."}` for every failure mode. That's correct for not leaking internals to clients, but check that the actual `err` is at least logged server-side before being discarded — don't let errors disappear entirely.
5. **Missing nil/empty checks on pointers before dereference**, especially `*[]T` slice pointers returned from repositories (e.g. `*accounts` in [backend/tests/accounts_test.go](backend/tests/accounts_test.go) — dereferencing a nil pointer panics).
6. **No `context.Context` propagation.** Supabase/HTTP calls in repositories don't accept or forward a `context.Context`, so there's no way to cancel or time out a request. Flag new repository methods that skip taking a `ctx` when they perform I/O.
7. **Formatting/lint hygiene.** Watch for double blank lines, unused imports, and struct fields misaligned with `gofmt` (run `gofmt -l .` / `go vet ./...`) — this repo's CI only runs `go test ./...` and `go build`, so nothing currently catches these automatically.
8. **Business logic leaking into handlers.** A handler should only: bind/validate the request, call exactly one service method, and translate the result/error into a JSON response. If you see branching business logic (e.g. computing values, multiple sequential repository/service calls with conditionals between them) inside a `handlers/*.go` file, it belongs in `services/`.
9. **Auth/token handling duplicated per handler.** Reuse `HandlerProvider.ParseAuthHeader` (see [backend/handlers/auth.go](backend/handlers/auth.go)) rather than re-implementing header parsing in a new handler.

## Unit testing conventions

Tests live in `backend/tests/`, use Go's standard `testing` package (no assertion library is a direct dependency — `testify` is only present transitively, so stick to plain `if got != want { t.Fatalf(...) }` style unless the user asks to add testify explicitly).

Current tests (e.g. [backend/tests/accounts_test.go](backend/tests/accounts_test.go)) are **integration tests disguised as unit tests**: they instantiate a real `SupabaseProvider` and `t.Skip()` when `SUPABASE_URL`/`SUPABASE_KEY` aren't set. This means `go test ./...` in CI silently skips all real coverage. When asked to add or fix tests:

1. **Prefer true unit tests over skip-if-env-missing integration tests.** Where a layer's dependency is (or can be made to be) an interface, write a fake implementation in the test file and inject it — don't reach for a real Supabase client.
   ```go
   type fakeAccountsProvider struct{ /* fields to control return values */ }
   func (f *fakeAccountsProvider) GetUserAccounts(token string) (*[]models.BrokerageAccount, error) { ... }
   ```
2. **Use table-driven tests** for functions with multiple input/output cases — this is idiomatic Go and keeps handler/service tests readable:
   ```go
   cases := []struct{
       name    string
       input   string
       want    *models.BrokerageAccount
       wantErr bool
   }{...}
   for _, tc := range cases {
       t.Run(tc.name, func(t *testing.T) { ... })
   }
   ```
3. **Test handlers with `httptest` + `gin.CreateTestContext`**, not by starting the real server — construct a `*gin.Context` backed by `httptest.NewRecorder()`, inject a fake service, call the handler method directly, and assert on the recorded status code / JSON body.
4. **One behavior per test.** Split "success path" and "error path" into separate `Test...` functions or subtests rather than asserting multiple unrelated things in one test body.
5. **Never let a test depend on real external state** (a live Supabase project, network access, wall-clock time) unless it's explicitly an integration test — and if so, keep it in a separate `_integration_test.go` file or behind a build tag, not mixed into the default `go test ./...` path that CI runs.
6. **Match existing package/file conventions**: tests belong in `backend/tests` under `package tests`, named `Test<Thing>`, and new test files should be named `<subject>_test.go`.
7. When adding tests for a repository/service that currently only takes concrete types, first refactor it to accept an interface (per smell #1 above) — do this refactor and the tests together, since one enables the other.
