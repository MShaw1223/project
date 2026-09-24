package services

import (
	"context"
	"net/mail"
	"strings"

	"github.com/miller/project/backend/models"
	"github.com/supabase-community/gotrue-go/types"
)

// authRepo is the dependency AuthService needs, so tests can inject a fake
// repository instead of a real Supabase-backed one.
type authRepo interface {
	CreateSession(ctx context.Context, email, password string) (*types.Session, error)
	Signup(ctx context.Context, email, password string) (*types.User, error)
	GetUser(ctx context.Context, authToken string) (*types.User, error)
	ResendConfirmation(ctx context.Context, email string) error
}

const (
	MinPasswordLength = 6
	MaxPasswordLength = 72
	MaxEmailLength    = 254
)

type AuthService struct {
	Repo authRepo
}

func (s *AuthService) CreateSession(ctx context.Context, email, password string) (models.SessionResponse, error) {
	session, err := s.Repo.CreateSession(ctx, email, password)
	if err != nil {
		return models.SessionResponse{}, err
	}
	return toSessionResponse(*session), nil
}

func (s *AuthService) Signup(ctx context.Context, email, password string) (models.SignupResponse, error) {
	email, ok := normalizeEmail(email)
	if !ok {
		return models.SignupResponse{}, ErrInvalidInput
	}
	if len(password) < MinPasswordLength || len(password) > MaxPasswordLength {
		return models.SignupResponse{}, ErrInvalidInput
	}

	user, err := s.Repo.Signup(ctx, email, password)
	if err != nil {
		return models.SignupResponse{}, err
	}
	// with email confirmation on, Supabase creates the user unconfirmed and emails them a link
	return models.SignupResponse{
		User:                      toUserResponse(*user),
		EmailConfirmationRequired: user.EmailConfirmedAt == nil,
	}, nil
}

// ResendConfirmation emails a new sign-up confirmation link to an address that hasn't confirmed yet.
func (s *AuthService) ResendConfirmation(ctx context.Context, email string) error {
	email, ok := normalizeEmail(email)
	if !ok {
		return ErrInvalidInput
	}
	return s.Repo.ResendConfirmation(ctx, email)
}

// normalizeEmail trims an address and reports whether it's a plain, reasonably sized email address.
func normalizeEmail(email string) (string, bool) {
	email = strings.TrimSpace(email)
	addr, err := mail.ParseAddress(email)
	if err != nil || addr.Address != email || len(email) > MaxEmailLength {
		return "", false
	}
	return email, true
}

func (s *AuthService) GetUser(ctx context.Context, authToken string) (models.UserResponse, error) {
	user, err := s.Repo.GetUser(ctx, authToken)
	if err != nil {
		return models.UserResponse{}, err
	}
	return toUserResponse(*user), nil
}

func toUserResponse(u types.User) models.UserResponse {
	return models.UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
	}
}

func toSessionResponse(s types.Session) models.SessionResponse {
	return models.SessionResponse{
		AccessToken:  s.AccessToken,
		RefreshToken: s.RefreshToken,
		TokenType:    s.TokenType,
		ExpiresIn:    s.ExpiresIn,
		ExpiresAt:    s.ExpiresAt,
		User:         toUserResponse(s.User),
	}
}
