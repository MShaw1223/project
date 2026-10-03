package tests

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
)

// newBodyLimitRouter echoes how many body bytes the handler could read, or 400 when reading failed.
func newBodyLimitRouter(handlerCalled *bool) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(handlers.LimitRequestBody(10))
	router.POST("/thing", func(c *gin.Context) {
		*handlerCalled = true
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		c.String(http.StatusOK, "%d", len(body))
	})
	return router
}

func TestLimitRequestBodyLetsBodiesUpToTheLimitThrough(t *testing.T) {
	var called bool
	recorder := httptest.NewRecorder()
	newBodyLimitRouter(&called).ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/thing", strings.NewReader("0123456789")))

	if recorder.Code != http.StatusOK || recorder.Body.String() != "10" {
		t.Fatalf("expected the whole 10 byte body to be read, got %d %q", recorder.Code, recorder.Body.String())
	}
}

func TestLimitRequestBodyRefusesALargeDeclaredLengthBeforeTheHandler(t *testing.T) {
	var called bool
	recorder := httptest.NewRecorder()
	newBodyLimitRouter(&called).ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/thing", strings.NewReader("01234567890")))

	if recorder.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected %d, got %d", http.StatusRequestEntityTooLarge, recorder.Code)
	}
	if called {
		t.Fatal("the handler must not run for an oversized body")
	}
}

func TestLimitRequestBodyStopsReadingAnUndeclaredLengthAtTheLimit(t *testing.T) {
	var called bool
	req := httptest.NewRequest(http.MethodPost, "/thing", strings.NewReader("01234567890"))
	req.ContentLength = -1 // chunked: the size is only known by reading
	recorder := httptest.NewRecorder()
	newBodyLimitRouter(&called).ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected reading past the limit to fail with %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}
