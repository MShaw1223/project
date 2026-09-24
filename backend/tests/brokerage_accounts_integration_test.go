package tests

import (
	"context"
	"os"
	"testing"

	"github.com/miller/project/backend/repositories"
)

func TestGetUserAccountsIntegration(t *testing.T) {
	if os.Getenv("SUPABASE_URL") == "" || os.Getenv("SUPABASE_KEY") == "" {
		t.Skip("skipping accounts integration test; SUPABASE_URL/SUPABASE_KEY not set")
	}
	token := os.Getenv("SUPABASE_TEST_TOKEN")
	if token == "" {
		t.Skip("skipping accounts integration test; SUPABASE_TEST_TOKEN (a valid user access token with at least one account) not set")
	}

	baseProvider := &repositories.SupabaseProvider{}
	repo := &repositories.AccountsRepository{Provider: baseProvider}
	accounts, err := repo.GetUserAccounts(context.Background(), token)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(accounts) == 0 {
		t.Fatalf("expected accounts, got empty accounts")
	}
}

func TestGetAccountByIDIntegration(t *testing.T) {
	if os.Getenv("SUPABASE_URL") == "" || os.Getenv("SUPABASE_KEY") == "" {
		t.Skip("skipping accounts integration test; SUPABASE_URL/SUPABASE_KEY not set")
	}
	token, accountID := os.Getenv("SUPABASE_TEST_TOKEN"), os.Getenv("SUPABASE_TEST_ACCOUNT_ID")
	if token == "" || accountID == "" {
		t.Skip("skipping accounts integration test; SUPABASE_TEST_TOKEN and SUPABASE_TEST_ACCOUNT_ID (an account that user owns) not set")
	}

	baseProvider := &repositories.SupabaseProvider{}
	repo := &repositories.AccountsRepository{Provider: baseProvider}
	account, err := repo.GetAccountByID(context.Background(), token, accountID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if account == nil {
		t.Fatalf("expected an account, got nil")
	}
}
