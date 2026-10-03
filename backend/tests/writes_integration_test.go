//go:build integration

package tests

import (
	"context"
	"crypto/rand"
	"errors"
	"os"
	"testing"

	"github.com/google/uuid"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
)

// These tests write to the Supabase project as the test user. Each one creates its own rows under a
// random name and deletes them again (also when it fails), so they leave the user's data as it was and
// don't depend on each other. They check what the unit tests' fake can only assume: the row level
// security, constraints and triggers of the migrations, and the way Supabase words its refusals.

// randomLetters returns n random capital letters, for names that won't collide with existing rows.
func randomLetters(t *testing.T, n int) string {
	t.Helper()
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		t.Fatalf("failed to generate a random name: %v", err)
	}
	for i := range b {
		b[i] = 'A' + b[i]%26
	}
	return string(b)
}

// temporaryAccount creates a brokerage account that's deleted when the test ends, taking its trades
// with it (trade.account_id cascades).
func temporaryAccount(t *testing.T, repo *repositories.AccountsRepository, token string) *models.BrokerageAccount {
	t.Helper()
	account, err := repo.CreateAccount(context.Background(), token, "it-"+randomLetters(t, 8))
	if err != nil {
		t.Fatalf("failed to create a temporary account: %v", err)
	}
	t.Cleanup(func() {
		if err := repo.DeleteAccount(context.Background(), token, account.ID.String()); err != nil && !errors.Is(err, repositories.ErrNotFound) {
			t.Errorf("failed to delete temporary account %s: %v", account.ID, err)
		}
	})
	return account
}

func floatPtr(v float64) *float64 { return &v }

func TestAccountLifecycleIntegration(t *testing.T) {
	token := integrationToken(t)
	ctx := context.Background()
	repo := &repositories.AccountsRepository{Provider: &repositories.SupabaseProvider{}}

	account := temporaryAccount(t, repo, token)
	if account.ID == uuid.Nil || account.UserID == uuid.Nil || account.CreatedAt.IsZero() {
		t.Fatalf("expected the database to fill in the id, owner and creation time, got %+v", account)
	}

	renamed, err := repo.UpdateAccount(ctx, token, account.ID.String(), "it-renamed")
	if err != nil {
		t.Fatalf("expected the rename to succeed, got %v", err)
	}
	if renamed.ID != account.ID || renamed.Name != "it-renamed" {
		t.Fatalf("expected the same account renamed, got %+v", renamed)
	}
	fetched, err := repo.GetAccountByID(ctx, token, account.ID.String())
	if err != nil || fetched.Name != "it-renamed" {
		t.Fatalf("expected the rename to be stored, got %+v (err %v)", fetched, err)
	}

	if err := repo.DeleteAccount(ctx, token, account.ID.String()); err != nil {
		t.Fatalf("expected the delete to succeed, got %v", err)
	}
	if err := repo.DeleteAccount(ctx, token, account.ID.String()); !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("deleting a deleted account: expected ErrNotFound, got %v", err)
	}
	if _, err := repo.UpdateAccount(ctx, token, account.ID.String(), "it-gone"); !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("renaming a deleted account: expected ErrNotFound, got %v", err)
	}
	if _, err := repo.GetAccountByID(ctx, token, account.ID.String()); err == nil {
		t.Fatal("expected fetching a deleted account to fail")
	}
}

func TestDatabaseRejectsAnUntrimmedAccountNameIntegration(t *testing.T) {
	token := integrationToken(t)
	repo := &repositories.AccountsRepository{Provider: &repositories.SupabaseProvider{}}

	account, err := repo.CreateAccount(context.Background(), token, " it-padded ")
	if err == nil {
		_ = repo.DeleteAccount(context.Background(), token, account.ID.String())
		t.Fatal("expected brokerage_account_name_trimmed to reject a padded name")
	}
}

