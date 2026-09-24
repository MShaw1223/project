package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
)

// userScopedClient returns a Supabase client whose PostgREST calls run as the token's user (so row
// level security applies) along with that user's id. Shared by every repository that needs a
// caller-scoped client.
func userScopedClient(ctx context.Context, provider supabaseClientProvider, token string) (*supabase.Client, uuid.UUID, error) {
	if err := ctx.Err(); err != nil {
		return nil, uuid.Nil, err
	}

	client, err := provider.NewSupabaseClient()
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("supabase client not available: %w", err)
	}
	user, err := client.Auth.WithToken(token).GetUser()
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("%w: %v", ErrUnauthenticated, err)
	}
	client.UpdateAuthSession(types.Session{AccessToken: token})
	return client, user.ID, nil
}
