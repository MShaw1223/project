package tests

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

func newAuthRouter(svc *fakeAuthService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.AuthHandler{Service: svc, Provider: &handlers.HandlerProvider{}}
	router.POST("/auth/login", h.CreateSession)
	router.POST("/auth/signup", h.Signup)
	router.POST("/auth/resend", h.ResendConfirmation)
	router.POST("/auth/logout", h.DeleteSession)
	router.GET("/auth/user", h.GetUser)
	return router
}

func postJSON(router *gin.Engine, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestLoginSetsHttpOnlyCookieAndKeepsTokenOutOfBody(t *testing.T) {
	svc := &fakeAuthService{session: models.SessionResponse{
		AccessToken: "secret-token",
		ExpiresIn:   3600,
		User:        models.UserResponse{Email: "trader@example.com"},
	}}
	recorder := postJSON(newAuthRouter(svc), "/auth/login", `{"email":"trader@example.com","password":"secret123"}`)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d", http.StatusOK, recorder.Code)
	}
	if svc.gotEmail != "trader@example.com" || svc.gotPassword != "secret123" {
		t.Fatalf("credentials not passed to the service: %q %q", svc.gotEmail, svc.gotPassword)
	}
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("expected one cookie, got %+v", cookies)
	}
	c := cookies[0]
	if c.Name != handlers.SessionCookieName || c.Value != "secret-token" || !c.HttpOnly || c.MaxAge != 3600 || c.Path != "/" || c.SameSite != http.SameSiteLaxMode {
		t.Fatalf("unexpected session cookie: %+v", c)
	}
	if c.Secure {
		t.Fatal("cookie must not be Secure over plain http, it would never be sent on localhost")
	}
	if strings.Contains(recorder.Body.String(), "secret-token") {
		t.Fatalf("access token leaked into the response body: %s", recorder.Body.String())
	}
	var body struct {
		User struct{ Email string } `json:"user"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil || body.User.Email != "trader@example.com" {
		t.Fatalf("expected the user in the body, got %s (err %v)", recorder.Body.String(), err)
	}
}

func TestLoginCookieIsSecureBehindHttpsProxy(t *testing.T) {
	svc := &fakeAuthService{session: models.SessionResponse{AccessToken: "t", ExpiresIn: 60}}
	req := httptest.NewRequest(http.MethodPost, "/auth/login", strings.NewReader(`{"email":"a@b.co","password":"secret123"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Forwarded-Proto", "https")
	recorder := httptest.NewRecorder()
	newAuthRouter(svc).ServeHTTP(recorder, req)

	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 || !cookies[0].Secure {
		t.Fatalf("expected a Secure cookie for https, got %+v", cookies)
	}
}

func TestLoginFailureSetsNoCookie(t *testing.T) {
	svc := &fakeAuthService{err: errors.New("invalid credentials")}
	recorder := postJSON(newAuthRouter(svc), "/auth/login", `{"email":"a@b.co","password":"wrong"}`)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
	if len(recorder.Result().Cookies()) != 0 {
		t.Fatalf("no cookie may be set on a failed login, got %+v", recorder.Result().Cookies())
	}
}

func TestSignupCreatesUserWithoutStartingSession(t *testing.T) {
	svc := &fakeAuthService{signup: models.SignupResponse{User: models.UserResponse{Email: "trader@example.com"}}}
	recorder := postJSON(newAuthRouter(svc), "/auth/signup", `{"email":"trader@example.com","password":"secret123"}`)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d (%s)", http.StatusCreated, recorder.Code, recorder.Body.String())
	}
	if svc.gotEmail != "trader@example.com" || svc.gotPassword != "secret123" {
		t.Fatalf("credentials not passed to the service: %q %q", svc.gotEmail, svc.gotPassword)
	}
	if len(recorder.Result().Cookies()) != 0 {
		t.Fatalf("signing up must not start a session, got cookies %+v", recorder.Result().Cookies())
	}
}

