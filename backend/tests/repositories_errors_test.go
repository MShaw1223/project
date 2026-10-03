package tests

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
)

// repositoryCall is one repository method, with the Supabase request it makes once the caller's token
// has been resolved to a user (empty for the methods that only talk to the auth API).
type repositoryCall struct {
	name         string
	method, path string
	run          func(ctx context.Context, token string) error
}

// userScopedCalls are the repository methods that act as the token's user through PostgREST.
func userScopedCalls() []repositoryCall {
	accounts, trades, pairs, profile := newAccountsRepository(), newTradesRepository(), newCurrencyPairsRepository(), newProfileRepository()
	return []repositoryCall{
		{"accounts.GetUserAccounts", http.MethodGet, accountsTable, func(ctx context.Context, token string) error {
			_, err := accounts.GetUserAccounts(ctx, token)
			return err
		}},
		{"accounts.GetAccountByID", http.MethodGet, accountsTable, func(ctx context.Context, token string) error {
			_, err := accounts.GetAccountByID(ctx, token, validID)
			return err
		}},
		{"accounts.CreateAccount", http.MethodPost, accountsTable, func(ctx context.Context, token string) error {
			_, err := accounts.CreateAccount(ctx, token, "main")
			return err
		}},
		{"accounts.UpdateAccount", http.MethodPatch, accountsTable, func(ctx context.Context, token string) error {
			_, err := accounts.UpdateAccount(ctx, token, validID, "main")
			return err
		}},
		{"accounts.DeleteAccount", http.MethodDelete, accountsTable, func(ctx context.Context, token string) error {
			return accounts.DeleteAccount(ctx, token, validID)
		}},
		{"trades.GetUserTrades", http.MethodGet, tradesTable, func(ctx context.Context, token string) error {
			_, err := trades.GetUserTrades(ctx, token, validID)
			return err
		}},
		{"trades.CreateTrade", http.MethodPost, tradesTable, func(ctx context.Context, token string) error {
			_, err := trades.CreateTrade(ctx, token, models.TradeRecord{AccountID: validID})
			return err
		}},
		{"trades.DeleteTrade", http.MethodDelete, tradesTable, func(ctx context.Context, token string) error {
			return trades.DeleteTrade(ctx, token, validID)
		}},
		{"pairs.GetUserPairs", http.MethodGet, pairsTable, func(ctx context.Context, token string) error {
			_, err := pairs.GetUserPairs(ctx, token)
			return err
		}},
		{"pairs.CreatePair", http.MethodPost, pairsTable, func(ctx context.Context, token string) error {
			_, err := pairs.CreatePair(ctx, token, "EURUSD")
			return err
		}},
		{"pairs.DeletePair", http.MethodDelete, pairsTable, func(ctx context.Context, token string) error {
			return pairs.DeletePair(ctx, token, validID)
		}},
		{"profile.GetProfile", http.MethodGet, profileTable, func(ctx context.Context, token string) error {
			_, err := profile.GetProfile(ctx, token)
			return err
		}},
		{"profile.UpdateUsername", http.MethodPatch, profileTable, func(ctx context.Context, token string) error {
			_, err := profile.UpdateUsername(ctx, token, "trader")
			return err
		}},
	}
}

// authAPICalls are the repository methods that use the Supabase client for the auth API only.
func authAPICalls() []repositoryCall {
	auth, profile := newAuthRepository(), newProfileRepository()
	return []repositoryCall{
		{name: "auth.CreateSession", run: func(ctx context.Context, token string) error {
			_, err := auth.CreateSession(ctx, "trader@example.com", "secret123")
			return err
		}},
		{name: "auth.Signup", run: func(ctx context.Context, token string) error {
			_, err := auth.Signup(ctx, "trader@example.com", "secret123")
			return err
		}},
		{name: "auth.GetUser", run: func(ctx context.Context, token string) error {
			_, err := auth.GetUser(ctx, token)
			return err
		}},
		{name: "profile.UpdatePassword", run: func(ctx context.Context, token string) error {
			return profile.UpdatePassword(ctx, token, "new-secret")
		}},
	}
}

func TestRepositoriesRejectARefusedTokenBeforeTouchingTheDatabase(t *testing.T) {
	for _, call := range userScopedCalls() {
		t.Run(call.name, func(t *testing.T) {
			supabase := newFakeSupabase(t)
			supabase.reply(http.MethodGet, "/auth/v1/user", http.StatusUnauthorized, `{"msg":"invalid JWT"}`)

			if err := call.run(context.Background(), "expired-token"); !errors.Is(err, repositories.ErrUnauthenticated) {
				t.Fatalf("expected ErrUnauthenticated, got %v", err)
			}
			if n := supabase.count(call.method, call.path); n != 0 {
				t.Fatalf("expected no database request for a refused token, got %d", n)
			}
		})
	}
}

func TestRepositoriesReportADatabaseFailure(t *testing.T) {
	for _, call := range userScopedCalls() {
		t.Run(call.name, func(t *testing.T) {
			supabase := newFakeSupabase(t)
			supabase.reply(call.method, call.path, http.StatusInternalServerError, `{"code":"XX000","message":"internal error"}`)

			err := call.run(context.Background(), "user-token")
			if err == nil {
				t.Fatal("a failed database request must be reported as a failure")
			}
			for _, sentinel := range []error{repositories.ErrUnauthenticated, repositories.ErrNotFound, repositories.ErrConflict} {
				if errors.Is(err, sentinel) {
					t.Fatalf("expected a plain failure, got %v", err)
				}
			}
		})
	}
}

func TestRepositoriesReportAnUnreadableDatabaseResponse(t *testing.T) {
	for _, call := range userScopedCalls() {
		t.Run(call.name, func(t *testing.T) {
			supabase := newFakeSupabase(t)
			supabase.reply(call.method, call.path, http.StatusOK, `not json`)

			err := call.run(context.Background(), "user-token")
			if err == nil || errors.Is(err, repositories.ErrNotFound) {
				t.Fatalf("expected a plain failure, got %v", err)
			}
		})
	}
}

func TestRepositoriesStopOnACancelledContext(t *testing.T) {
	for _, call := range append(userScopedCalls(), authAPICalls()...) {
		t.Run(call.name, func(t *testing.T) {
			supabase := newFakeSupabase(t)
			ctx, cancel := context.WithCancel(context.Background())
			cancel()

			if err := call.run(ctx, "user-token"); !errors.Is(err, context.Canceled) {
				t.Fatalf("expected context.Canceled, got %v", err)
			}
			if n := supabase.total(); n != 0 {
				t.Fatalf("expected no requests to Supabase, got %d", n)
			}
		})
	}
}

func TestRepositoriesRequireSupabaseConfig(t *testing.T) {
	for _, call := range append(userScopedCalls(), authAPICalls()...) {
		t.Run(call.name, func(t *testing.T) {
			t.Setenv("SUPABASE_URL", "")
			t.Setenv("SUPABASE_KEY", "")

			err := call.run(context.Background(), "user-token")
			if err == nil || errors.Is(err, repositories.ErrUnauthenticated) {
				t.Fatalf("expected a configuration failure, got %v", err)
			}
		})
	}
}
