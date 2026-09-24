package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
)

// fakeClock is a settable clock for the limiter.
type fakeClock struct{ now time.Time }

func (c *fakeClock) Now() time.Time          { return c.now }
func (c *fakeClock) Advance(d time.Duration) { c.now = c.now.Add(d) }

func newLimiter(limit int, window time.Duration) (*handlers.RateLimiter, *fakeClock) {
	clock := &fakeClock{now: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
	return &handlers.RateLimiter{Limit: limit, Window: window, Now: clock.Now}, clock
}

func TestRateLimiterAllowsUpToTheLimitThenReportsRetryAfter(t *testing.T) {
	limiter, clock := newLimiter(2, time.Minute)

	for i := 0; i < 2; i++ {
		if ok, _ := limiter.Allow("a"); !ok {
			t.Fatalf("request %d should be allowed", i+1)
		}
		clock.Advance(10 * time.Second)
	}
	ok, retryAfter := limiter.Allow("a")
	if ok {
		t.Fatal("the third request inside the window should be refused")
	}
	// the first request was 20s ago, so it leaves the window in 40s
	if retryAfter != 40*time.Second {
		t.Fatalf("expected retry after 40s, got %v", retryAfter)
	}
}

func TestRateLimiterWindowRolls(t *testing.T) {
	limiter, clock := newLimiter(1, time.Minute)

	limiter.Allow("a")
	clock.Advance(59 * time.Second)
	if ok, _ := limiter.Allow("a"); ok {
		t.Fatal("expected a refusal inside the window")
	}
	clock.Advance(time.Second)
	if ok, _ := limiter.Allow("a"); !ok {
		t.Fatal("expected the request to be allowed once the first left the window")
	}
}

func TestRateLimiterRefusedRequestsDontExtendTheWait(t *testing.T) {
	limiter, clock := newLimiter(1, time.Minute)

	limiter.Allow("a")
	for i := 0; i < 5; i++ {
		clock.Advance(10 * time.Second)
		limiter.Allow("a")
	}
	clock.Advance(10 * time.Second) // a minute after the only allowed request
	if ok, _ := limiter.Allow("a"); !ok {
		t.Fatal("refused requests must not count against the budget")
	}
}

func TestRateLimiterKeysAreIndependent(t *testing.T) {
	limiter, _ := newLimiter(1, time.Minute)

	limiter.Allow("a")
	if ok, _ := limiter.Allow("b"); !ok {
		t.Fatal("one client's usage must not limit another")
	}
}

func newRateLimitedRouter(t *testing.T, limiter *handlers.RateLimiter, trusted []string) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	router := gin.New()
	if err := router.SetTrustedProxies(trusted); err != nil {
		t.Fatalf("invalid trusted proxies: %v", err)
	}
	router.POST("/limited", handlers.RateLimitByClientIP(limiter), func(c *gin.Context) { c.Status(http.StatusNoContent) })
	return router
}

func limitedRequest(router *gin.Engine, remoteAddr, forwardedFor string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/limited", nil)
	req.RemoteAddr = remoteAddr
	if forwardedFor != "" {
		req.Header.Set("X-Forwarded-For", forwardedFor)
	}
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestRateLimitMiddlewareReturns429WithRetryAfter(t *testing.T) {
	limiter, clock := newLimiter(1, time.Minute)
	router := newRateLimitedRouter(t, limiter, nil)

	if got := limitedRequest(router, "198.51.100.7:4000", "").Code; got != http.StatusNoContent {
		t.Fatalf("expected the first request through, got %d", got)
	}
	clock.Advance(30500 * time.Millisecond)
	recorder := limitedRequest(router, "198.51.100.7:4000", "")
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("expected %d, got %d", http.StatusTooManyRequests, recorder.Code)
	}
	// 29.5s left, rounded up so the client never retries too early
	if got := recorder.Header().Get("Retry-After"); got != "30" {
		t.Fatalf("expected Retry-After 30, got %q", got)
	}
}

func TestRateLimitMiddlewareIgnoresSpoofedForwardedForFromUntrustedPeers(t *testing.T) {
	limiter, _ := newLimiter(1, time.Minute)
	router := newRateLimitedRouter(t, limiter, nil)

	limitedRequest(router, "198.51.100.7:4000", "203.0.113.1")
	if got := limitedRequest(router, "198.51.100.7:4000", "203.0.113.2").Code; got != http.StatusTooManyRequests {
		t.Fatalf("a new X-Forwarded-For must not buy a fresh budget, got %d", got)
	}
}

func TestRateLimitMiddlewareUsesForwardedForFromATrustedProxy(t *testing.T) {
	limiter, _ := newLimiter(1, time.Minute)
	router := newRateLimitedRouter(t, limiter, []string{"10.0.0.1"})

	limitedRequest(router, "10.0.0.1:4000", "203.0.113.1")
	if got := limitedRequest(router, "10.0.0.1:4000", "203.0.113.2").Code; got != http.StatusNoContent {
		t.Fatalf("clients behind a trusted proxy should be limited separately, got %d", got)
	}
	if got := limitedRequest(router, "10.0.0.1:4000", "203.0.113.1").Code; got != http.StatusTooManyRequests {
		t.Fatalf("expected the first client to be limited, got %d", got)
	}
}
