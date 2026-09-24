package models

import (
	"time"

	"github.com/google/uuid"
)

type CurrencyPair struct {
	ID        uuid.UUID `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Symbol    string    `json:"symbol" db:"symbol"`
}

func (CurrencyPair) TableName() string { return "currency_pair" }

// CurrencyPairRequest is the body for adding a symbol to the caller's currency pair list.
type CurrencyPairRequest struct {
	Symbol string `json:"symbol"`
}
