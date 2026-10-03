//go:build integration

package tests

import (
	"context"
	"os"
	"sync"
	"testing"

	"github.com/miller/project/backend/repositories"
)

// The integration tests run the repositories against a real Supabase project, which the unit tests
// replace with a fake. They're only built with -tags=integration, so asking for them without the
// project's settings is a failure rather than a skip:
//
//	go test -tags=integration -run 'Integration$' ./tests/
//
// SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD are a confirmed user kept for these tests, owning at
// least one brokerage account.

func requireEnv(t *testing.T, names ...string) {
	t.Helper()
	for _, name := range names {
		if os.Getenv(name) == "" {
			t.Fatalf("%s must be set for the integration tests", name)
		}
	}
}

var (
	integrationSignIn  sync.Once
	integrationSession string
	integrationErr     error
)

// integrationToken signs in as the test user, since an access token is too short-lived to configure.
// Signs in once for the whole run, so the tests don't use up Supabase's sign-in rate limit.
func integrationToken(t *testing.T) string {
	t.Helper()
	requireEnv(t, "SUPABASE_URL", "SUPABASE_KEY", "SUPABASE_TEST_EMAIL", "SUPABASE_TEST_PASSWORD")

	integrationSignIn.Do(func() {
		repo := &repositories.AuthRepository{Provider: &repositories.SupabaseProvider{}}
		session, err := repo.CreateSession(context.Background(), os.Getenv("SUPABASE_TEST_EMAIL"), os.Getenv("SUPABASE_TEST_PASSWORD"))
		if err != nil {
			integrationErr = err
			return
		}
		integrationSession = session.AccessToken
	})
	if integrationErr != nil {
		t.Fatalf("failed to sign in as the test user: %v", integrationErr)
	}
	return integrationSession
}

func TestSupabaseConnectionIntegration(t *testing.T) {
	requireEnv(t, "SUPABASE_URL", "SUPABASE_KEY")

	repo := &repositories.SupabaseProvider{}
	client, err := repo.NewSupabaseClient()
	if err != nil {
		t.Fatalf("failed to create client: %v", err)
	}

	if client == nil {
		t.Fatal("expected non-nil client")
	}

	health, err := client.Auth.HealthCheck()
	if err != nil {
		t.Fatalf("failed to check health: %v", err)
	}
	t.Logf("Health check result: %v", health)
}

func TestGetUserIntegration(t *testing.T) {
	token := integrationToken(t)

	repo := &repositories.AuthRepository{Provider: &repositories.SupabaseProvider{}}
	user, err := repo.GetUser(context.Background(), token)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if user.Email != os.Getenv("SUPABASE_TEST_EMAIL") {
		t.Fatalf("expected the test user, got %q", user.Email)
	}
}
