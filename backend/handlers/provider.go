package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const SessionCookieName = "access_token"

type HandlerProvider struct{}

// ParseAuthHeader returns the caller's access token, preferring an explicit Bearer header and
// falling back to the httpOnly session cookie set at login.
func (p *HandlerProvider) ParseAuthHeader(c *gin.Context) (string, error) {
	bearer := c.GetHeader("Authorization")
	if bearer == "" {
		if cookie, err := c.Cookie(SessionCookieName); err == nil && strings.TrimSpace(cookie) != "" {
			return strings.TrimSpace(cookie), nil
		}
	}
	parts := strings.SplitN(bearer, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid authorization header"})
		return "", fmt.Errorf("invalid authorization header")
	}
	token := strings.TrimSpace(parts[1])
	return token, nil
}

// setSessionCookie stores the access token where JS cannot read it. Secure is only set for https
// requests so the cookie still works on plain-http localhost.
func setSessionCookie(c *gin.Context, token string, maxAgeSeconds int) {
	secure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(SessionCookieName, token, maxAgeSeconds, "/", "", secure, true)
}
