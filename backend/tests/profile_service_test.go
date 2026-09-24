package tests

import (
	"context"
	"errors"
	"testing"

	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

// fakeProfileRepo returns canned results and records what the service passed down.
type fakeProfileRepo struct {
	err     error
	profile models.Profile

	gotToken, gotPassword, gotUsername string
	deleteCalls, usernameCalls         int
}

func (f *fakeProfileRepo) GetProfile(ctx context.Context, token string) (models.Profile, error) {
	f.gotToken = token
	return f.profile, f.err
}

func (f *fakeProfileRepo) UpdateUsername(ctx context.Context, token, username string) (models.Profile, error) {
	f.usernameCalls++
	f.gotToken, f.gotUsername = token, username
	return f.profile, f.err
}

func (f *fakeProfileRepo) UpdatePassword(ctx context.Context, token, newPassword string) error {
	f.gotToken, f.gotPassword = token, newPassword
	return f.err
}

func (f *fakeProfileRepo) DeleteAccount(ctx context.Context, token string) error {
	f.deleteCalls++
	f.gotToken = token
	return f.err
}

func TestProfileServiceUpdatePasswordValidatesLength(t *testing.T) {
	for _, password := range []string{"", "short", string(make([]byte, services.MaxPasswordLength+1))} {
		repo := &fakeProfileRepo{}
		svc := &services.ProfileService{Repo: repo}

		if err := svc.UpdatePassword(context.Background(), "tok", password); !errors.Is(err, services.ErrInvalidInput) {
			t.Errorf("password len %d: expected ErrInvalidInput, got %v", len(password), err)
		}
		if repo.gotPassword != "" {
			t.Errorf("password len %d: invalid passwords must be rejected before the repository", len(password))
		}
	}
}

func TestProfileServiceUpdatePasswordForwardsToRepository(t *testing.T) {
	repo := &fakeProfileRepo{}
	svc := &services.ProfileService{Repo: repo}

	if err := svc.UpdatePassword(context.Background(), "tok", "new-password"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotToken != "tok" || repo.gotPassword != "new-password" {
		t.Fatalf("expected token and password to reach the repository, got %q %q", repo.gotToken, repo.gotPassword)
	}
}

func TestProfileServiceUpdatePasswordPropagatesRepositoryError(t *testing.T) {
	svc := &services.ProfileService{Repo: &fakeProfileRepo{err: errors.New("supabase unavailable")}}

	if err := svc.UpdatePassword(context.Background(), "tok", "new-password"); err == nil {
		t.Fatal("expected an error, got nil")
	}
}

func TestProfileServiceDeleteAccountForwardsToRepository(t *testing.T) {
	repo := &fakeProfileRepo{}
	svc := &services.ProfileService{Repo: repo}

	if err := svc.DeleteAccount(context.Background(), "tok"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.deleteCalls != 1 || repo.gotToken != "tok" {
		t.Fatalf("expected one call with the token, got %d calls, token %q", repo.deleteCalls, repo.gotToken)
	}
}

func TestProfileServiceDeleteAccountPropagatesRepositoryError(t *testing.T) {
	svc := &services.ProfileService{Repo: &fakeProfileRepo{err: errors.New("supabase unavailable")}}

	if err := svc.DeleteAccount(context.Background(), "tok"); err == nil {
		t.Fatal("expected an error, got nil")
	}
}

func TestProfileServiceUpdateUsernameRejectsInvalidUsernames(t *testing.T) {
	cases := map[string]string{
		"empty":           "",
		"only whitespace": "   ",
		"too short":       "ab",
		"too long":        "a_very_long_username_1",
		"contains space":  "trader one",
		"contains dash":   "trader-one",
		"non ascii":       "tradér",
	}
	for name, username := range cases {
		t.Run(name, func(t *testing.T) {
			repo := &fakeProfileRepo{}
			svc := &services.ProfileService{Repo: repo}

			if _, err := svc.UpdateUsername(context.Background(), "tok", username); !errors.Is(err, services.ErrInvalidInput) {
				t.Fatalf("expected ErrInvalidInput, got %v", err)
			}
			if repo.usernameCalls != 0 {
				t.Fatal("expected invalid usernames to be rejected before the repository")
			}
		})
	}
}

func TestProfileServiceUpdateUsernameTrimsAndForwards(t *testing.T) {
	stored := "Trader_1"
	repo := &fakeProfileRepo{profile: models.Profile{Username: &stored}}
	svc := &services.ProfileService{Repo: repo}

	profile, err := svc.UpdateUsername(context.Background(), "tok", "  Trader_1 ")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotToken != "tok" || repo.gotUsername != "Trader_1" {
		t.Fatalf("expected the trimmed username and token to reach the repository, got %q %q", repo.gotUsername, repo.gotToken)
	}
	if profile.Username == nil || *profile.Username != "Trader_1" {
		t.Fatalf("expected the stored profile back, got %+v", profile)
	}
}

func TestProfileServiceUpdateUsernamePropagatesRepositoryError(t *testing.T) {
	svc := &services.ProfileService{Repo: &fakeProfileRepo{err: repositories.ErrConflict}}

	if _, err := svc.UpdateUsername(context.Background(), "tok", "taken_name"); !errors.Is(err, repositories.ErrConflict) {
		t.Fatalf("expected ErrConflict, got %v", err)
	}
}

func TestProfileServiceGetProfileForwardsToRepository(t *testing.T) {
	repo := &fakeProfileRepo{}
	svc := &services.ProfileService{Repo: repo}

	profile, err := svc.GetProfile(context.Background(), "tok")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotToken != "tok" || profile.Username != nil {
		t.Fatalf("expected the token to reach the repository and no username, got %q %+v", repo.gotToken, profile)
	}
}
