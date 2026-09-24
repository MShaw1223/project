package tests

import (
	"context"
	"errors"
	"testing"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/services"
)

// fakeAccountsRepo returns canned results and records what the service passed down.
type fakeAccountsRepo struct {
	accounts []models.BrokerageAccount
	account  *models.BrokerageAccount
	err      error

	gotToken, gotID, gotName string
	calls                    int
}

func (f *fakeAccountsRepo) CreateAccount(ctx context.Context, token, name string) (*models.BrokerageAccount, error) {
	f.calls++
	f.gotToken, f.gotName = token, name
	return f.account, f.err
}

func (f *fakeAccountsRepo) UpdateAccount(ctx context.Context, token, accountID, name string) (*models.BrokerageAccount, error) {
	f.calls++
	f.gotToken, f.gotID, f.gotName = token, accountID, name
	return f.account, f.err
}

func (f *fakeAccountsRepo) DeleteAccount(ctx context.Context, token, accountID string) error {
	f.calls++
	f.gotToken, f.gotID = token, accountID
	return f.err
}

func (f *fakeAccountsRepo) GetUserAccounts(ctx context.Context, token string) ([]models.BrokerageAccount, error) {
	return f.accounts, f.err
}

func (f *fakeAccountsRepo) GetAccountByID(ctx context.Context, token, accountID string) (*models.BrokerageAccount, error) {
	return f.account, f.err
}

func TestAccountsServiceGetUserAccounts(t *testing.T) {
	cases := []struct {
		name    string
		repo    *fakeAccountsRepo
		wantLen int
		wantErr bool
	}{
		{
			name:    "returns accounts from the repository",
			repo:    &fakeAccountsRepo{accounts: []models.BrokerageAccount{{Name: "Brokerage 1"}, {Name: "Brokerage 2"}}},
			wantLen: 2,
		},
		{
			name:    "propagates a repository error",
			repo:    &fakeAccountsRepo{err: errors.New("repository unavailable")},
			wantErr: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			svc := &services.AccountsService{Repo: tc.repo}
			accounts, err := svc.GetUserAccounts(context.Background(), "test-token")

			if tc.wantErr {
				if err == nil {
					t.Fatal("expected an error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if len(accounts) != tc.wantLen {
				t.Fatalf("expected %d accounts, got %d", tc.wantLen, len(accounts))
			}
		})
	}
}

func TestAccountsServiceGetAccountByID(t *testing.T) {
	cases := []struct {
		name    string
		repo    *fakeAccountsRepo
		wantNil bool
		wantErr bool
	}{
		{
			name: "returns the account from the repository",
			repo: &fakeAccountsRepo{account: &models.BrokerageAccount{Name: "Brokerage 1"}},
		},
		{
			name:    "propagates a repository error",
			repo:    &fakeAccountsRepo{err: errors.New("account not found")},
			wantErr: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			svc := &services.AccountsService{Repo: tc.repo}
			account, err := svc.GetAccountByID(context.Background(), "test-token", "test-account-id")

			if tc.wantErr {
				if err == nil {
					t.Fatal("expected an error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if account == nil {
				t.Fatal("expected an account, got nil")
			}
		})
	}
}
