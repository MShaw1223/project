package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
)

func newContext(header, cookie string) (*gin.Context, *httptest.ResponseRecorder) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodGet, "/auth/user", nil)
	if header != "" {
		c.Request.Header.Set("Authorization", header)
	}
	if cookie != "" {
		c.Request.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: cookie})
	}
	return c, recorder
}

func TestParseAuthHeaderReadsBearerHeader(t *testing.T) {
	c, _ := newContext("Bearer header-token", "")
	token, err := (&handlers.HandlerProvider{}).ParseAuthHeader(c)
	if err != nil || token != "header-token" {
		t.Fatalf("expected header-token, got %q (err %v)", token, err)
	}
}

func TestParseAuthHeaderFallsBackToCookie(t *testing.T) {
	c, _ := newContext("", "cookie-token")
	token, err := (&handlers.HandlerProvider{}).ParseAuthHeader(c)
	if err != nil || token != "cookie-token" {
		t.Fatalf("expected cookie-token, got %q (err %v)", token, err)
	}
}

func TestParseAuthHeaderRejectsMissingCredentials(t *testing.T) {
	c, recorder := newContext("", "")
	if _, err := (&handlers.HandlerProvider{}).ParseAuthHeader(c); err == nil {
		t.Fatal("expected an error when neither header nor cookie is present")
	}
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestDeleteSessionClearsCookie(t *testing.T) {
	c, recorder := newContext("", "cookie-token")
	(&handlers.AuthHandler{}).DeleteSession(c)
	c.Writer.WriteHeaderNow()

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, recorder.Code)
	}
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 || cookies[0].Name != handlers.SessionCookieName || cookies[0].MaxAge >= 0 || !cookies[0].HttpOnly {
		t.Fatalf("expected an expired httpOnly %s cookie, got %+v", handlers.SessionCookieName, cookies)
	}
}
