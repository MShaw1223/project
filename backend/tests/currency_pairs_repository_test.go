package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"github.com/miller/project/backend/repositories"
)

const pairsTable = "/rest/v1/currency_pair"

const pairRow = `{"id":"` + validID + `","user_id":"` + fakeUserID + `","symbol":"EURUSD"}`

func newCurrencyPairsRepository() *repositories.CurrencyPairsRepository {
	return &repositories.CurrencyPairsRepository{Provider: &repositories.SupabaseProvider{}}
}

func TestCurrencyPairsRepositoryGetUserPairsReturnsTheCallersPairs(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, pairsTable, http.StatusOK, `[`+pairRow+`]`)

	pairs, err := newCurrencyPairsRepository().GetUserPairs(context.Background(), "user-token")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(pairs) != 1 || pairs[0].Symbol != "EURUSD" {
		t.Fatalf("expected the pair from Supabase, got %+v", pairs)
	}
	supabase.last(http.MethodGet, pairsTable).asUser(t, "user-token", "user_id")
}

func TestCurrencyPairsRepositoryCreatePairInsertsForTheCaller(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, pairsTable, http.StatusCreated, `[`+pairRow+`]`)

	pair, err := newCurrencyPairsRepository().CreatePair(context.Background(), "user-token", "EURUSD")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if pair == nil || pair.Symbol != "EURUSD" {
		t.Fatalf("expected the created pair, got %+v", pair)
	}
	call := supabase.last(http.MethodPost, pairsTable)
	if got := call.Header.Get("Authorization"); got != "Bearer user-token" {
		t.Fatalf("expected the caller's own token, got %q", got)
	}
	var body map[string]string
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	if body["symbol"] != "EURUSD" || body["user_id"] != fakeUserID {
		t.Fatalf("expected the symbol and the caller's id to be inserted, got %v", body)
	}
}

func TestCurrencyPairsRepositoryDeletePairDeletesOnlyTheCallersPair(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodDelete, pairsTable, http.StatusOK, `[`+pairRow+`]`)

	if err := newCurrencyPairsRepository().DeletePair(context.Background(), "user-token", validID); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	call := supabase.last(http.MethodDelete, pairsTable)
	call.asUser(t, "user-token", "user_id")
	if got := call.Query.Get("id"); got != "eq."+validID {
		t.Fatalf("expected the pair id filter, got %q", got)
	}
}

func TestCurrencyPairsRepositoryDeletePairReportsAMissingPair(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodDelete, pairsTable, http.StatusOK, `[]`)

	err := newCurrencyPairsRepository().DeletePair(context.Background(), "user-token", validID)
	if !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
