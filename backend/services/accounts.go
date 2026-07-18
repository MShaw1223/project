package services

import (
	"github.com/miller/project/backend/models"
	"github.com/miller/project/backend/repositories"
)

type AccountsService struct {
	Repo *repositories.AccountsRepository
}

func (s *AccountsService) GetUserAccounts(token string) (*[]models.BrokerageAccount, error) {
	return s.Repo.GetUserAccounts(token)
}

func (s *AccountsService) GetAccountByID(token, accountID string) (*models.BrokerageAccount, error) {
	return s.Repo.GetAccountByID(token, accountID)
}