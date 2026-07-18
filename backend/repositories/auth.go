package repositories

import (
	"fmt"
	"log"

	"github.com/supabase-community/gotrue-go/types"
)

type AuthRepository struct {
	Provider *SupabaseProvider
}

func (r *AuthRepository) CreateSession(email, password string) (*types.Session, error) {
	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		log.Printf("Supabase client not available: %v", err)
		return nil, fmt.Errorf("supabase client unavailable; set SUPABASE_URL and SUPABASE_KEY")
	}
	
	user, err := client.SignInWithEmailPassword(email, password)

	if err != nil {
		log.Printf("Failed to login user: %v", err)
		return nil, err
	}

	log.Printf("User logged in successfully: %v", user)
	return &user, nil
}

func (r *AuthRepository) GetUser(authToken string) (*types.User, error) {
	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		log.Printf("Supabase client not available: %v", err)
		return nil, fmt.Errorf("supabase client unavailable; set SUPABASE_URL and SUPABASE_KEY")
	}

	user, err := client.Auth.WithToken(authToken).GetUser()
	if err != nil {
		log.Printf("Failed to get user: %v", err)
		return nil, err
	}
	log.Printf("User retrieved successfully: %v", user)
	return &user.User, nil
}
