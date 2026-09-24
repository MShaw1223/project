package tests

import (
	"errors"
	"fmt"
	"testing"

	"github.com/miller/project/backend/repositories"
)

func TestIsEmailNotConfirmedError(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want bool
	}{
		{"current gotrue error code", errors.New(`response status code 400: {"code":400,"error_code":"email_not_confirmed","msg":"Email not confirmed"}`), true},
		{"older gotrue message", errors.New(`response status code 400: {"error":"invalid_grant","error_description":"Email not confirmed"}`), true},
		{"wrapped", fmt.Errorf("failed to login user: %w", errors.New(`{"error_code":"email_not_confirmed"}`)), true},
		{"wrong password", errors.New(`response status code 400: {"code":400,"error_code":"invalid_credentials","msg":"Invalid login credentials"}`), false},
		{"network failure", errors.New("dial tcp: connection refused"), false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := repositories.IsEmailNotConfirmedError(tc.err); got != tc.want {
				t.Fatalf("expected %v, got %v", tc.want, got)
			}
		})
	}
}

func TestIsInvalidCredentialsError(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want bool
	}{
		{"current gotrue error code", errors.New(`response status code 400: {"code":400,"error_code":"invalid_credentials","msg":"Invalid login credentials"}`), true},
		{"older gotrue message", errors.New(`response status code 400: {"error":"invalid_grant","error_description":"Invalid login credentials"}`), true},
		{"email not confirmed", errors.New(`response status code 400: {"error_code":"email_not_confirmed","msg":"Email not confirmed"}`), false},
		{"network failure", errors.New("dial tcp: connection refused"), false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := repositories.IsInvalidCredentialsError(tc.err); got != tc.want {
				t.Fatalf("expected %v, got %v", tc.want, got)
			}
		})
	}
}
