package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

// authService is the dependency AuthHandler needs, so tests can inject a
// fake service instead of a real one.
type authService interface {
	CreateSession(ctx context.Context, email, password string) (models.SessionResponse, error)
	Signup(ctx context.Context, email, password string) (models.SignupResponse, error)
	GetUser(ctx context.Context, authToken string) (models.UserResponse, error)
	ResendConfirmation(ctx context.Context, email string) error
}

type AuthHandler struct {
	Service  authService
	Provider *HandlerProvider
	// LoginLimiter caps login attempts per email address against password guessing; nil disables it.
	LoginLimiter *RateLimiter
}

func (h *AuthHandler) CreateSession(c *gin.Context) {
	var loginReq models.LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if h.LoginLimiter != nil {
		key := strings.ToLower(strings.TrimSpace(loginReq.Email))
		if allowed, retryAfter := h.LoginLimiter.Allow(key); !allowed {
			respondTooManyRequests(c, retryAfter)
			return
		}
	}

	s, err := h.Service.CreateSession(c.Request.Context(), loginReq.Email, loginReq.Password)
	if err != nil {
		if errors.Is(err, repositories.ErrEmailNotConfirmed) {
			c.JSON(http.StatusForbidden, gin.H{"error": "email not confirmed"})
			return
		}
		if errors.Is(err, repositories.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
			return
		}
		log.Printf("failed to create session: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	// the token travels only in the httpOnly cookie, the body deliberately omits it
	setSessionCookie(c, s.AccessToken, s.ExpiresIn)
	c.JSON(http.StatusOK, gin.H{"user": s.User})
}

func (h *AuthHandler) Signup(c *gin.Context) {
	var req models.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	signup, err := h.Service.Signup(c.Request.Context(), req.Email, req.Password)
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email or password"})
	case errors.Is(err, repositories.ErrSignupRejected):
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not sign up with those details"})
	case err != nil:
		log.Printf("failed to sign up: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign up"})
	default:
		// signing up does not start a session, the client logs in afterwards (once the email is
		// confirmed, when the project requires it)
		c.JSON(http.StatusCreated, signup)
	}
}

func (h *AuthHandler) ResendConfirmation(c *gin.Context) {
	var req models.ResendConfirmationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	err := h.Service.ResendConfirmation(c.Request.Context(), req.Email)
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
	case errors.Is(err, repositories.ErrRateLimited):
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many requests, try again later"})
	case err != nil:
		log.Printf("failed to resend confirmation email: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to resend confirmation email"})
	default:
		c.Status(http.StatusNoContent)
	}
}

func (h *AuthHandler) DeleteSession(c *gin.Context) {
	setSessionCookie(c, "", -1)
	c.Status(http.StatusNoContent)
}

func (h *AuthHandler) GetUser(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	user, err := h.Service.GetUser(c.Request.Context(), token)
	if err != nil {
		log.Printf("failed to get user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
