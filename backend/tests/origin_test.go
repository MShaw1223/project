package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
)

func newOriginRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(handlers.RequireSameOrigin([]string{"http://localhost:3000/"}))
	ok := func(c *gin.Context) { c.Status(http.StatusNoContent) }
	router.GET("/thing", ok)
	router.POST("/thing", ok)
	router.PUT("/thing", ok)
	router.DELETE("/thing", ok)
	return router
}

func originRequest(method string, headers map[string]string) int {
	req := httptest.NewRequest(method, "/thing", nil)
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	recorder := httptest.NewRecorder()
	newOriginRouter().ServeHTTP(recorder, req)
	return recorder.Code
}

func TestRequireSameOrigin(t *testing.T) {
	cases := []struct {
		name    string
		method  string
		headers map[string]string
		want    int
	}{
		{"same origin post", http.MethodPost, map[string]string{"Origin": "http://localhost:3000", "Sec-Fetch-Site": "same-origin"}, http.StatusNoContent},
		{"no origin (curl)", http.MethodPost, nil, http.StatusNoContent},
		{"foreign origin post", http.MethodPost, map[string]string{"Origin": "https://evil.example"}, http.StatusForbidden},
		{"null origin", http.MethodPost, map[string]string{"Origin": "null"}, http.StatusForbidden},
		{"cross-site fetch metadata", http.MethodPost, map[string]string{"Sec-Fetch-Site": "cross-site"}, http.StatusForbidden},
		{"foreign origin put", http.MethodPut, map[string]string{"Origin": "https://evil.example"}, http.StatusForbidden},
		{"foreign origin delete", http.MethodDelete, map[string]string{"Origin": "https://evil.example"}, http.StatusForbidden},
		{"cross-site get is a read", http.MethodGet, map[string]string{"Origin": "https://evil.example", "Sec-Fetch-Site": "cross-site"}, http.StatusNoContent},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := originRequest(tc.method, tc.headers); got != tc.want {
				t.Fatalf("expected %d, got %d", tc.want, got)
			}
		})
	}
}