func TestSignupRejectsInvalidBody(t *testing.T) {
	recorder := postJSON(newAuthRouter(&fakeAuthService{}), "/auth/signup", `not json`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestSignupMapsServiceErrors(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"invalid input", services.ErrInvalidInput, http.StatusBadRequest},
		{"rejected by supabase", repositories.ErrSignupRejected, http.StatusBadRequest},
		{"wrapped rejection", errors.Join(errors.New("ctx"), repositories.ErrSignupRejected), http.StatusBadRequest},
		{"supabase unavailable", errors.New("supabase client unavailable"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		recorder := postJSON(newAuthRouter(&fakeAuthService{err: tc.err}), "/auth/signup", `{"email":"a@b.co","password":"secret123"}`)
		if recorder.Code != tc.want {
			t.Errorf("%s: expected %d, got %d", tc.name, tc.want, recorder.Code)
		}
	}
}

func TestGetUserUsesCookieToken(t *testing.T) {
	svc := &fakeAuthService{user: models.UserResponse{Email: "trader@example.com"}}
	req := httptest.NewRequest(http.MethodGet, "/auth/user", nil)
	req.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: "cookie-token"})
	recorder := httptest.NewRecorder()
	newAuthRouter(svc).ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d", http.StatusOK, recorder.Code)
	}
	if svc.gotToken != "cookie-token" {
		t.Fatalf("expected the cookie token to reach the service, got %q", svc.gotToken)
	}
}

func TestSignupReportsWhetherEmailConfirmationIsRequired(t *testing.T) {
	for _, required := range []bool{true, false} {
		svc := &fakeAuthService{signup: models.SignupResponse{
			User:                      models.UserResponse{Email: "trader@example.com"},
			EmailConfirmationRequired: required,
		}}
		recorder := postJSON(newAuthRouter(svc), "/auth/signup", `{"email":"trader@example.com","password":"secret123"}`)

		var body struct {
			User struct {
				Email string `json:"email"`
			} `json:"user"`
			EmailConfirmationRequired bool `json:"email_confirmation_required"`
		}
		if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
			t.Fatalf("expected a json body, got %s", recorder.Body.String())
		}
		if body.User.Email != "trader@example.com" || body.EmailConfirmationRequired != required {
			t.Fatalf("expected the user and email_confirmation_required=%v, got %s", required, recorder.Body.String())
		}
	}
}

func TestLoginWithAnUnconfirmedEmailReturns403WithoutACookie(t *testing.T) {
	svc := &fakeAuthService{err: fmt.Errorf("wrapped: %w", repositories.ErrEmailNotConfirmed)}
	recorder := postJSON(newAuthRouter(svc), "/auth/login", `{"email":"trader@example.com","password":"secret123"}`)

	if recorder.Code != http.StatusForbidden || !strings.Contains(recorder.Body.String(), "email not confirmed") {
		t.Fatalf("expected 403 email not confirmed, got %d %s", recorder.Code, recorder.Body.String())
	}
	if len(recorder.Result().Cookies()) != 0 {
		t.Fatalf("an unconfirmed login must not set a cookie, got %+v", recorder.Result().Cookies())
	}
}

func TestLoginWithWrongCredentialsReturns401WithoutACookie(t *testing.T) {
	svc := &fakeAuthService{err: fmt.Errorf("wrapped: %w", repositories.ErrInvalidCredentials)}
	recorder := postJSON(newAuthRouter(svc), "/auth/login", `{"email":"trader@example.com","password":"wrong-password"}`)

	if recorder.Code != http.StatusUnauthorized || !strings.Contains(recorder.Body.String(), "invalid email or password") {
		t.Fatalf("expected 401 invalid email or password, got %d %s", recorder.Code, recorder.Body.String())
	}
	if len(recorder.Result().Cookies()) != 0 {
		t.Fatalf("a failed login must not set a cookie, got %+v", recorder.Result().Cookies())
	}
}

func TestResendConfirmationReturns204AndForwardsTheEmail(t *testing.T) {
	svc := &fakeAuthService{}
	recorder := postJSON(newAuthRouter(svc), "/auth/resend", `{"email":"trader@example.com"}`)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected %d, got %d (%s)", http.StatusNoContent, recorder.Code, recorder.Body.String())
	}
	if svc.gotEmail != "trader@example.com" {
		t.Fatalf("expected the email to reach the service, got %q", svc.gotEmail)
	}
}

func TestResendConfirmationMapsErrors(t *testing.T) {
	cases := []struct {
		name string
		body string
		err  error
		want int
	}{
		{"malformed body", `not json`, nil, http.StatusBadRequest},
		{"invalid email", `{"email":"nope"}`, services.ErrInvalidInput, http.StatusBadRequest},
		{"rate limited", `{"email":"trader@example.com"}`, repositories.ErrRateLimited, http.StatusTooManyRequests},
		{"unexpected", `{"email":"trader@example.com"}`, errors.New("supabase down"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			recorder := postJSON(newAuthRouter(&fakeAuthService{err: tc.err}), "/auth/resend", tc.body)
			if recorder.Code != tc.want {
				t.Fatalf("expected %d, got %d (%s)", tc.want, recorder.Code, recorder.Body.String())
			}
		})
	}
}
