//go:build integration

package tests

import (
	"context"
	"testing"

	"github.com/miller/project/backend/repositories"
)

func TestGetUserAccountsIntegration(t *testing.T) {
	token := integrationToken(t)

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
	token := integrationToken(t)

	baseProvider := &repositories.SupabaseProvider{}
	repo := &repositories.AccountsRepository{Provider: baseProvider}
	accounts, err := repo.GetUserAccounts(context.Background(), token)
	if err != nil || len(accounts) == 0 {
		t.Fatalf("expected the test user's accounts, got %d (err %v)", len(accounts), err)
	}

	account, err := repo.GetAccountByID(context.Background(), token, accounts[0].ID.String())
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if account == nil || account.ID != accounts[0].ID {
		t.Fatalf("expected account %s, got %+v", accounts[0].ID, account)
	}
}
