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

// currencyPairsService is the dependency CurrencyPairsHandler needs, so tests can inject a fake
// service instead of a real one.
type currencyPairsService interface {
	GetUserPairs(ctx context.Context, token string) ([]models.CurrencyPair, error)
	CreatePair(ctx context.Context, token, symbol string) (*models.CurrencyPair, error)
	DeletePair(ctx context.Context, token, pairID string) error
}

type CurrencyPairsHandler struct {
	Service  currencyPairsService
	Provider *HandlerProvider
}

func (h *CurrencyPairsHandler) GetUserPairs(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	pairs, err := h.Service.GetUserPairs(c.Request.Context(), token)
	if err != nil {
		respondCurrencyPairError(c, err, "failed to get currency pairs")
		return
	}

	c.JSON(http.StatusOK, gin.H{"pairs": pairs})
}

func (h *CurrencyPairsHandler) CreatePair(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	var req models.CurrencyPairRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	pair, err := h.Service.CreatePair(c.Request.Context(), token, req.Symbol)
	if err != nil {
		respondCurrencyPairError(c, err, "failed to create currency pair")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"pair": pair})
}

func (h *CurrencyPairsHandler) DeletePair(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	pairID, ok := uuidParam(c, "id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid currency pair id"})
		return
	}

	if err := h.Service.DeletePair(c.Request.Context(), token, pairID); err != nil {
		respondCurrencyPairError(c, err, "failed to delete currency pair")
		return
	}

	c.Status(http.StatusNoContent)
}

func respondCurrencyPairError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid currency pair"})
	case errors.Is(err, repositories.ErrUnauthenticated):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
	case errors.Is(err, repositories.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "currency pair not found"})
	default:
		log.Printf("%s: %v", fallback, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fallback})
	}
}
