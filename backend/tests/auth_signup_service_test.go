package tests

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/supabase-community/gotrue-go/types"

	"github.com/miller/project/backend/services"
)

func TestAuthServiceSignupRejectsInvalidCredentialsBeforeTheRepository(t *testing.T) {
	cases := map[string][2]string{
		"empty email":       {"", "secret123"},
		"not an email":      {"someone", "secret123"},
		"display name":      {"Some One <a@b.co>", "secret123"},
		"overlong email":    {strings.Repeat("a", 250) + "@b.co", "secret123"},
		"short password":    {"a@b.co", "12345"},
		"empty password":    {"a@b.co", ""},
		"overlong password": {"a@b.co", strings.Repeat("x", 73)},
	}
	for name, creds := range cases {
		t.Run(name, func(t *testing.T) {
			repo := &fakeAuthRepo{user: &types.User{}}
			svc := &services.AuthService{Repo: repo}

			_, err := svc.Signup(context.Background(), creds[0], creds[1])

			if !errors.Is(err, services.ErrInvalidInput) {
				t.Fatalf("expected ErrInvalidInput, got %v", err)
			}
			if repo.signupCalls != 0 {
				t.Fatalf("invalid sign ups must be rejected before Supabase, got %d calls", repo.signupCalls)
			}
		})
	}
}

func TestAuthServiceSignupTrimsEmailAndMapsUser(t *testing.T) {
	repo := &fakeAuthRepo{user: &types.User{Email: "trader@example.com"}}
	svc := &services.AuthService{Repo: repo}

	signup, err := svc.Signup(context.Background(), "  trader@example.com ", "secret123")

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotEmail != "trader@example.com" || repo.gotPassword != "secret123" {
		t.Fatalf("expected the trimmed email to reach the repository, got %q %q", repo.gotEmail, repo.gotPassword)
	}
	if signup.User.Email != "trader@example.com" {
		t.Fatalf("expected the mapped user, got %+v", signup)
	}
}

func TestAuthServiceSignupPropagatesRepositoryError(t *testing.T) {
	svc := &services.AuthService{Repo: &fakeAuthRepo{err: errors.New("supabase down")}}
	if _, err := svc.Signup(context.Background(), "a@b.co", "secret123"); err == nil {
		t.Fatal("expected an error, got nil")
	}
}

func TestAuthServiceSignupRequiresConfirmationForAnUnconfirmedUser(t *testing.T) {
	svc := &services.AuthService{Repo: &fakeAuthRepo{user: &types.User{Email: "trader@example.com"}}}

	signup, err := svc.Signup(context.Background(), "trader@example.com", "secret123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !signup.EmailConfirmationRequired {
		t.Fatal("expected email confirmation to be required when Supabase hasn't confirmed the email")
	}
}

func TestAuthServiceSignupSkipsConfirmationForAnAutoConfirmedUser(t *testing.T) {
	confirmed := time.Now()
	svc := &services.AuthService{Repo: &fakeAuthRepo{user: &types.User{Email: "trader@example.com", EmailConfirmedAt: &confirmed}}}

	signup, err := svc.Signup(context.Background(), "trader@example.com", "secret123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if signup.EmailConfirmationRequired {
		t.Fatal("expected no confirmation step when Supabase auto-confirmed the email")
	}
}

func TestAuthServiceResendConfirmationRejectsInvalidEmailsBeforeTheRepository(t *testing.T) {
	for _, email := range []string{"", "someone", "Some One <a@b.co>"} {
		repo := &fakeAuthRepo{}
		svc := &services.AuthService{Repo: repo}

		if err := svc.ResendConfirmation(context.Background(), email); !errors.Is(err, services.ErrInvalidInput) {
			t.Errorf("%q: expected ErrInvalidInput, got %v", email, err)
		}
		if repo.resendCalls != 0 {
			t.Errorf("%q: invalid emails must be rejected before Supabase", email)
		}
	}
}

func TestAuthServiceResendConfirmationTrimsAndForwards(t *testing.T) {
	repo := &fakeAuthRepo{}
	svc := &services.AuthService{Repo: repo}

	if err := svc.ResendConfirmation(context.Background(), "  trader@example.com "); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.gotEmail != "trader@example.com" {
		t.Fatalf("expected the trimmed email to reach the repository, got %q", repo.gotEmail)
	}
}
