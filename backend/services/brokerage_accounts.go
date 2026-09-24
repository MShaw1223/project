package services

import (
	"context"
	"errors"
	"strings"
	"unicode/utf8"

	"github.com/miller/project/backend/models"
)

const MaxAccountNameLength = 15

var ErrInvalidInput = errors.New("invalid input")

// accountsRepo is the dependency AccountsService needs, so tests can inject a
// fake repository instead of a real Supabase-backed one.
type accountsRepo interface {
	GetUserAccounts(ctx context.Context, token string) ([]models.BrokerageAccount, error)
	GetAccountByID(ctx context.Context, token, accountID string) (*models.BrokerageAccount, error)
	CreateAccount(ctx context.Context, token, name string) (*models.BrokerageAccount, error)
	UpdateAccount(ctx context.Context, token, accountID, name string) (*models.BrokerageAccount, error)
	DeleteAccount(ctx context.Context, token, accountID string) error
}

type AccountsService struct {
	Repo accountsRepo
}

func (s *AccountsService) GetUserAccounts(ctx context.Context, token string) ([]models.BrokerageAccount, error) {
	return s.Repo.GetUserAccounts(ctx, token)
}

func (s *AccountsService) GetAccountByID(ctx context.Context, token, accountID string) (*models.BrokerageAccount, error) {
	return s.Repo.GetAccountByID(ctx, token, accountID)
}

func (s *AccountsService) CreateAccount(ctx context.Context, token, name string) (*models.BrokerageAccount, error) {
	name, err := validateAccountName(name)
	if err != nil {
		return nil, err
	}
	return s.Repo.CreateAccount(ctx, token, name)
}

func (s *AccountsService) UpdateAccount(ctx context.Context, token, accountID, name string) (*models.BrokerageAccount, error) {
	name, err := validateAccountName(name)
	if err != nil {
		return nil, err
	}
	return s.Repo.UpdateAccount(ctx, token, accountID, name)
}

func (s *AccountsService) DeleteAccount(ctx context.Context, token, accountID string) error {
	return s.Repo.DeleteAccount(ctx, token, accountID)
}

func validateAccountName(name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" || utf8.RuneCountInString(name) > MaxAccountNameLength {
		return "", ErrInvalidInput
	}
	return name, nil
}
