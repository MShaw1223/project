package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"github.com/miller/project/backend/repositories"
)

const accountsTable = "/rest/v1/brokerage_account"

const accountRow = `{"id":"` + validID + `","name":"main","user_id":"` + fakeUserID + `"}`

func newAccountsRepository() *repositories.AccountsRepository {
	return &repositories.AccountsRepository{Provider: &repositories.SupabaseProvider{}}
}

func TestAccountsRepositoryGetUserAccountsReturnsTheCallersAccounts(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, accountsTable, http.StatusOK, `[`+accountRow+`]`)

	accounts, err := newAccountsRepository().GetUserAccounts(context.Background(), "user-token")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(accounts) != 1 || accounts[0].Name != "main" || accounts[0].ID.String() != validID {
		t.Fatalf("expected the account from Supabase, got %+v", accounts)
	}
	if got := supabase.last(http.MethodGet, "/auth/v1/user").Header.Get("Authorization"); got != "Bearer user-token" {
		t.Fatalf("expected the user to be looked up with their token, got %q", got)
	}
	supabase.last(http.MethodGet, accountsTable).asUser(t, "user-token", "user_id")
}

func TestAccountsRepositoryGetAccountByIDAsksForOneOfTheCallersAccounts(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodGet, accountsTable, http.StatusOK, accountRow)

	account, err := newAccountsRepository().GetAccountByID(context.Background(), "user-token", validID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if account == nil || account.Name != "main" {
		t.Fatalf("expected the account from Supabase, got %+v", account)
	}
	call := supabase.last(http.MethodGet, accountsTable)
	call.asUser(t, "user-token", "user_id")
	if got := call.Query.Get("id"); got != "eq."+validID {
		t.Fatalf("expected the account id filter, got %q", got)
	}
	if got := call.Header.Get("Accept"); got != "application/vnd.pgrst.object+json" {
		t.Fatalf("expected a single row to be requested, got Accept %q", got)
	}
}

func TestAccountsRepositoryCreateAccountInsertsForTheCaller(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPost, accountsTable, http.StatusCreated, `[`+accountRow+`]`)

	account, err := newAccountsRepository().CreateAccount(context.Background(), "user-token", "main")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if account == nil || account.Name != "main" {
		t.Fatalf("expected the created account, got %+v", account)
	}
	call := supabase.last(http.MethodPost, accountsTable)
	if got := call.Header.Get("Authorization"); got != "Bearer user-token" {
		t.Fatalf("expected the caller's own token, got %q", got)
	}
	var body map[string]string
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	if body["name"] != "main" || body["user_id"] != fakeUserID {
		t.Fatalf("expected the name and the caller's id to be inserted, got %v", body)
	}
}

func TestAccountsRepositoryUpdateAccountRenamesOnlyTheCallersAccount(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPatch, accountsTable, http.StatusOK, `[`+accountRow+`]`)

	account, err := newAccountsRepository().UpdateAccount(context.Background(), "user-token", validID, "main")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if account == nil || account.Name != "main" {
		t.Fatalf("expected the updated account, got %+v", account)
	}
	call := supabase.last(http.MethodPatch, accountsTable)
	call.asUser(t, "user-token", "user_id")
	if got := call.Query.Get("id"); got != "eq."+validID {
		t.Fatalf("expected the account id filter, got %q", got)
	}
	var body map[string]string
	if err := json.Unmarshal([]byte(call.Body), &body); err != nil {
		t.Fatalf("expected a json body, got %q: %v", call.Body, err)
	}
	if len(body) != 1 || body["name"] != "main" {
		t.Fatalf("expected only the name to be updated, got %v", body)
	}
}

func TestAccountsRepositoryUpdateAccountReportsAMissingAccount(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodPatch, accountsTable, http.StatusOK, `[]`)

	_, err := newAccountsRepository().UpdateAccount(context.Background(), "user-token", validID, "main")
	if !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestAccountsRepositoryDeleteAccountDeletesOnlyTheCallersAccount(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodDelete, accountsTable, http.StatusOK, `[`+accountRow+`]`)

	if err := newAccountsRepository().DeleteAccount(context.Background(), "user-token", validID); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	call := supabase.last(http.MethodDelete, accountsTable)
	call.asUser(t, "user-token", "user_id")
	if got := call.Query.Get("id"); got != "eq."+validID {
		t.Fatalf("expected the account id filter, got %q", got)
	}
}

func TestAccountsRepositoryDeleteAccountReportsAMissingAccount(t *testing.T) {
	supabase := newFakeSupabase(t)
	supabase.reply(http.MethodDelete, accountsTable, http.StatusOK, `[]`)

	err := newAccountsRepository().DeleteAccount(context.Background(), "user-token", validID)
	if !errors.Is(err, repositories.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
