package tests

import (
	"os"
	"testing"

	"github.com/miller/project/backend/repositories"
)

func TestSupabaseConnectionIntegration(t *testing.T) {
	if os.Getenv("SUPABASE_URL") == "" || os.Getenv("SUPABASE_KEY") == "" {
		t.Skip("skipping Supabase integration test; SUPABASE_URL/SUPABASE_KEY not set")
	}

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