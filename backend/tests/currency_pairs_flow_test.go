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

// fakeCurrencyPairsService returns canned results and records what the handler passed down.
type fakeCurrencyPairsService struct {
	pairs []models.CurrencyPair
	pair  *models.CurrencyPair
	err   error

	gotToken, gotSymbol, gotPairID string
}

func (f *fakeCurrencyPairsService) GetUserPairs(ctx context.Context, token string) ([]models.CurrencyPair, error) {
	f.gotToken = token
	return f.pairs, f.err
}

func (f *fakeCurrencyPairsService) CreatePair(ctx context.Context, token, symbol string) (*models.CurrencyPair, error) {
	f.gotToken, f.gotSymbol = token, symbol
	return f.pair, f.err
}

func (f *fakeCurrencyPairsService) DeletePair(ctx context.Context, token, pairID string) error {
	f.gotToken, f.gotPairID = token, pairID
	return f.err
}

func newCurrencyPairsFlowRouter(svc *fakeCurrencyPairsService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.CurrencyPairsHandler{Service: svc, Provider: &handlers.HandlerProvider{}}
	router.GET("/currency-pairs", h.GetUserPairs)
	router.POST("/currency-pairs", h.CreatePair)
	router.DELETE("/currency-pairs/:id", h.DeletePair)
	return router
}

func currencyPairsRequest(router *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: "cookie-token"})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestGetUserPairsReturnsPairs(t *testing.T) {
	svc := &fakeCurrencyPairsService{pairs: []models.CurrencyPair{{Symbol: "EURUSD"}}}
	recorder := currencyPairsRequest(newCurrencyPairsFlowRouter(svc), http.MethodGet, "/currency-pairs", "")

	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), "EURUSD") {
		t.Fatalf("expected the pair list, got %d %s", recorder.Code, recorder.Body.String())
	}
	if svc.gotToken != "cookie-token" {
		t.Fatalf("expected the cookie token to reach the service, got %q", svc.gotToken)
	}
}

func TestCreatePairReturns201(t *testing.T) {
	svc := &fakeCurrencyPairsService{pair: &models.CurrencyPair{Symbol: "EURUSD"}}
	recorder := currencyPairsRequest(newCurrencyPairsFlowRouter(svc), http.MethodPost, "/currency-pairs", `{"symbol":"EURUSD"}`)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d (%s)", http.StatusCreated, recorder.Code, recorder.Body.String())
	}
	if svc.gotSymbol != "EURUSD" || svc.gotToken != "cookie-token" {
		t.Fatalf("expected symbol and token to reach the service, got %q %q", svc.gotSymbol, svc.gotToken)
	}
}

func TestDeletePairRequiresAValidID(t *testing.T) {
	recorder := currencyPairsRequest(newCurrencyPairsFlowRouter(&fakeCurrencyPairsService{}), http.MethodDelete, "/currency-pairs/not-a-uuid", "")
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestDeletePairReturns204(t *testing.T) {
	svc := &fakeCurrencyPairsService{}
	recorder := currencyPairsRequest(newCurrencyPairsFlowRouter(svc), http.MethodDelete, "/currency-pairs/"+validID, "")

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected %d, got %d", http.StatusNoContent, recorder.Code)
	}
	if svc.gotPairID != validID {
		t.Fatalf("expected the id to reach the service, got %q", svc.gotPairID)
	}
}

func TestCurrencyPairsServiceErrorsMapToStatusCodes(t *testing.T) {
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
		router := newCurrencyPairsFlowRouter(&fakeCurrencyPairsService{err: tc.err})
		if got := currencyPairsRequest(router, http.MethodGet, "/currency-pairs", "").Code; got != tc.want {
			t.Errorf("get (%s): expected %d, got %d", tc.name, tc.want, got)
		}
		if got := currencyPairsRequest(router, http.MethodPost, "/currency-pairs", `{"symbol":"EURUSD"}`).Code; got != tc.want {
			t.Errorf("create (%s): expected %d, got %d", tc.name, tc.want, got)
		}
		if got := currencyPairsRequest(router, http.MethodDelete, "/currency-pairs/"+validID, "").Code; got != tc.want {
			t.Errorf("delete (%s): expected %d, got %d", tc.name, tc.want, got)
		}
	}
}

func TestCreatePairRejectsAnInvalidBody(t *testing.T) {
	svc := &fakeCurrencyPairsService{}
	recorder := currencyPairsRequest(newCurrencyPairsFlowRouter(svc), http.MethodPost, "/currency-pairs", `not json`)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
	if svc.gotToken != "" {
		t.Fatal("an invalid body must be rejected before the service")
	}
}
