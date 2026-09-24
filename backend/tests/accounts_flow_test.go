package tests

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

func newAccountsFlowRouter(svc *fakeAccountsService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.AccountsHandler{Service: svc, Provider: &handlers.HandlerProvider{}}
	router.GET("/accounts", h.GetUserAccounts)
	router.POST("/accounts", h.CreateAccount)
	router.PUT("/accounts/:id", h.UpdateAccount)
	router.DELETE("/accounts/:id", h.DeleteAccount)
	return router
}

func authedRequest(router *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: "cookie-token"})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func sampleAccount() *models.BrokerageAccount {
	return &models.BrokerageAccount{ID: uuid.MustParse(validID), Name: "main"}
}

func TestListAccountsAuthenticatesWithCookie(t *testing.T) {
	svc := &fakeAccountsService{accounts: []models.BrokerageAccount{*sampleAccount()}}
	recorder := authedRequest(newAccountsFlowRouter(svc), http.MethodGet, "/accounts", "")

	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), `"name":"main"`) {
		t.Fatalf("expected the account list, got %d %s", recorder.Code, recorder.Body.String())
	}
	if svc.gotToken != "cookie-token" {
		t.Fatalf("expected the cookie token to reach the service, got %q", svc.gotToken)
	}
}

func TestCreateAccountReturns201(t *testing.T) {
	svc := &fakeAccountsService{account: sampleAccount()}
	recorder := authedRequest(newAccountsFlowRouter(svc), http.MethodPost, "/accounts", `{"name":"main"}`)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d (%s)", http.StatusCreated, recorder.Code, recorder.Body.String())
	}
	if svc.gotName != "main" || svc.gotToken != "cookie-token" {
		t.Fatalf("expected name and cookie token to reach the service, got %q %q", svc.gotName, svc.gotToken)
	}
}

func TestUpdateAccountPassesIDAndName(t *testing.T) {
	svc := &fakeAccountsService{account: sampleAccount()}
	recorder := authedRequest(newAccountsFlowRouter(svc), http.MethodPut, "/accounts/"+validID, `{"name":"renamed"}`)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d (%s)", http.StatusOK, recorder.Code, recorder.Body.String())
	}
	if svc.gotID != validID || svc.gotName != "renamed" {
		t.Fatalf("expected id and name to reach the service, got %q %q", svc.gotID, svc.gotName)
	}
}

func TestDeleteAccountReturns204(t *testing.T) {
	svc := &fakeAccountsService{}
	recorder := authedRequest(newAccountsFlowRouter(svc), http.MethodDelete, "/accounts/"+validID, "")

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected %d, got %d", http.StatusNoContent, recorder.Code)
	}
	if svc.gotID != validID {
		t.Fatalf("expected the id to reach the service, got %q", svc.gotID)
	}
}

func TestAccountServiceErrorsMapToStatusCodes(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"invalid input", services.ErrInvalidInput, http.StatusBadRequest},
		{"not found", repositories.ErrNotFound, http.StatusNotFound},
		{"unauthenticated", repositories.ErrUnauthenticated, http.StatusUnauthorized},
		{"wrapped not found", errors.Join(errors.New("ctx"), repositories.ErrNotFound), http.StatusNotFound},
		{"unexpected", errors.New("database down"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		router := newAccountsFlowRouter(&fakeAccountsService{err: tc.err})
		requests := []struct{ method, path, body string }{
			{http.MethodGet, "/accounts", ""},
			{http.MethodPost, "/accounts", `{"name":"main"}`},
			{http.MethodPut, "/accounts/" + validID, `{"name":"main"}`},
			{http.MethodDelete, "/accounts/" + validID, ""},
		}
		for _, r := range requests {
			// listing has no name to validate, so invalid input is only a client error for the writes
			if r.method == http.MethodGet && errors.Is(tc.err, services.ErrInvalidInput) {
				continue
			}
			if got := authedRequest(router, r.method, r.path, r.body).Code; got != tc.want {
				t.Errorf("%s %s (%s): expected %d, got %d", r.method, r.path, tc.name, tc.want, got)
			}
		}
	}
}

func TestAccountsServiceValidatesNamesBeforeTheRepository(t *testing.T) {
	for _, name := range []string{"", "   ", "this name is way too long"} {
		repo := &fakeAccountsRepo{account: sampleAccount()}
		svc := &services.AccountsService{Repo: repo}

		if _, err := svc.CreateAccount(context.Background(), "tok", name); !errors.Is(err, services.ErrInvalidInput) {
			t.Errorf("create %q: expected ErrInvalidInput, got %v", name, err)
		}
		if _, err := svc.UpdateAccount(context.Background(), "tok", validID, name); !errors.Is(err, services.ErrInvalidInput) {
			t.Errorf("update %q: expected ErrInvalidInput, got %v", name, err)
		}
		if repo.calls != 0 {
			t.Errorf("%q: invalid names must be rejected before the repository, got %d calls", name, repo.calls)
		}
	}
}

func TestAccountsServiceTrimsNamesAndForwardsArguments(t *testing.T) {
	repo := &fakeAccountsRepo{account: sampleAccount()}
	svc := &services.AccountsService{Repo: repo}

	if _, err := svc.CreateAccount(context.Background(), "tok", "  main  "); err != nil {
		t.Fatalf("create: %v", err)
	}
	if repo.gotName != "main" || repo.gotToken != "tok" {
		t.Fatalf("create: expected trimmed name and token, got %q %q", repo.gotName, repo.gotToken)
	}
	if _, err := svc.UpdateAccount(context.Background(), "tok", validID, " renamed "); err != nil {
		t.Fatalf("update: %v", err)
	}
	if repo.gotID != validID || repo.gotName != "renamed" {
		t.Fatalf("update: expected id and trimmed name, got %q %q", repo.gotID, repo.gotName)
	}
	if err := svc.DeleteAccount(context.Background(), "tok", validID); err != nil {
		t.Fatalf("delete: %v", err)
	}
}

func TestAccountNameLimitCountsCharactersNotBytes(t *testing.T) {
	repo := &fakeAccountsRepo{account: sampleAccount()}
	svc := &services.AccountsService{Repo: repo}
	name := strings.Repeat("é", services.MaxAccountNameLength) // 30 bytes, 15 characters

	if _, err := svc.CreateAccount(context.Background(), "tok", name); err != nil {
		t.Fatalf("expected a %d-character name to be accepted, got %v", services.MaxAccountNameLength, err)
	}
}
