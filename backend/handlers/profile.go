package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

// profileService is the dependency ProfileHandler needs, so tests can inject a fake service
// instead of a real one.
type profileService interface {
	UpdatePassword(ctx context.Context, token, password string) error
	DeleteAccount(ctx context.Context, token string) error
	GetProfile(ctx context.Context, token string) (models.Profile, error)
	UpdateUsername(ctx context.Context, token, username string) (models.Profile, error)
}

type ProfileHandler struct {
	Service  profileService
	Provider *HandlerProvider
}

func (h *ProfileHandler) UpdatePassword(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	var req models.UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.Service.UpdatePassword(c.Request.Context(), token, req.Password); err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidInput):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid password"})
		default:
			log.Printf("failed to update password: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *ProfileHandler) DeleteAccount(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	if err := h.Service.DeleteAccount(c.Request.Context(), token); err != nil {
		if errors.Is(err, repositories.ErrUnauthenticated) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
			return
		}
		log.Printf("failed to delete account: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete account"})
		return
	}

	// log the browser out immediately, the account is gone
	setSessionCookie(c, "", -1)
	c.Status(http.StatusNoContent)
}

func (h *ProfileHandler) GetProfile(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	profile, err := h.Service.GetProfile(c.Request.Context(), token)
	if err != nil {
		respondProfileError(c, err, "failed to get profile")
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": profile})
}

func (h *ProfileHandler) UpdateUsername(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	var req models.UpdateUsernameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	profile, err := h.Service.UpdateUsername(c.Request.Context(), token, req.Username)
	if err != nil {
		respondProfileError(c, err, "failed to update username")
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": profile})
}

func respondProfileError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid username"})
	case errors.Is(err, repositories.ErrConflict):
		c.JSON(http.StatusConflict, gin.H{"error": "username is already taken"})
	case errors.Is(err, repositories.ErrUnauthenticated):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
	case errors.Is(err, repositories.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
	default:
		log.Printf("%s: %v", fallback, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fallback})
	}
}