func TestTradeResultIsDerivedByTheDatabaseIntegration(t *testing.T) {
	token := integrationToken(t)
	ctx := context.Background()
	provider := &repositories.SupabaseProvider{}
	account := temporaryAccount(t, &repositories.AccountsRepository{Provider: provider}, token)
	repo := &repositories.TradesRepository{Provider: provider}

	cases := []struct {
		name          string
		record        models.TradeRecord
		wantOutcome   string
		wantRMultiple *float64
	}{
		{
			"long winner with a stop",
			models.TradeRecord{CurrencyPair: "EURUSD", Direction: "long", EntryPrice: 1.10, ExitPrice: 1.12, StopLoss: floatPtr(1.09), Notes: "integration test"},
			"win", floatPtr(2),
		},
		{
			"short loser with a stop",
			models.TradeRecord{CurrencyPair: "EURUSD", Direction: "short", EntryPrice: 1.20, ExitPrice: 1.21, StopLoss: floatPtr(1.22)},
			"loss", floatPtr(-0.5),
		},
		{
			"breakeven without a stop",
			models.TradeRecord{CurrencyPair: "EURUSD", Direction: "long", EntryPrice: 1.10, ExitPrice: 1.10},
			"breakeven", nil,
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			tc.record.AccountID = account.ID.String()
			trade, err := repo.CreateTrade(ctx, token, tc.record)
			if err != nil {
				t.Fatalf("expected the trade to be stored, got %v", err)
			}
			if trade.AccountID != account.ID || trade.UserID != account.UserID || trade.Direction != tc.record.Direction {
				t.Fatalf("expected the trade on the account, got %+v", trade)
			}
			if trade.Outcome != tc.wantOutcome {
				t.Errorf("expected outcome %q, got %q", tc.wantOutcome, trade.Outcome)
			}
			switch {
			case tc.wantRMultiple == nil && trade.RMultiple != nil:
				t.Errorf("expected no R multiple without a stop, got %v", *trade.RMultiple)
			case tc.wantRMultiple != nil && (trade.RMultiple == nil || *trade.RMultiple != *tc.wantRMultiple):
				t.Errorf("expected R multiple %v, got %v", *tc.wantRMultiple, trade.RMultiple)
			}
		})
	}

	trades, err := repo.GetUserTrades(ctx, token, account.ID.String())
	if err != nil || len(trades) != len(cases) {
		t.Fatalf("expected the account's %d trades, got %d (err %v)", len(cases), len(trades), err)
	}
	for i := 1; i < len(trades); i++ {
		if trades[i].CreatedAt.After(trades[i-1].CreatedAt) {
			t.Fatalf("expected newest first, got %v before %v", trades[i-1].CreatedAt, trades[i].CreatedAt)
		}
	}

	if err := repo.DeleteTrade(ctx, token, trades[0].ID.String()); err != nil {
		t.Fatalf("expected the delete to succeed, got %v", err)
	}
	if err := repo.DeleteTrade(ctx, token, trades[0].ID.String()); !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("deleting a deleted trade: expected ErrNotFound, got %v", err)
	}
}

// The service validates these before the repository is reached; calling the repository directly checks
// that the database refuses them too, since users can write to Supabase with their own token.
func TestDatabaseRejectsInvalidTradesIntegration(t *testing.T) {
	token := integrationToken(t)
	provider := &repositories.SupabaseProvider{}
	account := temporaryAccount(t, &repositories.AccountsRepository{Provider: provider}, token)
	repo := &repositories.TradesRepository{Provider: provider}

	cases := []struct {
		name   string
		record models.TradeRecord
	}{
		{"stop on the winning side", models.TradeRecord{AccountID: account.ID.String(), CurrencyPair: "EURUSD", Direction: "long", EntryPrice: 1.10, ExitPrice: 1.12, StopLoss: floatPtr(1.11)}},
		{"unknown direction", models.TradeRecord{AccountID: account.ID.String(), CurrencyPair: "EURUSD", Direction: "sideways", EntryPrice: 1.10, ExitPrice: 1.12}},
		{"malformed pair", models.TradeRecord{AccountID: account.ID.String(), CurrencyPair: "eur/usd", Direction: "long", EntryPrice: 1.10, ExitPrice: 1.12}},
		{"negative entry price", models.TradeRecord{AccountID: account.ID.String(), CurrencyPair: "EURUSD", Direction: "long", EntryPrice: -1, ExitPrice: 1.12}},
		{"an account that isn't the caller's", models.TradeRecord{AccountID: uuid.NewString(), CurrencyPair: "EURUSD", Direction: "long", EntryPrice: 1.10, ExitPrice: 1.12}},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if _, err := repo.CreateTrade(context.Background(), token, tc.record); err == nil {
				t.Fatal("expected the database to refuse the trade")
			}
		})
	}

	trades, err := repo.GetUserTrades(context.Background(), token, account.ID.String())
	if err != nil || len(trades) != 0 {
		t.Fatalf("expected none of the refused trades to be stored, got %d (err %v)", len(trades), err)
	}
}

