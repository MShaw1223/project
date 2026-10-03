package tests

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
)

func TestSignupOverTheLimitIsRefusedBeforeTheService(t *testing.T) {
	limiter, _ := newLimiter(1, 15*time.Minute)
	svc := &fakeAuthService{signup: models.SignupResponse{User: models.UserResponse{Email: "trader@example.com"}}}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.AuthHandler{Service: svc, Provider: &handlers.HandlerProvider{}}
	router.POST("/auth/signup", handlers.RateLimitByClientIP(limiter), h.Signup)

	signup := func(email string) int {
		req := httptest.NewRequest(http.MethodPost, "/auth/signup", strings.NewReader(`{"email":"`+email+`","password":"secret123"}`))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = "198.51.100.7:4000"
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, req)
		return recorder.Code
	}

	if got := signup("first@example.com"); got != http.StatusCreated {
		t.Fatalf("expected the first signup through, got %d", got)
	}
	// a different address from the same client must not buy a fresh budget
	if got := signup("second@example.com"); got != http.StatusTooManyRequests {
		t.Fatalf("expected %d, got %d", http.StatusTooManyRequests, got)
	}
	if svc.gotEmail != "first@example.com" {
		t.Fatalf("the refused signup must not reach the service, last saw %q", svc.gotEmail)
	}
}
