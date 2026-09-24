package repositories

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/miller/project/backend/models"
	"github.com/supabase-community/supabase-go"
)

var (
	ErrUnauthenticated = errors.New("user not authenticated")
	ErrNotFound        = errors.New("not found")
	// ErrConflict means a unique constraint rejected the write, eg a username someone else has.
	ErrConflict = errors.New("conflict")
)

type AccountsRepository struct {
	Provider supabaseClientProvider
}

// userClient returns a Supabase client whose PostgREST calls run as the token's user (so row level
// security applies) along with that user's id.
func (r *AccountsRepository) userClient(ctx context.Context, token string) (*supabase.Client, uuid.UUID, error) {
	return userScopedClient(ctx, r.Provider, token)
}

func (r *AccountsRepository) GetUserAccounts(ctx context.Context, token string) ([]models.BrokerageAccount, error) {
	client, userID, err := r.userClient(ctx, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("brokerage_account").Select("*", "exact", false).Eq("user_id", userID.String()).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user accounts: %w", err)
	}

	var accounts []models.BrokerageAccount
	if err := json.Unmarshal(response, &accounts); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}

	return accounts, nil
}

func (r *AccountsRepository) GetAccountByID(ctx context.Context, token, accountID string) (*models.BrokerageAccount, error) {
	client, userID, err := r.userClient(ctx, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("brokerage_account").Select("*", "exact", false).
		Eq("id", accountID).Eq("user_id", userID.String()).Single().Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch account %q: %w", accountID, err)
	}

	var account models.BrokerageAccount
	if err := json.Unmarshal(response, &account); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}

	return &account, nil
}

func (r *AccountsRepository) CreateAccount(ctx context.Context, token, name string) (*models.BrokerageAccount, error) {
	client, userID, err := r.userClient(ctx, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("brokerage_account").
		Insert(map[string]string{"name": name, "user_id": userID.String()}, false, "", "representation", "").
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create account: %w", err)
	}
	return firstAccount(response)
}

func (r *AccountsRepository) UpdateAccount(ctx context.Context, token, accountID, name string) (*models.BrokerageAccount, error) {
	client, userID, err := r.userClient(ctx, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("brokerage_account").
		Update(map[string]string{"name": name}, "representation", "").
		Eq("id", accountID).
		Eq("user_id", userID.String()).
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to update account: %w", err)
	}
	return firstAccount(response)
}

func (r *AccountsRepository) DeleteAccount(ctx context.Context, token, accountID string) error {
	client, userID, err := r.userClient(ctx, token)
	if err != nil {
		return err
	}

	response, _, err := client.From("brokerage_account").
		Delete("representation", "").
		Eq("id", accountID).
		Eq("user_id", userID.String()).
		Execute()
	if err != nil {
		return fmt.Errorf("failed to delete account: %w", err)
	}
	_, err = firstAccount(response)
	return err
}

// firstAccount decodes a PostgREST "representation" response, ErrNotFound when no row matched.
func firstAccount(response []byte) (*models.BrokerageAccount, error) {
	var accounts []models.BrokerageAccount
	if err := json.Unmarshal(response, &accounts); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	if len(accounts) == 0 {
		return nil, ErrNotFound
	}
	return &accounts[0], nil
}
