package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
)

// fakeAuthService returns canned results and records what the handler passed down.
type fakeAuthService struct {
	session models.SessionResponse
	user    models.UserResponse
	signup  models.SignupResponse
	err     error

	gotEmail, gotPassword, gotToken string
}

func (f *fakeAuthService) CreateSession(ctx context.Context, email, password string) (models.SessionResponse, error) {
	f.gotEmail, f.gotPassword = email, password
	return f.session, f.err
}

func (f *fakeAuthService) Signup(ctx context.Context, email, password string) (models.SignupResponse, error) {
	f.gotEmail, f.gotPassword = email, password
	return f.signup, f.err
}

func (f *fakeAuthService) ResendConfirmation(ctx context.Context, email string) error {
	f.gotEmail = email
	return f.err
}

func (f *fakeAuthService) GetUser(ctx context.Context, authToken string) (models.UserResponse, error) {
	f.gotToken = authToken
	return f.user, f.err
}

func TestAuthHandlerCreateSessionSuccess(t *testing.T) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	body, _ := json.Marshal(map[string]string{"email": "user@example.com", "password": "password"})
	c.Request = httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	h := &handlers.AuthHandler{
		Service: &fakeAuthService{session: models.SessionResponse{
			AccessToken: "test-access-token",
			User:        models.UserResponse{Email: "user@example.com"},
		}},
		Provider: &handlers.HandlerProvider{},
	}

	h.CreateSession(c)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
	if body := recorder.Body.String(); strings.Contains(body, "app_metadata") || strings.Contains(body, "identities") {
		t.Fatalf("expected response to omit raw Supabase user fields, got %s", body)
	}
}

func TestAuthHandlerCreateSessionInvalidBody(t *testing.T) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader([]byte("not-json")))
	c.Request.Header.Set("Content-Type", "application/json")

	h := &handlers.AuthHandler{
		Service:  &fakeAuthService{},
		Provider: &handlers.HandlerProvider{},
	}

	h.CreateSession(c)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestAuthHandlerCreateSessionServiceError(t *testing.T) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	body, _ := json.Marshal(map[string]string{"email": "user@example.com", "password": "wrong-password"})
	c.Request = httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	h := &handlers.AuthHandler{
		Service:  &fakeAuthService{err: errors.New("invalid credentials")},
		Provider: &handlers.HandlerProvider{},
	}

	h.CreateSession(c)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
}

func TestAuthHandlerGetUserSuccess(t *testing.T) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodGet, "/auth/user", nil)
	c.Request.Header.Set("Authorization", "Bearer test-token")

	h := &handlers.AuthHandler{
		Service:  &fakeAuthService{user: models.UserResponse{Email: "user@example.com"}},
		Provider: &handlers.HandlerProvider{},
	}

	h.GetUser(c)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
	if body := recorder.Body.String(); strings.Contains(body, "app_metadata") || strings.Contains(body, "identities") {
		t.Fatalf("expected response to omit raw Supabase user fields, got %s", body)
	}
}

func TestAuthHandlerGetUserMissingAuthHeader(t *testing.T) {
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodGet, "/auth/user", nil)

	h := &handlers.AuthHandler{
		Service:  &fakeAuthService{},
		Provider: &handlers.HandlerProvider{},
	}

	h.GetUser(c)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}
