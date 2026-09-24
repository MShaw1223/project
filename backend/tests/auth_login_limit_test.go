package tests

import (
	"net/http"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/repositories"
)

func TestLoginIsRateLimitedPerEmail(t *testing.T) {
	limiter, _ := newLimiter(2, time.Minute)
	svc := &fakeAuthService{err: repositories.ErrInvalidCredentials}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.AuthHandler{Service: svc, Provider: &handlers.HandlerProvider{}, LoginLimiter: limiter}
	router.POST("/auth/login", h.CreateSession)

	for i := 0; i < 2; i++ {
		if got := postJSON(router, "/auth/login", `{"email":"Trader@Example.com","password":"guess"}`).Code; got != http.StatusUnauthorized {
			t.Fatalf("attempt %d: expected the login to be tried, got %d", i+1, got)
		}
	}
	// same address in different case and spacing shares the budget
	recorder := postJSON(router, "/auth/login", `{"email":"  trader@example.com ","password":"guess"}`)
	if recorder.Code != http.StatusTooManyRequests || recorder.Header().Get("Retry-After") == "" {
		t.Fatalf("expected 429 with Retry-After, got %d %v", recorder.Code, recorder.Header())
	}
	if got := postJSON(router, "/auth/login", `{"email":"other@example.com","password":"guess"}`).Code; got != http.StatusUnauthorized {
		t.Fatalf("another address must not be limited, got %d", got)
	}
}
