package tests

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/services"
)

// newAccountsRouter wires the accounts handler without a repository, so only requests rejected
// before reaching Supabase (auth, body, id and name validation) can be exercised here.
func newAccountsRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.AccountsHandler{Service: &services.AccountsService{}, Provider: &handlers.HandlerProvider{}}
	router.POST("/accounts", h.CreateAccount)
	router.PUT("/accounts/:id", h.UpdateAccount)
	router.DELETE("/accounts/:id", h.DeleteAccount)
	return router
}

func doAccountsRequest(method, path, body string, authed bool) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if authed {
		req.Header.Set("Authorization", "Bearer test-token")
	}
	recorder := httptest.NewRecorder()
	newAccountsRouter().ServeHTTP(recorder, req)
	return recorder
}

const validID = "3f2b8c1e-5d4a-4b7e-9c1a-2e6f8a0b1c3d"

func TestAccountWritesRequireAuthentication(t *testing.T) {
	cases := []struct{ method, path, body string }{
		{http.MethodPost, "/accounts", `{"name":"main"}`},
		{http.MethodPut, "/accounts/" + validID, `{"name":"main"}`},
		{http.MethodDelete, "/accounts/" + validID, ""},
	}
	for _, tc := range cases {
		if got := doAccountsRequest(tc.method, tc.path, tc.body, false).Code; got != http.StatusUnauthorized {
			t.Errorf("%s %s: expected %d, got %d", tc.method, tc.path, http.StatusUnauthorized, got)
		}
	}
}

func TestAccountWritesRejectMalformedID(t *testing.T) {
	for _, method := range []string{http.MethodPut, http.MethodDelete} {
		if got := doAccountsRequest(method, "/accounts/not-a-uuid", `{"name":"main"}`, true).Code; got != http.StatusBadRequest {
			t.Errorf("%s: expected %d, got %d", method, http.StatusBadRequest, got)
		}
	}
}

func TestAccountWritesRejectInvalidBody(t *testing.T) {
	cases := []struct{ method, path string }{
		{http.MethodPost, "/accounts"},
		{http.MethodPut, "/accounts/" + validID},
	}
	for _, tc := range cases {
		if got := doAccountsRequest(tc.method, tc.path, `not json`, true).Code; got != http.StatusBadRequest {
			t.Errorf("%s %s: expected %d, got %d", tc.method, tc.path, http.StatusBadRequest, got)
		}
	}
}

func TestAccountWritesRejectInvalidName(t *testing.T) {
	for _, name := range []string{"", "   ", "this name is way too long"} {
		body := `{"name":"` + name + `"}`
		if got := doAccountsRequest(http.MethodPost, "/accounts", body, true).Code; got != http.StatusBadRequest {
			t.Errorf("create %q: expected %d, got %d", name, http.StatusBadRequest, got)
		}
		if got := doAccountsRequest(http.MethodPut, "/accounts/"+validID, body, true).Code; got != http.StatusBadRequest {
			t.Errorf("update %q: expected %d, got %d", name, http.StatusBadRequest, got)
		}
	}
}
