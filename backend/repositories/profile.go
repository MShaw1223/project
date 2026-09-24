package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/miller/project/backend/models"
	"github.com/supabase-community/gotrue-go/types"
)

type ProfileRepository struct {
	Provider supabaseClientProvider

	// RestURL, APIKey and HTTPClient are for the call made with net/http (deleting the account). Empty
	// values fall back to SUPABASE_URL/rest/v1, SUPABASE_KEY and a client with a timeout; tests point
	// them at a fake server.
	RestURL    string
	APIKey     string
	HTTPClient *http.Client
}

// UpdatePassword changes the caller's own password via Supabase's self-service user update, which
// only needs the caller's access token (no service-role key required).
func (r *ProfileRepository) UpdatePassword(ctx context.Context, token, newPassword string) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		return fmt.Errorf("supabase client not available: %w", err)
	}

	if _, err := client.Auth.WithToken(token).UpdateUser(types.UpdateUserRequest{Password: &newPassword}); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}

// DeleteAccount permanently deletes the caller by calling the delete_account() database function
// (migrations/0004_hard_delete_accounts.sql) as them. Deleting their auth user cascades to their
// profile, brokerage accounts, trades and currency pairs in one transaction. It's called with net/http
// because postgrest-go's Rpc ignores the response status, which would report a failed delete as done.
func (r *ProfileRepository) DeleteAccount(ctx context.Context, token string) error {
	restURL, apiKey, httpClient, err := resolveSupabaseAPI(r.RestURL, r.APIKey, r.HTTPClient, "/rest/v1")
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, restURL+"/rpc/delete_account", strings.NewReader("{}"))
	if err != nil {
		return fmt.Errorf("failed to build delete account request: %w", err)
	}
	req.Header.Set("apikey", apiKey)
	// the caller's own token, so the function's auth.uid() is them and nobody else
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to delete account: %w", err)
	}
	defer resp.Body.Close()

	switch {
	case resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden:
		return fmt.Errorf("%w: delete account refused with status %d", ErrUnauthenticated, resp.StatusCode)
	case resp.StatusCode < 200 || resp.StatusCode >= 300:
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("failed to delete account: status %d: %s", resp.StatusCode, detail)
	}
	return nil
}

// GetProfile returns the caller's own profile.
func (r *ProfileRepository) GetProfile(ctx context.Context, token string) (models.Profile, error) {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return models.Profile{}, err
	}

	response, _, err := client.From("profile").
		Select("username", "exact", false).
		Eq("id", userID.String()).
		Execute()
	if err != nil {
		return models.Profile{}, fmt.Errorf("failed to fetch profile %q: %w", userID, err)
	}
	return firstProfile(response)
}

// UpdateUsername sets the caller's username, ErrConflict when another user already has it.
func (r *ProfileRepository) UpdateUsername(ctx context.Context, token, username string) (models.Profile, error) {
	client, userID, err := userScopedClient(ctx, r.Provider, token)
	if err != nil {
		return models.Profile{}, err
	}

	response, _, err := client.From("profile").
		Update(map[string]interface{}{"username": username}, "representation", "").
		Eq("id", userID.String()).
		Execute()
	if err != nil {
		if isUniqueViolation(err) {
			return models.Profile{}, fmt.Errorf("%w: %v", ErrConflict, err)
		}
		return models.Profile{}, fmt.Errorf("failed to update username: %w", err)
	}
	return firstProfile(response)
}

// firstProfile decodes a PostgREST list response, ErrNotFound when the caller has no profile row.
func firstProfile(response []byte) (models.Profile, error) {
	var profiles []models.Profile
	if err := json.Unmarshal(response, &profiles); err != nil {
		return models.Profile{}, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	if len(profiles) == 0 {
		return models.Profile{}, ErrNotFound
	}
	return profiles[0], nil
}

// isUniqueViolation reports whether a PostgREST error is Postgres' unique_violation (23505).
// postgrest-go flattens the error response to "(<code>) <message>", so the code is only in the text.
func isUniqueViolation(err error) bool {
	return strings.HasPrefix(err.Error(), "(23505)")
}
