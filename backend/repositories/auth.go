package repositories

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/supabase-community/gotrue-go/types"
)

// ErrSignupRejected means Supabase refused the sign up (for example a weak password or an address
// that cannot be registered), as opposed to Supabase being unreachable or misconfigured.
var (
	ErrSignupRejected = errors.New("sign up rejected")
	// ErrEmailNotConfirmed means the credentials were accepted but the user hasn't confirmed their email.
	ErrEmailNotConfirmed = errors.New("email not confirmed")
	// ErrInvalidCredentials means Supabase didn't recognise the email and password combination.
	ErrInvalidCredentials = errors.New("invalid credentials")
	// ErrRateLimited means Supabase refused because too many requests or emails were sent recently.
	ErrRateLimited = errors.New("rate limited")
)

type AuthRepository struct {
	Provider supabaseClientProvider

	// AuthURL, APIKey and HTTPClient are for the auth calls gotrue-go doesn't wrap (resending the
	// confirmation email). Empty values fall back to SUPABASE_URL/auth/v1, SUPABASE_KEY and a client
	// with a timeout; tests point them at a fake server.
	AuthURL    string
	APIKey     string
	HTTPClient *http.Client
}

func (r *AuthRepository) CreateSession(ctx context.Context, email, password string) (*types.Session, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		log.Printf("Supabase client not available: %v", err)
		return nil, fmt.Errorf("supabase client unavailable; set SUPABASE_URL and SUPABASE_KEY: %w", err)
	}

	session, err := client.SignInWithEmailPassword(email, password)
	if err != nil {
		log.Printf("Failed to login user: %v", err)
		if IsEmailNotConfirmedError(err) {
			return nil, fmt.Errorf("%w: %v", ErrEmailNotConfirmed, err)
		}
		if IsInvalidCredentialsError(err) {
			return nil, fmt.Errorf("%w: %v", ErrInvalidCredentials, err)
		}
		return nil, fmt.Errorf("failed to login user: %w", err)
	}

	log.Printf("User logged in successfully: %v", session.User.ID)
	return &session, nil
}

func (r *AuthRepository) Signup(ctx context.Context, email, password string) (*types.User, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		log.Printf("Supabase client not available: %v", err)
		return nil, fmt.Errorf("supabase client unavailable; set SUPABASE_URL and SUPABASE_KEY: %w", err)
	}

	resp, err := client.Auth.Signup(types.SignupRequest{Email: email, Password: password})
	if err != nil {
		log.Printf("Failed to sign up user: %v", err)
		return nil, fmt.Errorf("%w: %v", ErrSignupRejected, err)
	}

	// with autoconfirm off the user is at the top level, with it on the session carries the user
	if resp.User.ID != uuid.Nil {
		return &resp.User, nil
	}
	return &resp.Session.User, nil
}

func (r *AuthRepository) GetUser(ctx context.Context, authToken string) (*types.User, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		log.Printf("Supabase client not available: %v", err)
		return nil, fmt.Errorf("supabase client unavailable; set SUPABASE_URL and SUPABASE_KEY: %w", err)
	}

	user, err := client.Auth.WithToken(authToken).GetUser()
	if err != nil {
		log.Printf("Failed to get user: %v", err)
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	log.Printf("User retrieved successfully: %v", user.User.ID)
	return &user.User, nil
}

// IsEmailNotConfirmedError reports whether a gotrue sign-in error is Supabase refusing an unconfirmed
// email. gotrue-go flattens the response to "response status code 400: <body>", so it's matched on the
// body: newer Supabase sends error_code "email_not_confirmed", older versions only the message.
func IsEmailNotConfirmedError(err error) bool {
	msg := err.Error()
	return strings.Contains(msg, "email_not_confirmed") || strings.Contains(msg, "Email not confirmed")
}

// IsInvalidCredentialsError reports whether a gotrue sign-in error is Supabase rejecting the email and
// password combination, matched on the flattened body like IsEmailNotConfirmedError.
func IsInvalidCredentialsError(err error) bool {
	msg := err.Error()
	return strings.Contains(msg, "invalid_credentials") || strings.Contains(msg, "Invalid login credentials")
}

// postAuth POSTs a JSON body to the Supabase auth API, returning the response for the caller to read
// and close.
func (r *AuthRepository) postAuth(ctx context.Context, path string, payload any) (*http.Response, error) {
	authURL, apiKey, httpClient, err := resolveSupabaseAPI(r.AuthURL, r.APIKey, r.HTTPClient, "/auth/v1")
	if err != nil {
		return nil, err
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode %s request: %w", path, err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, authURL+path, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build %s request: %w", path, err)
	}
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Content-Type", "application/json")
	return httpClient.Do(req)
}

// ResendConfirmation asks Supabase to email a new sign-up confirmation link. Supabase answers the same
// way whether or not the address has an unconfirmed account, so this never reveals who has signed up.
func (r *AuthRepository) ResendConfirmation(ctx context.Context, email string) error {
	resp, err := r.postAuth(ctx, "/resend", map[string]string{"type": "signup", "email": email})
	if err != nil {
		return fmt.Errorf("failed to resend confirmation email: %w", err)
	}
	defer resp.Body.Close()

	switch {
	case resp.StatusCode == http.StatusTooManyRequests:
		return ErrRateLimited
	case resp.StatusCode < 200 || resp.StatusCode >= 300:
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("failed to resend confirmation email: status %d: %s", resp.StatusCode, detail)
	}
	return nil
}
