package repositories

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/miller/project/backend/models"
	"github.com/supabase-community/postgrest-go"
)

type TradesRepository struct {
	Provider supabaseClientProvider
}

func (r *TradesRepository) GetUserTrades(ctx context.Context, token, accountID string) ([]models.Trade, error) {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return nil, err
	}

	response, _, err := client.From("trade").Select("*", "exact", false).
		Eq("account_id", accountID).
		Eq("user_id", userID.String()).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch trades for account %q: %w", accountID, err)
	}

	var trades []models.Trade
	if err := json.Unmarshal(response, &trades); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	return trades, nil
}

func (r *TradesRepository) CreateTrade(ctx context.Context, token string, record models.TradeRecord) (*models.Trade, error) {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return nil, err
	}

	body := map[string]interface{}{
		"user_id":       userID.String(),
		"account_id":    record.AccountID,
		"currency_pair": record.CurrencyPair,
		"direction":     record.Direction,
		"entry_price":   record.EntryPrice,
		"exit_price":    record.ExitPrice,
		"stop_loss":     record.StopLoss,
		"notes":         record.Notes,
	}

	response, _, err := client.From("trade").
		Insert(body, false, "", "representation", "").
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create trade: %w", err)
	}
	return firstTrade(response)
}

func (r *TradesRepository) DeleteTrade(ctx context.Context, token, tradeID string) error {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return err
	}

	response, _, err := client.From("trade").
		Delete("representation", "").
		Eq("id", tradeID).
		Eq("user_id", userID.String()).
		Execute()
	if err != nil {
		return fmt.Errorf("failed to delete trade: %w", err)
	}
	_, err = firstTrade(response)
	return err
}

// firstTrade decodes a PostgREST "representation" response, ErrNotFound when no row matched.
func firstTrade(response []byte) (*models.Trade, error) {
	var trades []models.Trade
	if err := json.Unmarshal(response, &trades); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	if len(trades) == 0 {
		return nil, ErrNotFound
	}
	return &trades[0], nil
}
