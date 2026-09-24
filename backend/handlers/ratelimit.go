package handlers

import (
	"math"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter allows each key at most Limit requests in any rolling Window. It keeps state in memory,
// so limits reset on restart and aren't shared between server instances.
type RateLimiter struct {
	Limit  int
	Window time.Duration
	// Now is the clock, tests swap it out; nil means time.Now.
	Now func() time.Time

	mu        sync.Mutex
	hits      map[string][]time.Time
	lastSweep time.Time
}

// Allow records a request for key and reports whether it's within the limit. When it isn't, retryAfter
// is how long until the oldest request leaves the window and another is allowed.
func (l *RateLimiter) Allow(key string) (allowed bool, retryAfter time.Duration) {
	now := l.now()
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.hits == nil {
		l.hits = map[string][]time.Time{}
	}
	l.sweep(now)

	recent := l.hits[key][:0]
	for _, hit := range l.hits[key] {
		if now.Sub(hit) < l.Window {
			recent = append(recent, hit)
		}
	}
	if len(recent) >= l.Limit {
		l.hits[key] = recent
		return false, recent[0].Add(l.Window).Sub(now)
	}
	l.hits[key] = append(recent, now)
	return true, 0
}

// sweep drops keys with no requests inside the window, at most once per window, so memory stays bounded
// by the number of clients seen recently.
func (l *RateLimiter) sweep(now time.Time) {
	if now.Sub(l.lastSweep) < l.Window {
		return
	}
	l.lastSweep = now
	for key, hits := range l.hits {
		if len(hits) == 0 || now.Sub(hits[len(hits)-1]) >= l.Window {
			delete(l.hits, key)
		}
	}
}

func (l *RateLimiter) now() time.Time {
	if l.Now != nil {
		return l.Now()
	}
	return time.Now()
}

// RateLimitByClientIP rejects requests over the limiter's budget with 429 and a Retry-After header,
// keyed by gin's ClientIP. That is the connecting address unless the router trusts a proxy in front of
// it (see main.go), so a client can't pick its own key by sending X-Forwarded-For.
func RateLimitByClientIP(limiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		if allowed, retryAfter := limiter.Allow(c.ClientIP()); !allowed {
			respondTooManyRequests(c, retryAfter)
			return
		}
		c.Next()
	}
}

// respondTooManyRequests aborts with 429 and a Retry-After rounded up, so clients never retry early.
func respondTooManyRequests(c *gin.Context, retryAfter time.Duration) {
	c.Header("Retry-After", strconv.Itoa(int(math.Ceil(retryAfter.Seconds()))))
	c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests, try again later"})
}
