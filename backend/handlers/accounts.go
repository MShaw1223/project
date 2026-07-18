package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/services"
)

type AccountsHandler struct {
	Service *services.AccountsService
	Provider *HandlerProvider
}

func (h *AccountsHandler) GetUserAccounts(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	accounts, err := h.Service.GetUserAccounts(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user accounts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"accounts": accounts})
}