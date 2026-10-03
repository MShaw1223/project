package tests

import (
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/server"
)

const appOrigin = "https://app.example"

// newServerRouter is the router main serves, wired to the real services and repositories.
func newServerRouter(t *testing.T, cfg server.Config) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	if cfg.AppOrigins == nil {
		cfg.AppOrigins = []string{appOrigin}
	}
	router, err := server.NewRouter(cfg)
	if err != nil {
		t.Fatalf("expected a router, got %v", err)
	}
	return router
}

// routerRequest sends a request as a browser on origin would, with the session cookie when token is set.
func routerRequest(router *gin.Engine, method, path, body, origin, token string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if origin != "" {
		req.Header.Set("Origin", origin)
	}
	if token != "" {
		req.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: token})
	}
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestRouterServesHealthWithoutASession(t *testing.T) {
	recorder := routerRequest(newServerRouter(t, server.Config{}), http.MethodGet, "/health", "", "", "")

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d", http.StatusOK, recorder.Code)
	}
}

func TestRouterRequiresASessionOnEveryUserRoute(t *testing.T) {
	supabase := newFakeSupabase(t)
	router := newServerRouter(t, server.Config{})
	routes := []struct{ method, path string }{
		{http.MethodGet, "/auth/user"},
		{http.MethodGet, "/profile"},
		{http.MethodPut, "/profile/password"},
		{http.MethodPut, "/profile/username"},
		{http.MethodDelete, "/profile"},
		{http.MethodGet, "/accounts"},
		{http.MethodPost, "/accounts"},
		{http.MethodPut, "/accounts/" + validID},
		{http.MethodDelete, "/accounts/" + validID},
		{http.MethodGet, "/trades?account_id=" + validID},
		{http.MethodPost, "/trades"},
		{http.MethodDelete, "/trades/" + validID},
		{http.MethodGet, "/currency-pairs"},
		{http.MethodPost, "/currency-pairs"},
		{http.MethodDelete, "/currency-pairs/" + validID},
	}
	for _, route := range routes {
		recorder := routerRequest(router, route.method, route.path, `{}`, appOrigin, "")
		if recorder.Code != http.StatusUnauthorized {
			t.Errorf("%s %s: expected %d, got %d", route.method, route.path, http.StatusUnauthorized, recorder.Code)
		}
	}
	if n := supabase.total(); n != 0 {
		t.Fatalf("requests without a session must be rejected before they reach Supabase, got %d requests", n)
	}
}

func TestRouterLogsInAndServesTheSessionsAccounts(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, "/auth/v1/token", http.StatusOK, sessionBody)
	supabase.reply(http.MethodGet, accountsTable, http.StatusOK, `[`+accountRow+`]`)
	router := newServerRouter(t, server.Config{})

	login := routerRequest(router, http.MethodPost, "/auth/login", `{"email":"trader@example.com","password":"secret123"}`, appOrigin, "")
	if login.Code != http.StatusOK {
		t.Fatalf("expected login to succeed, got %d %s", login.Code, login.Body.String())
	}
	if strings.Contains(login.Body.String(), "session-token") {
		t.Fatalf("the token must stay out of the login body, got %s", login.Body.String())
	}
	cookies := login.Result().Cookies()
	if len(cookies) != 1 || cookies[0].Name != handlers.SessionCookieName || cookies[0].Value != "session-token" || !cookies[0].HttpOnly {
		t.Fatalf("expected the session in an httpOnly cookie, got %+v", cookies)
	}

	accounts := routerRequest(router, http.MethodGet, "/accounts", "", "", cookies[0].Value)
	if accounts.Code != http.StatusOK || !strings.Contains(accounts.Body.String(), `"name":"main"`) {
		t.Fatalf("expected the session's accounts, got %d %s", accounts.Code, accounts.Body.String())
	}
	supabase.last(http.MethodGet, accountsTable).asUser(t, "session-token", "user_id")
}

func TestRouterRefusesCrossSiteStateChanges(t *testing.T) {
	supabase := newFakeSupabase(t)
	router := newServerRouter(t, server.Config{})

	recorder := routerRequest(router, http.MethodPost, "/auth/login", `{"email":"trader@example.com","password":"secret123"}`, "https://evil.example", "")
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected %d, got %d", http.StatusForbidden, recorder.Code)
	}
	if n := supabase.total(); n != 0 {
		t.Fatalf("a cross-site login must not reach Supabase, got %d requests", n)
	}
}

