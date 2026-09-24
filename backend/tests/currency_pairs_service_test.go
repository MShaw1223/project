package tests

import (
	"context"
	"errors"
	"testing"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/services"
)

// fakeCurrencyPairsRepo returns canned results and records what the service passed down.
type fakeCurrencyPairsRepo struct {
	pairs []models.CurrencyPair
	pair  *models.CurrencyPair
	err   error

	gotToken, gotSymbol, gotPairID string
	calls                          int
}

func (f *fakeCurrencyPairsRepo) GetUserPairs(ctx context.Context, token string) ([]models.CurrencyPair, error) {
	f.calls++
	f.gotToken = token
	return f.pairs, f.err
}

func (f *fakeCurrencyPairsRepo) CreatePair(ctx context.Context, token, symbol string) (*models.CurrencyPair, error) {
	f.calls++
	f.gotToken, f.gotSymbol = token, symbol
	return f.pair, f.err
}

func (f *fakeCurrencyPairsRepo) DeletePair(ctx context.Context, token, pairID string) error {
	f.calls++
	f.gotToken, f.gotPairID = token, pairID
	return f.err
}

func TestCurrencyPairsServiceGetUserPairsForwardsToRepository(t *testing.T) {
	repo := &fakeCurrencyPairsRepo{pairs: []models.CurrencyPair{{}, {}}}
	svc := &services.CurrencyPairsService{Repo: repo}

	pairs, err := svc.GetUserPairs(context.Background(), "tok")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(pairs) != 2 || repo.gotToken != "tok" {
		t.Fatalf("unexpected result: %d pairs, token %q", len(pairs), repo.gotToken)
	}
}

func TestCurrencyPairsServiceCreatePairRejectsInvalidSymbols(t *testing.T) {
	for _, symbol := range []string{"", "EU", "EURUSDGBPJPY", "EUR123", "  "} {
		repo := &fakeCurrencyPairsRepo{}
		svc := &services.CurrencyPairsService{Repo: repo}

		if _, err := svc.CreatePair(context.Background(), "tok", symbol); !errors.Is(err, services.ErrInvalidInput) {
			t.Errorf("%q: expected ErrInvalidInput, got %v", symbol, err)
		}
		if repo.calls != 0 {
			t.Errorf("%q: expected the repository not to be called", symbol)
		}
	}
}

func TestCurrencyPairsServiceCreatePairNormalizesAndForwards(t *testing.T) {
	repo := &fakeCurrencyPairsRepo{pair: &models.CurrencyPair{}}
	svc := &services.CurrencyPairsService{Repo: repo}

	if _, err := svc.CreatePair(context.Background(), "tok", "  eurusd  "); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotSymbol != "EURUSD" || repo.gotToken != "tok" {
		t.Fatalf("expected uppercased symbol and token, got %q %q", repo.gotSymbol, repo.gotToken)
	}
}

func TestCurrencyPairsServiceDeletePairValidatesID(t *testing.T) {
	repo := &fakeCurrencyPairsRepo{}
	svc := &services.CurrencyPairsService{Repo: repo}

	if err := svc.DeletePair(context.Background(), "tok", "not-a-uuid"); !errors.Is(err, services.ErrInvalidInput) {
		t.Fatalf("expected ErrInvalidInput, got %v", err)
	}
	if repo.calls != 0 {
		t.Fatalf("expected the repository not to be called, got %d calls", repo.calls)
	}
}

func TestCurrencyPairsServiceDeletePairForwardsToRepository(t *testing.T) {
	repo := &fakeCurrencyPairsRepo{}
	svc := &services.CurrencyPairsService{Repo: repo}

	if err := svc.DeletePair(context.Background(), "tok", validID); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotToken != "tok" || repo.gotPairID != validID {
		t.Fatalf("expected token and id to reach the repository, got %q %q", repo.gotToken, repo.gotPairID)
	}
}
