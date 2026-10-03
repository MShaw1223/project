package tests

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

// fakeTradesService returns canned results and records what the handler passed down.
type fakeTradesService struct {
	trades []models.Trade
	trade  *models.Trade
	err    error

	gotToken, gotAccountID, gotTradeID string
	gotRequest                         models.TradeRequest
}

func (f *fakeTradesService) GetUserTrades(ctx context.Context, token, accountID string) ([]models.Trade, error) {
	f.gotToken, f.gotAccountID = token, accountID
	return f.trades, f.err
}

func (f *fakeTradesService) CreateTrade(ctx context.Context, token string, req models.TradeRequest) (*models.Trade, error) {
	f.gotToken, f.gotRequest = token, req
	return f.trade, f.err
}

func (f *fakeTradesService) DeleteTrade(ctx context.Context, token, tradeID string) error {
	f.gotToken, f.gotTradeID = token, tradeID
	return f.err
}

func newTradesFlowRouter(svc *fakeTradesService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.TradesHandler{Service: svc, Provider: &handlers.HandlerProvider{}}
	router.GET("/trades", h.GetUserTrades)
	router.POST("/trades", h.CreateTrade)
	router.DELETE("/trades/:id", h.DeleteTrade)
	return router
}

func tradesRequest(router *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: "cookie-token"})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestGetUserTradesRequiresAValidAccountID(t *testing.T) {
	for _, path := range []string{"/trades", "/trades?account_id=not-a-uuid"} {
		recorder := tradesRequest(newTradesFlowRouter(&fakeTradesService{}), http.MethodGet, path, "")
		if recorder.Code != http.StatusBadRequest {
			t.Errorf("%s: expected %d, got %d", path, http.StatusBadRequest, recorder.Code)
		}
	}
}

func TestGetUserTradesReturnsTradesForTheAccount(t *testing.T) {
	svc := &fakeTradesService{trades: []models.Trade{{CurrencyPair: "EURUSD"}}}
	recorder := tradesRequest(newTradesFlowRouter(svc), http.MethodGet, "/trades?account_id="+validID, "")

	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), "EURUSD") {
		t.Fatalf("expected the trade list, got %d %s", recorder.Code, recorder.Body.String())
	}
	if svc.gotToken != "cookie-token" || svc.gotAccountID != validID {
		t.Fatalf("expected token and account id to reach the service, got %q %q", svc.gotToken, svc.gotAccountID)
	}
}

func TestCreateTradeReturns201(t *testing.T) {
	svc := &fakeTradesService{trade: &models.Trade{CurrencyPair: "EURUSD"}}
	body := `{"account_id":"` + validID + `","currency_pair":"EURUSD","direction":"long","entry_price":1.1,"exit_price":1.2,"stop_loss":1.05,"notes":"n"}`
	recorder := tradesRequest(newTradesFlowRouter(svc), http.MethodPost, "/trades", body)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d (%s)", http.StatusCreated, recorder.Code, recorder.Body.String())
	}
	got := svc.gotRequest
	if got.AccountID != validID || svc.gotToken != "cookie-token" {
		t.Fatalf("expected account id and token to reach the service, got %q %q", got.AccountID, svc.gotToken)
	}
	if got.Direction != "long" || got.ExitPrice != 1.2 || got.StopLoss == nil || *got.StopLoss != 1.05 {
		t.Fatalf("expected direction, exit price and stop loss to be decoded, got %+v", got)
	}
}

func TestCreateTradeDecodesAMissingStopLossAsNil(t *testing.T) {
	svc := &fakeTradesService{trade: &models.Trade{}}
	body := `{"account_id":"` + validID + `","currency_pair":"EURUSD","direction":"short","entry_price":1.1,"exit_price":1.0,"stop_loss":null}`
	recorder := tradesRequest(newTradesFlowRouter(svc), http.MethodPost, "/trades", body)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d (%s)", http.StatusCreated, recorder.Code, recorder.Body.String())
	}
	if svc.gotRequest.StopLoss != nil {
		t.Fatalf("expected no stop loss, got %v", *svc.gotRequest.StopLoss)
	}
}

func TestCreateTradeRejectsAMalformedBody(t *testing.T) {
	recorder := tradesRequest(newTradesFlowRouter(&fakeTradesService{}), http.MethodPost, "/trades", `{"entry_price":"high"}`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestDeleteTradeRequiresAValidID(t *testing.T) {
	recorder := tradesRequest(newTradesFlowRouter(&fakeTradesService{}), http.MethodDelete, "/trades/not-a-uuid", "")
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestDeleteTradeReturns204(t *testing.T) {
	svc := &fakeTradesService{}
	recorder := tradesRequest(newTradesFlowRouter(svc), http.MethodDelete, "/trades/"+validID, "")

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected %d, got %d", http.StatusNoContent, recorder.Code)
	}
	if svc.gotTradeID != validID {
		t.Fatalf("expected the id to reach the service, got %q", svc.gotTradeID)
	}
}

func TestTradesServiceErrorsMapToStatusCodes(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"invalid input", services.ErrInvalidInput, http.StatusBadRequest},
		{"not found", repositories.ErrNotFound, http.StatusNotFound},
		{"unauthenticated", repositories.ErrUnauthenticated, http.StatusUnauthorized},
		{"unexpected", errors.New("database down"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		router := newTradesFlowRouter(&fakeTradesService{err: tc.err})
		if got := tradesRequest(router, http.MethodGet, "/trades?account_id="+validID, "").Code; got != tc.want {
			t.Errorf("get (%s): expected %d, got %d", tc.name, tc.want, got)
		}
		if got := tradesRequest(router, http.MethodPost, "/trades", `{"account_id":"`+validID+`"}`).Code; got != tc.want {
			t.Errorf("create (%s): expected %d, got %d", tc.name, tc.want, got)
		}
		if got := tradesRequest(router, http.MethodDelete, "/trades/"+validID, "").Code; got != tc.want {
			t.Errorf("delete (%s): expected %d, got %d", tc.name, tc.want, got)
		}
	}
}

func TestCreateTradeRejectsAnInvalidBody(t *testing.T) {
	svc := &fakeTradesService{}
	recorder := tradesRequest(newTradesFlowRouter(svc), http.MethodPost, "/trades", `not json`)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
	if svc.gotToken != "" {
		t.Fatal("an invalid body must be rejected before the service")
	}
}
