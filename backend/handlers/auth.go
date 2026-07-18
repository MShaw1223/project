package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/services"
)

type AuthHandler struct {
	Service *services.AuthService
	Provider *HandlerProvider
}

func (h *AuthHandler) CreateSession(c *gin.Context) {
	var loginReq models.LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	s, err := h.Service.CreateSession(loginReq.Email, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"session": s})
}


func (h *AuthHandler) GetUser(c *gin.Context) {
	token, err := h.Provider.ParseAuthHeader(c)
	if err != nil {
		return
	}

	user, err := h.Service.GetUser(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}