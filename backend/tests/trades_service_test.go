package tests

import (
	"context"
	"errors"
	"math"
	"testing"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/services"
)

// fakeTradesRepo returns canned results and records what the service passed down.
type fakeTradesRepo struct {
	trades []models.Trade
	trade  *models.Trade
	err    error

	gotToken, gotAccountID, gotTradeID string
	gotRecord                          models.TradeRecord
	calls                              int
}

func (f *fakeTradesRepo) GetUserTrades(ctx context.Context, token, accountID string) ([]models.Trade, error) {
	f.calls++
	f.gotToken, f.gotAccountID = token, accountID
	return f.trades, f.err
}

func (f *fakeTradesRepo) CreateTrade(ctx context.Context, token string, record models.TradeRecord) (*models.Trade, error) {
	f.calls++
	f.gotToken, f.gotRecord = token, record
	return f.trade, f.err
}

func (f *fakeTradesRepo) DeleteTrade(ctx context.Context, token, tradeID string) error {
	f.calls++
	f.gotToken, f.gotTradeID = token, tradeID
	return f.err
}

func price(value float64) *float64 { return &value }

func sampleTradeRequest() models.TradeRequest {
	return models.TradeRequest{
		AccountID:    validID,
		CurrencyPair: "eurusd",
		Direction:    "long",
		EntryPrice:   1.1,
		ExitPrice:    1.2,
		StopLoss:     price(1.05),
		Notes:        "  looked good  ",
	}
}

func TestTradesServiceGetUserTradesValidatesAccountID(t *testing.T) {
	repo := &fakeTradesRepo{}
	svc := &services.TradesService{Repo: repo}

	if _, err := svc.GetUserTrades(context.Background(), "tok", "not-a-uuid"); !errors.Is(err, services.ErrInvalidInput) {
		t.Fatalf("expected ErrInvalidInput, got %v", err)
	}
	if repo.calls != 0 {
		t.Fatalf("expected the repository not to be called, got %d calls", repo.calls)
	}
}

func TestTradesServiceGetUserTradesForwardsToRepository(t *testing.T) {
	repo := &fakeTradesRepo{trades: []models.Trade{{}, {}}}
	svc := &services.TradesService{Repo: repo}

	trades, err := svc.GetUserTrades(context.Background(), "tok", validID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(trades) != 2 || repo.gotToken != "tok" || repo.gotAccountID != validID {
		t.Fatalf("unexpected result: %d trades, token %q, account %q", len(trades), repo.gotToken, repo.gotAccountID)
	}
}

func TestTradesServiceCreateTradeRejectsInvalidInput(t *testing.T) {
	cases := []struct {
		name string
		fix  func(*models.TradeRequest)
	}{
		{"bad account id", func(r *models.TradeRequest) { r.AccountID = "not-a-uuid" }},
		{"empty currency pair", func(r *models.TradeRequest) { r.CurrencyPair = "" }},
		{"currency pair too short", func(r *models.TradeRequest) { r.CurrencyPair = "EU" }},
		{"currency pair too long", func(r *models.TradeRequest) { r.CurrencyPair = "EURUSDGBPJPY" }},
		{"currency pair not letters", func(r *models.TradeRequest) { r.CurrencyPair = "EUR123" }},
		{"missing direction", func(r *models.TradeRequest) { r.Direction = "" }},
		{"unknown direction", func(r *models.TradeRequest) { r.Direction = "sideways" }},
		{"zero entry price", func(r *models.TradeRequest) { r.EntryPrice = 0 }},
		{"negative exit price", func(r *models.TradeRequest) { r.ExitPrice = -1 }},
		{"infinite exit price", func(r *models.TradeRequest) { r.ExitPrice = math.Inf(1) }},
		{"negative stop loss", func(r *models.TradeRequest) { r.StopLoss = price(-1) }},
		{"long stop above entry", func(r *models.TradeRequest) { r.StopLoss = price(1.15) }},
		{"stop at entry", func(r *models.TradeRequest) { r.StopLoss = price(1.1) }},
		{"short stop below entry", func(r *models.TradeRequest) { r.Direction, r.StopLoss = "short", price(1.05) }},
		{"notes too long", func(r *models.TradeRequest) { r.Notes = string(make([]byte, services.MaxTradeNotesLength+1)) }},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := sampleTradeRequest()
			tc.fix(&req)
			repo := &fakeTradesRepo{}
			svc := &services.TradesService{Repo: repo}

			if _, err := svc.CreateTrade(context.Background(), "tok", req); !errors.Is(err, services.ErrInvalidInput) {
				t.Fatalf("expected ErrInvalidInput, got %v", err)
			}
			if repo.calls != 0 {
				t.Fatalf("expected the repository not to be called")
			}
		})
	}
}

func TestTradesServiceCreateTradeNormalizesAndForwardsTheRecord(t *testing.T) {
	repo := &fakeTradesRepo{trade: &models.Trade{}}
	svc := &services.TradesService{Repo: repo}

	if _, err := svc.CreateTrade(context.Background(), "tok", sampleTradeRequest()); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	got := repo.gotRecord
	if got.CurrencyPair != "EURUSD" {
		t.Fatalf("expected the currency pair to be uppercased, got %q", got.CurrencyPair)
	}
	if got.Notes != "looked good" {
		t.Fatalf("expected notes to be trimmed, got %q", got.Notes)
	}
	if got.AccountID != validID || got.Direction != "long" || got.EntryPrice != 1.1 || got.ExitPrice != 1.2 ||
		got.StopLoss == nil || *got.StopLoss != 1.05 {
		t.Fatalf("expected the request fields to be carried over, got %+v", got)
	}
	if repo.gotToken != "tok" {
		t.Fatalf("expected the token to reach the repository, got %q", repo.gotToken)
	}
}

func TestTradesServiceCreateTradeAllowsAMissingStopLoss(t *testing.T) {
	repo := &fakeTradesRepo{trade: &models.Trade{}}
	svc := &services.TradesService{Repo: repo}
	req := sampleTradeRequest()
	req.StopLoss = nil

	if _, err := svc.CreateTrade(context.Background(), "tok", req); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotRecord.StopLoss != nil {
		t.Fatalf("expected no stop loss to be forwarded, got %v", *repo.gotRecord.StopLoss)
	}
}

func TestTradesServiceDeleteTradeValidatesID(t *testing.T) {
	repo := &fakeTradesRepo{}
	svc := &services.TradesService{Repo: repo}

	if err := svc.DeleteTrade(context.Background(), "tok", "not-a-uuid"); !errors.Is(err, services.ErrInvalidInput) {
		t.Fatalf("expected ErrInvalidInput, got %v", err)
	}
	if repo.calls != 0 {
		t.Fatalf("expected the repository not to be called, got %d calls", repo.calls)
	}
}

func TestTradesServiceDeleteTradeForwardsToRepository(t *testing.T) {
	repo := &fakeTradesRepo{}
	svc := &services.TradesService{Repo: repo}

	if err := svc.DeleteTrade(context.Background(), "tok", validID); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotToken != "tok" || repo.gotTradeID != validID {
		t.Fatalf("expected token and id to reach the repository, got %q %q", repo.gotToken, repo.gotTradeID)
	}
}
