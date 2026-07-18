package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/models"
)

type HealthHandler struct{}

func (h *HealthHandler) Handle(c *gin.Context) {
	c.JSON(http.StatusOK, models.HealthResponse{Status: "ok"})
}

