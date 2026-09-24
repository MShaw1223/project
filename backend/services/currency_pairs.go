package services

import (
	"context"

	"github.com/google/uuid"
	"github.com/miller/project/backend/models"
)

// currencyPairsRepo is the dependency CurrencyPairsService needs, so tests can inject a fake
// repository instead of a real Supabase-backed one.
type currencyPairsRepo interface {
	GetUserPairs(ctx context.Context, token string) ([]models.CurrencyPair, error)
	CreatePair(ctx context.Context, token, symbol string) (*models.CurrencyPair, error)
	DeletePair(ctx context.Context, token, pairID string) error
}

type CurrencyPairsService struct {
	Repo currencyPairsRepo
}

func (s *CurrencyPairsService) GetUserPairs(ctx context.Context, token string) ([]models.CurrencyPair, error) {
	return s.Repo.GetUserPairs(ctx, token)
}

func (s *CurrencyPairsService) CreatePair(ctx context.Context, token, symbol string) (*models.CurrencyPair, error) {
	symbol, err := validatePairSymbol(symbol)
	if err != nil {
		return nil, err
	}
	return s.Repo.CreatePair(ctx, token, symbol)
}

func (s *CurrencyPairsService) DeletePair(ctx context.Context, token, pairID string) error {
	if _, err := uuid.Parse(pairID); err != nil {
		return ErrInvalidInput
	}
	return s.Repo.DeletePair(ctx, token, pairID)
}
