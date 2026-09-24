---
name: frontend-code-quality
description: Use when writing, reviewing, or refactoring code under frontend/ (Next.js pages, React components, hooks, utils) — covers code smells/semantics review and unit testing conventions for this project's Next.js (pages router) + TypeScript + react-query frontend. Trigger on requests like "review this component", "add tests for this page", "is this React code clean", or any change under frontend/.
---

# Frontend code quality (Next.js pages router / React / TypeScript)

Stack: Next.js (pages router, not app router), TypeScript, `react-query` for data fetching/mutations, `react-hook-form` + `zod` for forms (available but not always used), Tailwind + shadcn/radix components under `frontend/src/components/ui/`. Vitest + jsdom + React Testing Library are configured (`npm test`, [frontend/vitest.config.ts](frontend/vitest.config.ts), tests colocated as `*.test.ts(x)`), and CI runs a `frontend:test` job next to lint and build.

## Code semantics & smells to check for

1. **`alert()` used as error/state UI.** Components like [frontend/src/components/accountMngmnt/CreateAccount.tsx](frontend/src/components/accountMngmnt/CreateAccount.tsx) use `alert("Failed to send off new account")` for both validation and network errors. Flag new `alert(...)` calls used for anything beyond a quick throwaway — prefer rendering inline error state (a piece of `useState`, or react-hook-form's field errors) so errors are testable and don't block the JS thread.
2. **Data fetching/mutation logic inlined directly in page/component bodies.** `fetch("/api/accountManagement", {...})` is written straight inside a `useMutation` callback in the component. Prefer extracting fetch calls into a small function in `frontend/src/lib/` or `frontend/src/utils/` (e.g. `createAccount(data): Promise<Account>`) so the component only wires up UI + react-query, and the fetch logic can be unit tested / mocked independently of rendering.
3. **Non-null assertions and unsafe casts on `FormData`.** e.g. `data.get("accountName")! as string` — the `!` suppresses the real possibility that the field is missing or a `File`, not a `string`. Prefer checking for `null`/type explicitly and surfacing a validation error rather than asserting.
4. **`useEffect` doing async work with sparse dependency arrays.** Check that every value read inside a `useEffect` (e.g. `router.query`) is actually in the dependency array, and that state updates after an `await` account for the component having unmounted (stale-closure / "update on unmounted component" smells) or being re-triggered mid-flight.
5. **Duplicate type-shape definitions.** Prop types like `HandlerProps`, `MenuProps`, `DropdownProps` in [frontend/src/utils/helpful.ts](frontend/src/utils/helpful.ts) should live near where they're consumed or in a shared `types.ts`, not accumulate ad hoc in a `helpful.ts`/`misc`-style grab-bag file — flag new types added to catch-all utility files when a more specific home exists.
6. **Business/validation logic duplicated between component and (missing) schema.** `zod` is a dependency and [frontend/src/utils/schema.ts](frontend/src/utils/schema.ts) exists, but some forms hand-roll validation (e.g. manual `!==`/empty checks in `CreateAccount.tsx`) instead of using a `zod` schema + `react-hook-form`. When touching a form, prefer moving validation into a shared schema so it's declarative and testable in isolation.
7. **Magic strings for routes/query params/API paths.** Raw string literals like `"/api/accountManagement"` or query key `"li"` repeated across files should be extracted to a constant if used in more than one place, so a rename doesn't require a grep-and-replace.
8. **Missing loading/empty/error branches.** Check that a component handles all of react-query's states it actually needs (`isLoading`, `isError`, empty-array data) rather than only the happy path — this repo's `CreateAccount.tsx` only branches on `isLoading`, silently rendering nothing useful on error beyond the `alert`.
9. **`any` or implicit `any` creeping into TypeScript.** This project has `strict`-friendly tooling available; treat a new `any` (explicit or via an untyped third-party callback) as something to flag and replace with a real type or `unknown` + narrowing.

## Testing policy (set by the user)

Frontend tests are **lower priority than backend tests**: add them for *critical* logic only, not for every component. Critical means: auth/session handling (`withSession`, login/signup wrappers), the `lib/*` API wrappers (URL, method, body, error surfacing), validation schemas, and anything that could leak credentials or bypass the session. Purely presentational components and layout need no tests. Existing examples: [schema.test.ts](frontend/src/utils/schema.test.ts), [accounts.test.ts](frontend/src/lib/accounts.test.ts), [withSession.test.tsx](frontend/src/components/withSession.test.tsx).

Setup gotchas found the hard way (Node 20): use `vitest@^3` (v5 needs a newer `@types/node`) and `jsdom@^26` (v30 fails with `ERR_REQUIRE_ESM`). `@testing-library/jest-dom` is not installed, so assert with plain matchers (`container.innerHTML`, `screen.findByText`) rather than `toBeInTheDocument()`.

## Unit testing conventions

The runner is already installed. When asked to add tests (or when adding significant new logic that should have coverage):

1. **Vitest + React Testing Library are already set up** (see the policy above). Only install extra packages if a test truly needs them. Tests are colocated as `*.test.ts(x)` next to the source, and `vitest.config.ts` uses `environment: "jsdom"` with the `@` alias.
2. **Unit-test pure logic separately from components.** Anything in `frontend/src/utils/` or `frontend/src/lib/` (e.g. [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts)) should get plain function-level tests with no rendering involved — these are the cheapest, most valuable tests to add first.
3. **Test components through user-visible behavior, not implementation.** Use `@testing-library/react`'s `render` + `screen.getByRole`/`getByLabelText` and `@testing-library/user-event` to simulate typing/clicking, and assert on rendered output — not on internal state or by reaching into component internals.
4. **Mock `fetch` and `react-query` at the boundary.** When a component calls a fetch-wrapper function (per smell #2 above), mock that wrapper function in the component test rather than mocking global `fetch` directly — this stays valid even if the fetch implementation changes. For hooks-level tests of the fetch wrapper itself, mock global `fetch`/`msw`.
5. **Test both the success and validation/error paths** for forms — e.g. for `CreateAccount`, one test submits matching account names and asserts the mutation fires with the right payload; another submits mismatched/empty names and asserts the mutation does *not* fire and an error is shown.
6. **Avoid snapshot tests as the primary assertion.** Prefer explicit `expect(screen.getByText(...)).toBeInTheDocument()`-style assertions over large snapshots, which tend to rot silently in a codebase with no existing test culture.
7. **CI already runs them** via the `frontend:test` job in [.gitlab-ci.yml](.gitlab-ci.yml); keep `npm test` green.
