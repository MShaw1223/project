package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"github.com/miller/project/backend/repositories"
)

const profileTable = "/rest/v1/profile"

func newProfileRepository() *repositories.ProfileRepository {
	return &repositories.ProfileRepository{Provider: &repositories.SupabaseProvider{}}
}

func TestProfileRepositoryUpdatePasswordUpdatesTheCallersOwnUser(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPut, "/auth/v1/user", http.StatusOK, `{"id":"`+fakeUserID+`"}`)

	if err := newProfileRepository().UpdatePassword(context.Background(), "user-token", "new-secret"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	call := supabase.last(http.MethodPut, "/auth/v1/user")
	if got := call.Header.Get("Authorization"); got != "Bearer user-token" {
		t.Fatalf("expected the caller's own token, got %q", got)
	}
	var body map[string]any
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	if body["password"] != "new-secret" {
		t.Fatalf("expected the new password to be sent, got %v", body)
	}
}

func TestProfileRepositoryUpdatePasswordReportsARefusedUpdate(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPut, "/auth/v1/user", http.StatusUnprocessableEntity, `{"error_code":"weak_password"}`)

	if err := newProfileRepository().UpdatePassword(context.Background(), "user-token", "new-secret"); err == nil {
		t.Fatal("a refused password update must be reported as a failure")
	}
}

func TestProfileRepositoryGetProfileReturnsTheCallersUsername(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, profileTable, http.StatusOK, `[{"username":"trader"}]`)

	profile, err := newProfileRepository().GetProfile(context.Background(), "user-token")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if profile.Username == nil || *profile.Username != "trader" {
		t.Fatalf("expected the username from Supabase, got %+v", profile)
	}
	call := supabase.last(http.MethodGet, profileTable)
	call.asUser(t, "user-token", "id")
	if got := call.Query.Get("select"); got != "username" {
		t.Fatalf("expected only the username to be selected, got %q", got)
	}
}

func TestProfileRepositoryGetProfileKeepsAnUnsetUsernameNil(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, profileTable, http.StatusOK, `[{"username":null}]`)

	profile, err := newProfileRepository().GetProfile(context.Background(), "user-token")
	if err != nil || profile.Username != nil {
		t.Fatalf("expected a profile without a username, got %+v (err %v)", profile, err)
	}
}

func TestProfileRepositoryGetProfileReportsAMissingProfile(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, profileTable, http.StatusOK, `[]`)

	if _, err := newProfileRepository().GetProfile(context.Background(), "user-token"); !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestProfileRepositoryUpdateUsernameUpdatesOnlyTheCallersProfile(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPatch, profileTable, http.StatusOK, `[{"username":"trader"}]`)

	profile, err := newProfileRepository().UpdateUsername(context.Background(), "user-token", "trader")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if profile.Username == nil || *profile.Username != "trader" {
		t.Fatalf("expected the updated profile, got %+v", profile)
	}
	call := supabase.last(http.MethodPatch, profileTable)
	call.asUser(t, "user-token", "id")
	var body map[string]string
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	if len(body) != 1 || body["username"] != "trader" {
		t.Fatalf("expected only the username to be updated, got %v", body)
	}
}

func TestProfileRepositoryUpdateUsernameMapsATakenUsernameToConflict(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPatch, profileTable, http.StatusConflict, `{"code":"23505","message":"duplicate key value violates unique constraint"}`)

	if _, err := newProfileRepository().UpdateUsername(context.Background(), "user-token", "trader"); !errors.Is(err, repositories.ErrConflict) {
		t.Fatalf("expected ErrConflict, got %v", err)
	}
}

func TestProfileRepositoryUpdateUsernameReportsAMissingProfile(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPatch, profileTable, http.StatusOK, `[]`)

	if _, err := newProfileRepository().UpdateUsername(context.Background(), "user-token", "trader"); !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestProfileRepositoryDeleteAccountUsesTheConfiguredProject(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, "/rest/v1/rpc/delete_account", http.StatusNoContent, ``)

	if err := newProfileRepository().DeleteAccount(context.Background(), "user-token"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	call := supabase.last(http.MethodPost, "/rest/v1/rpc/delete_account")
	if call.Header.Get("Authorization") != "Bearer user-token" || call.Header.Get("apikey") != fakeAnonKey {
		t.Fatalf("expected the caller's token and the project's key, got %v", call.Header)
	}
}

func TestProfileRepositoryDeleteAccountReportsAnUnreachableSupabase(t *testing.T) {
	repo, _ := fakeSupabaseRest(t, http.StatusNoContent)
	repo.RestURL = "http://127.0.0.1:1"

	err := repo.DeleteAccount(context.Background(), "user-token")
	if err == nil || errors.Is(err, repositories.ErrUnauthenticated) {
		t.Fatalf("expected a plain failure, got %v", err)
	}
}
