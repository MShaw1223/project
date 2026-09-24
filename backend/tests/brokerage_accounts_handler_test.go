package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
)

// fakeAccountsService returns canned results and records what the handler passed down.
type fakeAccountsService struct {
	accounts []models.BrokerageAccount
	account  *models.BrokerageAccount
	err      error

	gotToken, gotID, gotName string
	calls                    int
}

func (f *fakeAccountsService) GetUserAccounts(ctx context.Context, token string) ([]models.BrokerageAccount, error) {
	f.calls++
	f.gotToken = token
	return f.accounts, f.err
}

func (f *fakeAccountsService) CreateAccount(ctx context.Context, token, name string) (*models.BrokerageAccount, error) {
	f.calls++
	f.gotToken, f.gotName = token, name
	return f.account, f.err
}

func (f *fakeAccountsService) UpdateAccount(ctx context.Context, token, accountID, name string) (*models.BrokerageAccount, error) {
	f.calls++
	f.gotToken, f.gotID, f.gotName = token, accountID, name
	return f.account, f.err
}

func (f *fakeAccountsService) DeleteAccount(ctx context.Context, token, accountID string) error {
	f.calls++
	f.gotToken, f.gotID = token, accountID
	return f.err
}

func newAccountsTestContext(authHeader string) (*gin.Context, *httptest.ResponseRecorder) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodGet, "/accounts", nil)
	if authHeader != "" {
		c.Request.Header.Set("Authorization", authHeader)
	}
	return c, recorder
}

func TestAccountsHandlerGetUserAccountsSuccess(t *testing.T) {
	c, recorder := newAccountsTestContext("Bearer test-token")
	h := &handlers.AccountsHandler{
		Service:  &fakeAccountsService{accounts: []models.BrokerageAccount{{Name: "Brokerage 1"}}},
		Provider: &handlers.HandlerProvider{},
	}

	h.GetUserAccounts(c)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var body struct {
		Accounts []models.BrokerageAccount `json:"accounts"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}
	if len(body.Accounts) != 1 {
		t.Fatalf("expected 1 account, got %d", len(body.Accounts))
	}
}

func TestAccountsHandlerGetUserAccountsServiceError(t *testing.T) {
	c, recorder := newAccountsTestContext("Bearer test-token")
	h := &handlers.AccountsHandler{
		Service:  &fakeAccountsService{err: errors.New("boom")},
		Provider: &handlers.HandlerProvider{},
	}

	h.GetUserAccounts(c)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
}

func TestAccountsHandlerGetUserAccountsMissingAuthHeader(t *testing.T) {
	c, recorder := newAccountsTestContext("")
	h := &handlers.AccountsHandler{
		Service:  &fakeAccountsService{},
		Provider: &handlers.HandlerProvider{},
	}

	h.GetUserAccounts(c)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}
