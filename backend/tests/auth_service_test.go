package tests

import (
	"context"
	"errors"
	"testing"

	"github.com/miller/project/backend/services"
	"github.com/supabase-community/gotrue-go/types"
)

// fakeAuthRepo returns canned results and records what the service passed down.
type fakeAuthRepo struct {
	session *types.Session
	user    *types.User
	err     error

	gotEmail, gotPassword string
	signupCalls           int
	resendCalls           int
}

func (f *fakeAuthRepo) ResendConfirmation(ctx context.Context, email string) error {
	f.resendCalls++
	f.gotEmail = email
	return f.err
}

func (f *fakeAuthRepo) Signup(ctx context.Context, email, password string) (*types.User, error) {
	f.signupCalls++
	f.gotEmail, f.gotPassword = email, password
	return f.user, f.err
}

func (f *fakeAuthRepo) CreateSession(ctx context.Context, email, password string) (*types.Session, error) {
	return f.session, f.err
}

func (f *fakeAuthRepo) GetUser(ctx context.Context, authToken string) (*types.User, error) {
	return f.user, f.err
}

func TestAuthServiceCreateSession(t *testing.T) {
	cases := []struct {
		name          string
		repo          *fakeAuthRepo
		wantErr       bool
		wantAccessTok string
		wantEmail     string
	}{
		{
			name: "maps the repository session to a session response",
			repo: &fakeAuthRepo{session: &types.Session{
				AccessToken: "test-access-token",
				User:        types.User{Email: "user@example.com"},
			}},
			wantAccessTok: "test-access-token",
			wantEmail:     "user@example.com",
		},
		{
			name:    "propagates a repository error",
			repo:    &fakeAuthRepo{err: errors.New("invalid credentials")},
			wantErr: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			svc := &services.AuthService{Repo: tc.repo}
			session, err := svc.CreateSession(context.Background(), "user@example.com", "password")

			if tc.wantErr {
				if err == nil {
					t.Fatal("expected an error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if session.AccessToken != tc.wantAccessTok {
				t.Fatalf("expected access token %q, got %q", tc.wantAccessTok, session.AccessToken)
			}
			if session.User.Email != tc.wantEmail {
				t.Fatalf("expected user email %q, got %q", tc.wantEmail, session.User.Email)
			}
		})
	}
}

func TestAuthServiceGetUser(t *testing.T) {
	cases := []struct {
		name      string
		repo      *fakeAuthRepo
		wantErr   bool
		wantEmail string
	}{
		{
			name:      "maps the repository user to a user response",
			repo:      &fakeAuthRepo{user: &types.User{Email: "user@example.com"}},
			wantEmail: "user@example.com",
		},
		{
			name:    "propagates a repository error",
			repo:    &fakeAuthRepo{err: errors.New("invalid token")},
			wantErr: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			svc := &services.AuthService{Repo: tc.repo}
			user, err := svc.GetUser(context.Background(), "test-token")

			if tc.wantErr {
				if err == nil {
					t.Fatal("expected an error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if user.Email != tc.wantEmail {
				t.Fatalf("expected email %q, got %q", tc.wantEmail, user.Email)
			}
		})
	}
}
