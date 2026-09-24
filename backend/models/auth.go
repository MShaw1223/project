package models

import (
	"time"

	"github.com/google/uuid"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UserResponse is the subset of a Supabase auth user that's safe to return
// to a client — it deliberately omits phone, identities, app_metadata,
// user_metadata, and confirmation/update timestamps.
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// SessionResponse is the subset of a Supabase auth session returned on
// login, with its embedded user trimmed down to UserResponse.
type SessionResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	TokenType    string       `json:"token_type"`
	ExpiresIn    int          `json:"expires_in"`
	ExpiresAt    int64        `json:"expires_at"`
	User         UserResponse `json:"user"`
}

// SignupResponse is the new user plus whether Supabase is waiting on them to confirm their email
// (true when the project requires email confirmation, so no session can start until they click the link).
type SignupResponse struct {
	User                      UserResponse `json:"user"`
	EmailConfirmationRequired bool         `json:"email_confirmation_required"`
}

// ResendConfirmationRequest is the body for asking for a new sign-up confirmation email.
type ResendConfirmationRequest struct {
	Email string `json:"email"`
}

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
