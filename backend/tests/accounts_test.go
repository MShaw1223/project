package tests

import (
	"os"
	"testing"

	"github.com/miller/project/backend/repositories"
)

func TestGetUserAccounts(t *testing.T) {
	if os.Getenv("SUPABASE_URL") == "" || os.Getenv("SUPABASE_KEY") == "" {
		t.Skip("skipping accounts integration test; SUPABASE_URL/SUPABASE_KEY not set")
	}

	baseProvider := &repositories.SupabaseProvider{}
	repo := &repositories.AccountsRepository{Provider: baseProvider}
	accounts, err := repo.GetUserAccounts("test-auth-token")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(*accounts) == 0 {
		t.Fatalf("expected accounts, got empty accounts")
	}
}

func TestGetAccountByID(t *testing.T) {
	if os.Getenv("SUPABASE_URL") == "" || os.Getenv("SUPABASE_KEY") == "" {
		t.Skip("skipping accounts integration test; SUPABASE_URL/SUPABASE_KEY not set")
	}

	baseProvider := &repositories.SupabaseProvider{}
	repo := &repositories.AccountsRepository{Provider: baseProvider}

	accountID := "test-account-id"
	account, err := repo.GetAccountByID("test-auth-token", accountID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if account != nil {
		t.Fatalf("expected nil account, got %v", account)
	}
}
