package repositories

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/miller/project/backend/models"
)

type CurrencyPairsRepository struct {
	Provider supabaseClientProvider
}

func (r *CurrencyPairsRepository) GetUserPairs(ctx context.Context, token string) ([]models.CurrencyPair, error) {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("currency_pair").Select("*", "exact", false).
		Eq("user_id", userID.String()).
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch currency pairs: %w", err)
	}

	var pairs []models.CurrencyPair
	if err := json.Unmarshal(response, &pairs); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	return pairs, nil
}

func (r *CurrencyPairsRepository) CreatePair(ctx context.Context, token, symbol string) (*models.CurrencyPair, error) {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("currency_pair").
		Insert(map[string]string{"symbol": symbol, "user_id": userID.String()}, false, "", "representation", "").
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create currency pair: %w", err)
	}
	return firstPair(response)
}

func (r *CurrencyPairsRepository) DeletePair(ctx context.Context, token, pairID string) error {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return err
	}

	response, _, err := client.From("currency_pair").
		Delete("representation", "").
		Eq("id", pairID).
		Eq("user_id", userID.String()).
		Execute()
	if err != nil {
		return fmt.Errorf("failed to delete currency pair: %w", err)
	}
	_, err = firstPair(response)
	return err
}

// firstPair decodes a PostgREST "representation" response, ErrNotFound when no row matched.
func firstPair(response []byte) (*models.CurrencyPair, error) {
	var pairs []models.CurrencyPair
	if err := json.Unmarshal(response, &pairs); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	if len(pairs) == 0 {
		return nil, ErrNotFound
	}
	return &pairs[0], nil
}
