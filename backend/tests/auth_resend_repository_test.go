package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/miller/project/backend/repositories"
)

// fakeSupabaseAuth stands in for Supabase's /auth/v1 API, recording the resend request it received.
func fakeSupabaseAuth(t *testing.T, status int) (*httptest.Server, *http.Request, map[string]string) {
	t.Helper()
	var got http.Request
	body := map[string]string{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got = *r
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Errorf("expected a json body: %v", err)
		}
		w.WriteHeader(status)
		_, _ = w.Write([]byte(`{}`))
	}))
	t.Cleanup(server.Close)
	return server, &got, body
}

func TestResendConfirmationPostsASignupResendToSupabase(t *testing.T) {
	server, got, body := fakeSupabaseAuth(t, http.StatusOK)
	repo := &repositories.AuthRepository{AuthURL: server.URL, APIKey: "anon-key", HTTPClient: server.Client()}

	if err := repo.ResendConfirmation(context.Background(), "trader@example.com"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got.Method != http.MethodPost || got.URL.Path != "/resend" {
		t.Fatalf("expected POST /resend, got %s %s", got.Method, got.URL.Path)
	}
	if got.Header.Get("apikey") != "anon-key" {
		t.Fatalf("expected the api key header, got %q", got.Header.Get("apikey"))
	}
	if body["type"] != "signup" || body["email"] != "trader@example.com" {
		t.Fatalf("expected a signup resend for the email, got %v", body)
	}
}

func TestResendConfirmationMapsSupabaseRateLimiting(t *testing.T) {
	server, _, _ := fakeSupabaseAuth(t, http.StatusTooManyRequests)
	repo := &repositories.AuthRepository{AuthURL: server.URL, APIKey: "anon-key", HTTPClient: server.Client()}

	if err := repo.ResendConfirmation(context.Background(), "trader@example.com"); !errors.Is(err, repositories.ErrRateLimited) {
		t.Fatalf("expected ErrRateLimited, got %v", err)
	}
}

func TestResendConfirmationReportsOtherSupabaseFailures(t *testing.T) {
	server, _, _ := fakeSupabaseAuth(t, http.StatusInternalServerError)
	repo := &repositories.AuthRepository{AuthURL: server.URL, APIKey: "anon-key", HTTPClient: server.Client()}

	err := repo.ResendConfirmation(context.Background(), "trader@example.com")
	if err == nil || errors.Is(err, repositories.ErrRateLimited) {
		t.Fatalf("expected a plain failure, got %v", err)
	}
}

func TestResendConfirmationRequiresSupabaseConfig(t *testing.T) {
	t.Setenv("SUPABASE_URL", "")
	t.Setenv("SUPABASE_KEY", "")
	repo := &repositories.AuthRepository{}

	if err := repo.ResendConfirmation(context.Background(), "trader@example.com"); err == nil {
		t.Fatal("expected an error without Supabase configuration")
	}
}
