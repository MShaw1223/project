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

// accountsService is the dependency AccountsHandler needs, so tests can
// inject a fake service instead of a real one.
type accountsService interface {
	GetUserAccounts(ctx context.Context, token string) ([]models.BrokerageAccount, error)
	CreateAccount(ctx context.Context, token, name string) (*models.BrokerageAccount, error)
	UpdateAccount(ctx context.Context, token, accountID, name string) (*models.BrokerageAccount, error)
	DeleteAccount(ctx context.Context, token, accountID string) error
}

type AccountsHandler struct {
	Service  accountsService
	Provider *HandlerProvider
}

func (h *AccountsHandler) GetUserAccounts(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	accounts, err := h.Service.GetUserAccounts(c.Request.Context(), token)
	if err != nil {
		respondAccountError(c, err, "failed to get user accounts")
		return
	}

	c.JSON(http.StatusOK, gin.H{"accounts": accounts})
}

func (h *AccountsHandler) CreateAccount(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	var req models.AccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	account, err := h.Service.CreateAccount(c.Request.Context(), token, req.Name)
	if err != nil {
		respondAccountError(c, err, "failed to create account")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"account": account})
}

func (h *AccountsHandler) UpdateAccount(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	accountID, ok := accountIDParam(c)
	if !ok {
		return
	}
	var req models.AccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	account, err := h.Service.UpdateAccount(c.Request.Context(), token, accountID, req.Name)
	if err != nil {
		respondAccountError(c, err, "failed to update account")
		return
	}

	c.JSON(http.StatusOK, gin.H{"account": account})
}

func (h *AccountsHandler) DeleteAccount(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}
	accountID, ok := accountIDParam(c)
	if !ok {
		return
	}

	if err := h.Service.DeleteAccount(c.Request.Context(), token, accountID); err != nil {
		respondAccountError(c, err, "failed to delete account")
		return
	}

	c.Status(http.StatusNoContent)
}

// accountIDParam validates the :id path parameter so malformed ids never reach the database.
func accountIDParam(c *gin.Context) (string, bool) {
	id, ok := uuidParam(c, "id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
	}
	return id, ok
}

func respondAccountError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account name"})
	case errors.Is(err, repositories.ErrUnauthenticated):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
	case errors.Is(err, repositories.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
	default:
		log.Printf("%s: %v", fallback, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fallback})
	}
}
