package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthHandlerReturns200AndStatusPayload(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()

	NewRouter().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}

	if contentType := rr.Header().Get("Content-Type"); contentType != "application/json" {
		t.Fatalf("expected application/json content type, got %q", contentType)
	}

	body := rr.Body.String()
	if body == "" {
		t.Fatal("expected response body, got empty string")
	}
}