func TestRouterRefusesOversizedBodies(t *testing.T) {
	supabase := newFakeSupabase(t)
	router := newServerRouter(t, server.Config{})
	body := `{"name":"` + strings.Repeat("a", 64<<10) + `"}`

	recorder := routerRequest(router, http.MethodPost, "/accounts", body, appOrigin, "user-token")
	if recorder.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected %d, got %d", http.StatusRequestEntityTooLarge, recorder.Code)
	}
	if n := supabase.total(); n != 0 {
		t.Fatalf("an oversized body must not reach Supabase, got %d requests", n)
	}
}

func TestRouterLimitsSignupsPerClient(t *testing.T) {
	newFakeSupabase(t)
	router := newServerRouter(t, server.Config{})

	// invalid bodies still spend the budget, without sending any email
	for i := 0; i < 5; i++ {
		if recorder := routerRequest(router, http.MethodPost, "/auth/signup", `{}`, appOrigin, ""); recorder.Code != http.StatusBadRequest {
			t.Fatalf("signup %d: expected %d, got %d", i+1, http.StatusBadRequest, recorder.Code)
		}
	}
	recorder := routerRequest(router, http.MethodPost, "/auth/signup", `{}`, appOrigin, "")
	if recorder.Code != http.StatusTooManyRequests || recorder.Header().Get("Retry-After") == "" {
		t.Fatalf("expected the sixth signup to be limited with Retry-After, got %d %v", recorder.Code, recorder.Header())
	}
	// resends have a budget of their own
	if recorder := routerRequest(router, http.MethodPost, "/auth/resend", `{}`, appOrigin, ""); recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected resend to have its own budget, got %d", recorder.Code)
	}
}

// loginsUntilLimited sends logins for different email addresses from one client address, returning
// which attempt was first refused with 429 (0 when none of max were).
func loginsUntilLimited(router *gin.Engine, max int) int {
	for i := 1; i <= max; i++ {
		if recorder := routerRequest(router, http.MethodPost, "/auth/login", `not json`, appOrigin, ""); recorder.Code == http.StatusTooManyRequests {
			return i
		}
	}
	return 0
}

func TestRouterLimitsLoginsPerClientIPOnlyBehindATrustedProxy(t *testing.T) {
	newFakeSupabase(t)

	if got := loginsUntilLimited(newServerRouter(t, server.Config{TrustedProxies: []string{"192.0.2.1"}}), 40); got != 31 {
		t.Fatalf("behind a trusted proxy: expected the 31st login to be limited, got %d", got)
	}
	if got := loginsUntilLimited(newServerRouter(t, server.Config{}), 40); got != 0 {
		t.Fatalf("without a trusted proxy every client shares an address, so none may be limited by it; attempt %d was", got)
	}
}

func TestNewRouterRejectsInvalidTrustedProxies(t *testing.T) {
	gin.SetMode(gin.TestMode)

	if _, err := server.NewRouter(server.Config{TrustedProxies: []string{"not-an-address"}}); err == nil {
		t.Fatal("expected an error for an invalid trusted proxy")
	}
}

func TestConfigFromEnv(t *testing.T) {
	cases := []struct {
		name             string
		proxies, origins string
		want             server.Config
	}{
		{"defaults", "", "", server.Config{AppOrigins: []string{"http://localhost:3000"}}},
		{"blank entries", " , ", ",", server.Config{AppOrigins: []string{"http://localhost:3000"}}},
		{
			"lists", " 10.0.0.1 ,10.1.0.0/16", "https://fxtrax.app, https://test.fxtrax.app ",
			server.Config{TrustedProxies: []string{"10.0.0.1", "10.1.0.0/16"}, AppOrigins: []string{"https://fxtrax.app", "https://test.fxtrax.app"}},
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			t.Setenv("TRUSTED_PROXIES", tc.proxies)
			t.Setenv("APP_ORIGINS", tc.origins)

			if got := server.ConfigFromEnv(); !reflect.DeepEqual(got, tc.want) {
				t.Fatalf("expected %+v, got %+v", tc.want, got)
			}
		})
	}
}
