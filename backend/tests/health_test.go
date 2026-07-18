package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
)

func TestHealthHandlerReturns200AndStatusPayload(t *testing.T) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodGet, "/health", nil)

	healthHandler := &handlers.HealthHandler{}
	healthHandler.Handle(c)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json; charset=utf-8" {
		t.Fatalf("expected application/json content type, got %q", contentType)
	}

	var healthResp models.HealthResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &healthResp); err != nil {
		t.Fatal("failed to parse response body:", err)
	}
	if healthResp.Status == "" {
		t.Fatal("expected response body, got empty string")
	}
}

