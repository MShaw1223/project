package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"testing"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
)

const tradesTable = "/rest/v1/trade"

const tradeRow = `{"id":"` + validID + `","account_id":"` + validID + `","user_id":"` + fakeUserID + `","currency_pair":"EURUSD","direction":"long","entry_price":1.1,"exit_price":1.2,"outcome":"win"}`

func newTradesRepository() *repositories.TradesRepository {
	return &repositories.TradesRepository{Provider: &repositories.SupabaseProvider{}}
}

func TestTradesRepositoryGetUserTradesReturnsTheAccountsTradesNewestFirst(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, tradesTable, http.StatusOK, `[`+tradeRow+`]`)

	trades, err := newTradesRepository().GetUserTrades(context.Background(), "user-token", validID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(trades) != 1 || trades[0].CurrencyPair != "EURUSD" || trades[0].Outcome != "win" {
		t.Fatalf("expected the trade from Supabase, got %+v", trades)
	}
	call := supabase.last(http.MethodGet, tradesTable)
	call.asUser(t, "user-token", "user_id")
	if got := call.Query.Get("account_id"); got != "eq."+validID {
		t.Fatalf("expected the account id filter, got %q", got)
	}
	if got := call.Query.Get("order"); !strings.HasPrefix(got, "created_at.desc") {
		t.Fatalf("expected newest first, got order %q", got)
	}
}

func TestTradesRepositoryCreateTradeInsertsTheRecordForTheCaller(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, tradesTable, http.StatusCreated, `[`+tradeRow+`]`)
	stopLoss := 1.05
	record := models.TradeRecord{
		AccountID:    validID,
		CurrencyPair: "EURUSD",
		Direction:    "long",
		EntryPrice:   1.1,
		ExitPrice:    1.2,
		StopLoss:     &stopLoss,
		Notes:        "breakout",
	}

	trade, err := newTradesRepository().CreateTrade(context.Background(), "user-token", record)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if trade == nil || trade.CurrencyPair != "EURUSD" {
		t.Fatalf("expected the created trade, got %+v", trade)
	}
	call := supabase.last(http.MethodPost, tradesTable)
	if got := call.Header.Get("Authorization"); got != "Bearer user-token" {
		t.Fatalf("expected the caller's own token, got %q", got)
	}
	var body map[string]any
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	want := map[string]any{
		"user_id":       fakeUserID,
		"account_id":    validID,
		"currency_pair": "EURUSD",
		"direction":     "long",
		"entry_price":   1.1,
		"exit_price":    1.2,
		"stop_loss":     1.05,
		"notes":         "breakout",
	}
	if len(body) != len(want) {
		t.Fatalf("expected exactly the trade's columns, got %v", body)
	}
	for column, value := range want {
		if body[column] != value {
			t.Errorf("%s: expected %v, got %v", column, value, body[column])
		}
	}
}

func TestTradesRepositoryCreateTradeStoresAMissingStopLossAsNull(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, tradesTable, http.StatusCreated, `[`+tradeRow+`]`)

	if _, err := newTradesRepository().CreateTrade(context.Background(), "user-token", models.TradeRecord{AccountID: validID}); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	var body map[string]any
	if err := json.Unmarshal([]byte(supabase.last(http.MethodPost, tradesTable).Body), &body); err != nil {
		t.Fatalf("expected a json body: %v", err)
	}
	if value, sent := body["stop_loss"]; !sent || value != nil {
		t.Fatalf("expected stop_loss to be sent as null, got %v (sent %v)", value, sent)
	}
}

func TestTradesRepositoryDeleteTradeDeletesOnlyTheCallersTrade(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodDelete, tradesTable, http.StatusOK, `[`+tradeRow+`]`)

	if err := newTradesRepository().DeleteTrade(context.Background(), "user-token", validID); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	call := supabase.last(http.MethodDelete, tradesTable)
	call.asUser(t, "user-token", "user_id")
	if got := call.Query.Get("id"); got != "eq."+validID {
		t.Fatalf("expected the trade id filter, got %q", got)
	}
}

func TestTradesRepositoryDeleteTradeReportsAMissingTrade(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodDelete, tradesTable, http.StatusOK, `[]`)

	err := newTradesRepository().DeleteTrade(context.Background(), "user-token", validID)
	if !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
