package services

import (
	"context"
	"regexp"
	"strings"

	"github.com/miller/project/backend/models"
)

// usernamePattern mirrors the profile.username check constraint (migrations/0003_profile_username.sql).
var usernamePattern = regexp.MustCompile(`^[A-Za-z0-9_]{3,20}$`)

// profileRepo is the dependency ProfileService needs, so tests can inject a fake repository
// instead of a real Supabase-backed one.
type profileRepo interface {
	UpdatePassword(ctx context.Context, token, newPassword string) error
	DeleteAccount(ctx context.Context, token string) error
	GetProfile(ctx context.Context, token string) (models.Profile, error)
	UpdateUsername(ctx context.Context, token, username string) (models.Profile, error)
}

type ProfileService struct {
	Repo profileRepo
}

func (s *ProfileService) UpdatePassword(ctx context.Context, token, password string) error {
	if len(password) < MinPasswordLength || len(password) > MaxPasswordLength {
		return ErrInvalidInput
	}
	return s.Repo.UpdatePassword(ctx, token, password)
}

// DeleteAccount permanently deletes the caller's account and everything they own.
func (s *ProfileService) DeleteAccount(ctx context.Context, token string) error {
	return s.Repo.DeleteAccount(ctx, token)
}

func (s *ProfileService) GetProfile(ctx context.Context, token string) (models.Profile, error) {
	return s.Repo.GetProfile(ctx, token)
}

// UpdateUsername trims and validates a username (3-20 letters, digits or underscores) before
// storing it. Uniqueness is case-insensitive and enforced by the database.
func (s *ProfileService) UpdateUsername(ctx context.Context, token, username string) (models.Profile, error) {
	username = strings.TrimSpace(username)
	if !usernamePattern.MatchString(username) {
		return models.Profile{}, ErrInvalidInput
	}
	return s.Repo.UpdateUsername(ctx, token, username)
}
