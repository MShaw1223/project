package models

import (
	"time"

	"github.com/google/uuid"
)

type BrokerageAccount struct {
	ID        uuid.UUID `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	Name      string    `json:"name" db:"name"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
}

func (BrokerageAccount) TableName() string { return "brokerage_account" }