func TestCurrencyPairLifecycleIntegration(t *testing.T) {
	token := integrationToken(t)
	ctx := context.Background()
	repo := &repositories.CurrencyPairsRepository{Provider: &repositories.SupabaseProvider{}}
	symbol := "IT" + randomLetters(t, 8)

	pair, err := repo.CreatePair(ctx, token, symbol)
	if err != nil {
		t.Fatalf("expected the pair to be stored, got %v", err)
	}
	t.Cleanup(func() {
		if err := repo.DeletePair(context.Background(), token, pair.ID.String()); err != nil && !errors.Is(err, repositories.ErrNotFound) {
			t.Errorf("failed to delete temporary pair %s: %v", pair.ID, err)
		}
	})
	if pair.Symbol != symbol || pair.ID == uuid.Nil {
		t.Fatalf("expected the stored pair, got %+v", pair)
	}

	if _, err := repo.CreatePair(ctx, token, symbol); err == nil {
		t.Fatal("expected a symbol the user already has to be refused")
	}
	if _, err := repo.CreatePair(ctx, token, "it/bad"); err == nil {
		t.Fatal("expected currency_pair_symbol_format to refuse a malformed symbol")
	}

	pairs, err := repo.GetUserPairs(ctx, token)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	found := 0
	for _, p := range pairs {
		if p.Symbol == symbol {
			found++
		}
	}
	if found != 1 {
		t.Fatalf("expected %s once in the user's pairs, got %d", symbol, found)
	}

	if err := repo.DeletePair(ctx, token, pair.ID.String()); err != nil {
		t.Fatalf("expected the delete to succeed, got %v", err)
	}
	if err := repo.DeletePair(ctx, token, pair.ID.String()); !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("deleting a deleted pair: expected ErrNotFound, got %v", err)
	}
}

func TestGetProfileIntegration(t *testing.T) {
	token := integrationToken(t)
	repo := &repositories.ProfileRepository{Provider: &repositories.SupabaseProvider{}}

	// every user gets a profile row on signup (handle_new_user), with or without a username
	if _, err := repo.GetProfile(context.Background(), token); err != nil {
		t.Fatalf("expected the test user's profile, got %v", err)
	}
}

func TestRefusedTokenIsUnauthenticatedIntegration(t *testing.T) {
	requireEnv(t, "SUPABASE_URL", "SUPABASE_KEY")
	repo := &repositories.AccountsRepository{Provider: &repositories.SupabaseProvider{}}

	if _, err := repo.GetUserAccounts(context.Background(), "not-a-token"); !errors.Is(err, repositories.ErrUnauthenticated) {
		t.Fatalf("expected ErrUnauthenticated, got %v", err)
	}
}

// Supabase's refusal is recognised by its wording (repositories.IsInvalidCredentialsError), which
// only the real service can confirm.
func TestWrongPasswordIsInvalidCredentialsIntegration(t *testing.T) {
	requireEnv(t, "SUPABASE_URL", "SUPABASE_KEY", "SUPABASE_TEST_EMAIL")
	repo := &repositories.AuthRepository{Provider: &repositories.SupabaseProvider{}}

	_, err := repo.CreateSession(context.Background(), os.Getenv("SUPABASE_TEST_EMAIL"), "wrong-"+randomLetters(t, 12))
	if !errors.Is(err, repositories.ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials, got %v", err)
	}
}
