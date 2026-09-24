package tests

import (
	"context"
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

// fakeProfileService returns canned results and records what the handler passed down.
type fakeProfileService struct {
	err     error
	profile models.Profile

	gotToken, gotPassword, gotUsername string
	deleteCalls                        int
}

func (f *fakeProfileService) GetProfile(ctx context.Context, token string) (models.Profile, error) {
	f.gotToken = token
	return f.profile, f.err
}

func (f *fakeProfileService) UpdateUsername(ctx context.Context, token, username string) (models.Profile, error) {
	f.gotToken, f.gotUsername = token, username
	return f.profile, f.err
}

func (f *fakeProfileService) UpdatePassword(ctx context.Context, token, password string) error {
	f.gotToken, f.gotPassword = token, password
	return f.err
}

func (f *fakeProfileService) DeleteAccount(ctx context.Context, token string) error {
	f.deleteCalls++
	f.gotToken = token
	return f.err
}

func newProfileFlowRouter(svc *fakeProfileService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	h := &handlers.ProfileHandler{Service: svc, Provider: &handlers.HandlerProvider{}}
	router.PUT("/profile/password", h.UpdatePassword)
	router.DELETE("/profile", h.DeleteAccount)
	router.GET("/profile", h.GetProfile)
	router.PUT("/profile/username", h.UpdateUsername)
	return router
}

func profileRequest(router *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: handlers.SessionCookieName, Value: "cookie-token"})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestUpdatePasswordReturns204AndForwardsToken(t *testing.T) {
	svc := &fakeProfileService{}
	recorder := profileRequest(newProfileFlowRouter(svc), http.MethodPut, "/profile/password", `{"password":"new-password"}`)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected %d, got %d (%s)", http.StatusNoContent, recorder.Code, recorder.Body.String())
	}
	if svc.gotToken != "cookie-token" || svc.gotPassword != "new-password" {
		t.Fatalf("expected token and password to reach the service, got %q %q", svc.gotToken, svc.gotPassword)
	}
}

func TestUpdatePasswordRejectsInvalidBody(t *testing.T) {
	recorder := profileRequest(newProfileFlowRouter(&fakeProfileService{}), http.MethodPut, "/profile/password", `not json`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestUpdatePasswordMapsServiceErrors(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"invalid input", services.ErrInvalidInput, http.StatusBadRequest},
		{"unexpected", errors.New("supabase unavailable"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		recorder := profileRequest(newProfileFlowRouter(&fakeProfileService{err: tc.err}), http.MethodPut, "/profile/password", `{"password":"new-password"}`)
		if recorder.Code != tc.want {
			t.Errorf("%s: expected %d, got %d", tc.name, tc.want, recorder.Code)
		}
	}
}

func TestDeleteAccountReturns204AndClearsTheSessionCookie(t *testing.T) {
	svc := &fakeProfileService{}
	recorder := profileRequest(newProfileFlowRouter(svc), http.MethodDelete, "/profile", "")

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected %d, got %d (%s)", http.StatusNoContent, recorder.Code, recorder.Body.String())
	}
	if svc.deleteCalls != 1 || svc.gotToken != "cookie-token" {
		t.Fatalf("expected one call with the token, got %d calls, token %q", svc.deleteCalls, svc.gotToken)
	}
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 || cookies[0].Value != "" || cookies[0].MaxAge >= 0 {
		t.Fatalf("expected the session cookie to be cleared, got %+v", cookies)
	}
}

func TestDeleteAccountMapsServiceError(t *testing.T) {
	recorder := profileRequest(newProfileFlowRouter(&fakeProfileService{err: errors.New("boom")}), http.MethodDelete, "/profile", "")
	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
}

func TestProfileHandlersRequireAuthentication(t *testing.T) {
	router := newProfileFlowRouter(&fakeProfileService{})
	for _, r := range []struct{ method, path, body string }{
		{http.MethodPut, "/profile/password", `{"password":"new-password"}`},
		{http.MethodDelete, "/profile", ""},
		{http.MethodGet, "/profile", ""},
		{http.MethodPut, "/profile/username", `{"username":"trader_1"}`},
	} {
		req := httptest.NewRequest(r.method, r.path, strings.NewReader(r.body))
		req.Header.Set("Content-Type", "application/json")
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, req)
		if recorder.Code != http.StatusUnauthorized {
			t.Errorf("%s %s: expected %d without a session, got %d", r.method, r.path, http.StatusUnauthorized, recorder.Code)
		}
	}
}

func TestGetProfileReturnsANullUsernameBeforeOneIsSet(t *testing.T) {
	svc := &fakeProfileService{}
	recorder := profileRequest(newProfileFlowRouter(svc), http.MethodGet, "/profile", "")

	if recorder.Code != http.StatusOK || recorder.Body.String() != `{"profile":{"username":null}}` {
		t.Fatalf("expected an empty profile, got %d %s", recorder.Code, recorder.Body.String())
	}
	if svc.gotToken != "cookie-token" {
		t.Fatalf("expected the session token to reach the service, got %q", svc.gotToken)
	}
}

func TestUpdateUsernameReturnsTheUpdatedProfile(t *testing.T) {
	username := "trader_1"
	svc := &fakeProfileService{profile: models.Profile{Username: &username}}
	recorder := profileRequest(newProfileFlowRouter(svc), http.MethodPut, "/profile/username", `{"username":"trader_1"}`)

	if recorder.Code != http.StatusOK || recorder.Body.String() != `{"profile":{"username":"trader_1"}}` {
		t.Fatalf("expected the updated profile, got %d %s", recorder.Code, recorder.Body.String())
	}
	if svc.gotToken != "cookie-token" || svc.gotUsername != "trader_1" {
		t.Fatalf("expected token and username to reach the service, got %q %q", svc.gotToken, svc.gotUsername)
	}
}

func TestUpdateUsernameRejectsInvalidBody(t *testing.T) {
	recorder := profileRequest(newProfileFlowRouter(&fakeProfileService{}), http.MethodPut, "/profile/username", `not json`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestProfileErrorsMapToStatusCodes(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"invalid username", services.ErrInvalidInput, http.StatusBadRequest},
		{"username taken", repositories.ErrConflict, http.StatusConflict},
		{"unauthenticated", repositories.ErrUnauthenticated, http.StatusUnauthorized},
		{"no profile row", repositories.ErrNotFound, http.StatusNotFound},
		{"unexpected", errors.New("database down"), http.StatusInternalServerError},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			router := newProfileFlowRouter(&fakeProfileService{err: tc.err})
			if got := profileRequest(router, http.MethodPut, "/profile/username", `{"username":"trader_1"}`).Code; got != tc.want {
				t.Errorf("update: expected %d, got %d", tc.want, got)
			}
			if got := profileRequest(router, http.MethodGet, "/profile", "").Code; got != tc.want {
				t.Errorf("get: expected %d, got %d", tc.want, got)
			}
		})
	}
}

func TestDeleteAccountReturns401WhenSupabaseRefusesTheToken(t *testing.T) {
	svc := &fakeProfileService{err: fmt.Errorf("wrapped: %w", repositories.ErrUnauthenticated)}
	recorder := profileRequest(newProfileFlowRouter(svc), http.MethodDelete, "/profile", "")

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected %d, got %d (%s)", http.StatusUnauthorized, recorder.Code, recorder.Body.String())
	}
}
