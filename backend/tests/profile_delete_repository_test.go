package tests

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/miller/project/backend/repositories"
)

// fakeSupabaseRest stands in for Supabase's /rest/v1 API, recording the rpc request it received.
func fakeSupabaseRest(t *testing.T, status int) (*repositories.ProfileRepository, *http.Request) {
	t.Helper()
	var got http.Request
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got = *r
		w.WriteHeader(status)
	}))
	t.Cleanup(server.Close)
	return &repositories.ProfileRepository{RestURL: server.URL, APIKey: "publishable-key", HTTPClient: server.Client()}, &got
}

func TestDeleteAccountCallsTheDatabaseFunctionAsTheUser(t *testing.T) {
	repo, got := fakeSupabaseRest(t, http.StatusNoContent)

	if err := repo.DeleteAccount(context.Background(), "user-token"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got.Method != http.MethodPost || got.URL.Path != "/rpc/delete_account" {
		t.Fatalf("expected POST /rpc/delete_account, got %s %s", got.Method, got.URL.Path)
	}
	if got.Header.Get("Authorization") != "Bearer user-token" {
		t.Fatalf("expected the user's own token, got %q", got.Header.Get("Authorization"))
	}
	if got.Header.Get("apikey") != "publishable-key" {
		t.Fatalf("expected the api key header, got %q", got.Header.Get("apikey"))
	}
}

func TestDeleteAccountMapsARefusedTokenToUnauthenticated(t *testing.T) {
	for _, status := range []int{http.StatusUnauthorized, http.StatusForbidden} {
		repo, _ := fakeSupabaseRest(t, status)
		if err := repo.DeleteAccount(context.Background(), "expired-token"); !errors.Is(err, repositories.ErrUnauthenticated) {
			t.Errorf("status %d: expected ErrUnauthenticated, got %v", status, err)
		}
	}
}

func TestDeleteAccountReportsAFailedDelete(t *testing.T) {
	repo, _ := fakeSupabaseRest(t, http.StatusInternalServerError)

	err := repo.DeleteAccount(context.Background(), "user-token")
	if err == nil || errors.Is(err, repositories.ErrUnauthenticated) {
		t.Fatalf("a failed delete must be reported as a failure, got %v", err)
	}
}

func TestDeleteAccountRequiresSupabaseConfig(t *testing.T) {
	t.Setenv("SUPABASE_URL", "")
	t.Setenv("SUPABASE_KEY", "")

	if err := (&repositories.ProfileRepository{}).DeleteAccount(context.Background(), "user-token"); err == nil {
		t.Fatal("expected an error without Supabase configuration")
	}
}
