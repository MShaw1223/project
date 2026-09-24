package services

import (
	"context"
	"math"
	"strings"

	"github.com/google/uuid"
	"github.com/miller/project/backend/models"
)

const (
	MaxTradeNotesLength = 1000
	MinPairSymbolLength = 3
	MaxPairSymbolLength = 10
)

const (
	DirectionLong  = "long"
	DirectionShort = "short"
)

// tradesRepo is the dependency TradesService needs, so tests can inject a fake repository instead
// of a real Supabase-backed one.
type tradesRepo interface {
	GetUserTrades(ctx context.Context, token, accountID string) ([]models.Trade, error)
	CreateTrade(ctx context.Context, token string, record models.TradeRecord) (*models.Trade, error)
	DeleteTrade(ctx context.Context, token, tradeID string) error
}

type TradesService struct {
	Repo tradesRepo
}

func (s *TradesService) GetUserTrades(ctx context.Context, token, accountID string) ([]models.Trade, error) {
	if _, err := uuid.Parse(accountID); err != nil {
		return nil, ErrInvalidInput
	}
	return s.Repo.GetUserTrades(ctx, token, accountID)
}

func (s *TradesService) CreateTrade(ctx context.Context, token string, req models.TradeRequest) (*models.Trade, error) {
	record, err := buildTradeRecord(req)
	if err != nil {
		return nil, err
	}
	return s.Repo.CreateTrade(ctx, token, record)
}

func (s *TradesService) DeleteTrade(ctx context.Context, token, tradeID string) error {
	if _, err := uuid.Parse(tradeID); err != nil {
		return ErrInvalidInput
	}
	return s.Repo.DeleteTrade(ctx, token, tradeID)
}

// buildTradeRecord validates a trade request. The database enforces the same rules and derives the
// outcome and R multiple; checking here too gives the client a 400 instead of a database error.
func buildTradeRecord(req models.TradeRequest) (models.TradeRecord, error) {
	if _, err := uuid.Parse(req.AccountID); err != nil {
		return models.TradeRecord{}, ErrInvalidInput
	}

	symbol, err := validatePairSymbol(req.CurrencyPair)
	if err != nil {
		return models.TradeRecord{}, err
	}

	if req.Direction != DirectionLong && req.Direction != DirectionShort {
		return models.TradeRecord{}, ErrInvalidInput
	}
	if !isPositivePrice(req.EntryPrice) || !isPositivePrice(req.ExitPrice) {
		return models.TradeRecord{}, ErrInvalidInput
	}
	// the stop has to sit on the losing side of the entry, otherwise there is no risk to measure against
	if req.StopLoss != nil {
		if !isPositivePrice(*req.StopLoss) || directionSign(req.Direction)*(req.EntryPrice-*req.StopLoss) <= 0 {
			return models.TradeRecord{}, ErrInvalidInput
		}
	}

	notes := strings.TrimSpace(req.Notes)
	if len(notes) > MaxTradeNotesLength {
		return models.TradeRecord{}, ErrInvalidInput
	}

	return models.TradeRecord{
		AccountID:    req.AccountID,
		CurrencyPair: symbol,
		Direction:    req.Direction,
		EntryPrice:   req.EntryPrice,
		ExitPrice:    req.ExitPrice,
		StopLoss:     req.StopLoss,
		Notes:        notes,
	}, nil
}

func directionSign(direction string) float64 {
	if direction == DirectionShort {
		return -1
	}
	return 1
}

func isPositivePrice(price float64) bool {
	return price > 0 && !math.IsInf(price, 0) && !math.IsNaN(price)
}

// validatePairSymbol normalizes and validates a currency pair symbol like "EURUSD": 3-10 uppercase
// letters.
func validatePairSymbol(symbol string) (string, error) {
	symbol = strings.ToUpper(strings.TrimSpace(symbol))
	if len(symbol) < MinPairSymbolLength || len(symbol) > MaxPairSymbolLength {
		return "", ErrInvalidInput
	}
	for _, r := range symbol {
		if r < 'A' || r > 'Z' {
			return "", ErrInvalidInput
		}
	}
	return symbol, nil
}
