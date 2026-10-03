package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"github.com/miller/project/backend/repositories"
)

const sessionBody = `{"access_token":"session-token","refresh_token":"refresh","token_type":"bearer","expires_in":3600,"user":{"id":"` + fakeUserID + `","email":"trader@example.com"}}`

func newAuthRepository() *repositories.AuthRepository {
	return &repositories.AuthRepository{Provider: &repositories.SupabaseProvider{}}
}

func TestAuthRepositoryCreateSessionSignsInWithEmailAndPassword(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, "/auth/v1/token", http.StatusOK, sessionBody)

	session, err := newAuthRepository().CreateSession(context.Background(), "trader@example.com", "secret123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if session.AccessToken != "session-token" || session.ExpiresIn != 3600 || session.User.ID.String() != fakeUserID {
		t.Fatalf("expected the session from Supabase, got %+v", session)
	}
	call := supabase.last(http.MethodPost, "/auth/v1/token")
	if got := call.Query.Get("grant_type"); got != "password" {
		t.Fatalf("expected a password grant, got %q", got)
	}
	var body map[string]any
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	if body["email"] != "trader@example.com" || body["password"] != "secret123" {
		t.Fatalf("expected the credentials to be sent, got %v", body)
	}
}

func TestAuthRepositoryCreateSessionMapsSupabaseRefusals(t *testing.T) {
	cases := []struct {
		name   string
		status int
		body   string
		want   error
	}{
		{"unconfirmed email", http.StatusBadRequest, `{"error_code":"email_not_confirmed","msg":"Email not confirmed"}`, repositories.ErrEmailNotConfirmed},
		{"wrong password", http.StatusBadRequest, `{"error_code":"invalid_credentials","msg":"Invalid login credentials"}`, repositories.ErrInvalidCredentials},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			supabase := newFakeSupabase(t)
			supabase.reply(http.MethodPost, "/auth/v1/token", tc.status, tc.body)

			if _, err := newAuthRepository().CreateSession(context.Background(), "trader@example.com", "secret123"); !errors.Is(err, tc.want) {
				t.Fatalf("expected %v, got %v", tc.want, err)
			}
		})
	}
}

func TestAuthRepositoryCreateSessionReportsOtherFailuresAsFailures(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, "/auth/v1/token", http.StatusInternalServerError, `{"msg":"unexpected failure"}`)

	_, err := newAuthRepository().CreateSession(context.Background(), "trader@example.com", "secret123")
	if err == nil || errors.Is(err, repositories.ErrInvalidCredentials) || errors.Is(err, repositories.ErrEmailNotConfirmed) {
		t.Fatalf("expected a plain failure, got %v", err)
	}
}

func TestAuthRepositorySignupReturnsTheNewUser(t *testing.T) {
	cases := []struct {
		name string
		body string
	}{
		{"email confirmation required", `{"id":"` + fakeUserID + `","email":"trader@example.com"}`},
		{"autoconfirm", sessionBody},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			supabase := newFakeSupabase(t)
			supabase.reply(http.MethodPost, "/auth/v1/signup", http.StatusOK, tc.body)

			user, err := newAuthRepository().Signup(context.Background(), "trader@example.com", "secret123")
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if user.ID.String() != fakeUserID || user.Email != "trader@example.com" {
				t.Fatalf("expected the new user, got %+v", user)
			}
			var body map[string]any
			if err := json.Unmarshal([]byte(supabase.last(http.MethodPost, "/auth/v1/signup").Body), &body); err != nil {
				t.Fatalf("expected a json body: %v", err)
			}
			if body["email"] != "trader@example.com" || body["password"] != "secret123" {
				t.Fatalf("expected the credentials to be sent, got %v", body)
			}
		})
	}
}

func TestAuthRepositorySignupMapsARefusalToSignupRejected(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, "/auth/v1/signup", http.StatusUnprocessableEntity, `{"error_code":"weak_password"}`)

	if _, err := newAuthRepository().Signup(context.Background(), "trader@example.com", "secret123"); !errors.Is(err, repositories.ErrSignupRejected) {
		t.Fatalf("expected ErrSignupRejected, got %v", err)
	}
}

func TestAuthRepositoryGetUserLooksUpTheTokensUser(t *testing.T) {
	supabase := newFakeSupabase(t)

	user, err := newAuthRepository().GetUser(context.Background(), "user-token")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if user.ID.String() != fakeUserID || user.Email != "trader@example.com" {
		t.Fatalf("expected the user from Supabase, got %+v", user)
	}
	if got := supabase.last(http.MethodGet, "/auth/v1/user").Header.Get("Authorization"); got != "Bearer user-token" {
		t.Fatalf("expected the caller's own token, got %q", got)
	}
}

func TestAuthRepositoryGetUserReportsARefusedToken(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, "/auth/v1/user", http.StatusUnauthorized, `{"msg":"invalid JWT"}`)

	if _, err := newAuthRepository().GetUser(context.Background(), "expired-token"); err == nil {
		t.Fatal("expected an error for a refused token")
	}
}

func TestAuthRepositoryResendConfirmationUsesTheConfiguredProject(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, "/auth/v1/resend", http.StatusOK, `{}`)

	if err := newAuthRepository().ResendConfirmation(context.Background(), "trader@example.com"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got := supabase.last(http.MethodPost, "/auth/v1/resend").Header.Get("apikey"); got != fakeAnonKey {
		t.Fatalf("expected the project's key, got %q", got)
	}
}

func TestAuthRepositoryResendConfirmationReportsAnUnreachableSupabase(t *testing.T) {
	repo := &repositories.AuthRepository{AuthURL: "http://127.0.0.1:1", APIKey: fakeAnonKey}

	err := repo.ResendConfirmation(context.Background(), "trader@example.com")
	if err == nil || errors.Is(err, repositories.ErrRateLimited) {
		t.Fatalf("expected a plain failure, got %v", err)
	}
}
