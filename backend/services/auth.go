package services

import (
	"github.com/miller/project/backend/repositories"
	"github.com/supabase-community/gotrue-go/types"
)

type AuthService struct {
	Repo *repositories.AuthRepository
}

func (s *AuthService) CreateSession(email, password string) (*types.Session, error) {
	return s.Repo.CreateSession(email, password)
}

func (s *AuthService) GetUser(authToken string) (*types.User, error) {
	return s.Repo.GetUser(authToken)
}