package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

// tradesService is the dependency TradesHandler needs, so tests can inject a fake service instead
// of a real one.
type tradesService interface {
	GetUserTrades(ctx context.Context, token, accountID string) ([]models.Trade, error)
	CreateTrade(ctx context.Context, token string, req models.TradeRequest) (*models.Trade, error)
	DeleteTrade(ctx context.Context, token, tradeID string) error
}

type TradesHandler struct {
	Service  tradesService
	Provider *HandlerProvider
}

func (h *TradesHandler) GetUserTrades(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	accountID := c.Query("account_id")
	if _, err := uuid.Parse(accountID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or missing account_id"})
		return
	}

	trades, err := h.Service.GetUserTrades(c.Request.Context(), token, accountID)
	if err != nil {
		respondTradeError(c, err, "failed to get trades")
		return
	}

	c.JSON(http.StatusOK, gin.H{"trades": trades})
}

func (h *TradesHandler) CreateTrade(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	var req models.TradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	trade, err := h.Service.CreateTrade(c.Request.Context(), token, req)
	if err != nil {
		respondTradeError(c, err, "failed to create trade")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"trade": trade})
}

func (h *TradesHandler) DeleteTrade(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	tradeID, ok := uuidParam(c, "id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid trade id"})
		return
	}

	if err := h.Service.DeleteTrade(c.Request.Context(), token, tradeID); err != nil {
		respondTradeError(c, err, "failed to delete trade")
		return
	}

	c.Status(http.StatusNoContent)
}

// uuidParam reports whether the named path parameter is a valid uuid, leaving the caller to write
// its own error response so callers can use a message specific to what the id names.
func uuidParam(c *gin.Context, name string) (string, bool) {
	id := c.Param(name)
	if _, err := uuid.Parse(id); err != nil {
		return "", false
	}
	return id, true
}

func respondTradeError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid trade"})
	case errors.Is(err, repositories.ErrUnauthenticated):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
	case errors.Is(err, repositories.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "trade not found"})
	default:
		log.Printf("%s: %v", fallback, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fallback})
	}
}
