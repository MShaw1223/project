package repositories

import (
	"encoding/json"
	"fmt"

	"github.com/miller/project/backend/models"
)

type AccountsRepository struct {
	Provider *SupabaseProvider
}

func (r *AccountsRepository) GetUserAccounts(token string) (*[]models.BrokerageAccount, error) {
	client, err := r.Provider.NewSupabaseClient()
	if err != nil {
		return nil, fmt.Errorf("supabase client not available: %v", err)
	}
	user, err := client.Auth.WithToken(token).GetUser()
	if err != nil {
		return nil, fmt.Errorf("user not authenticated")
	}

	response, _, err := client.From("brokerage_account").Select("*", "exact", false).Eq("user_id", user.ID.String()).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user accounts")
	}


	var accounts []models.BrokerageAccount
	err = json.Unmarshal(response, &accounts)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	return &accounts, nil
}

func (r *AccountsRepository) GetAccountByID(token, accountID string) (*models.BrokerageAccount, error) {
	if r.Provider == nil {
		return nil, fmt.Errorf("supabase provider unavailable; set SUPABASE_URL and SUPABASE_KEY")
	}
	return nil, nil
}

