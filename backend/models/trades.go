package models

import (
	"time"

	"github.com/google/uuid"
)

type Trade struct {
	ID           uuid.UUID `json:"id" db:"id"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	AccountID    uuid.UUID `json:"account_id" db:"account_id"`
	CurrencyPair string    `json:"currency_pair" db:"currency_pair"`
	// Direction is "long" or "short", empty on trades logged before direction was recorded.
	Direction  string   `json:"direction" db:"direction"`
	EntryPrice float64  `json:"entry_price" db:"entry_price"`
	ExitPrice  *float64 `json:"exit_price" db:"exit_price"`
	StopLoss   *float64 `json:"stop_loss" db:"stop_loss"`
	// RMultiple is the realised result in units of risk, only known when a stop loss was given.
	RMultiple *float64 `json:"r_multiple" db:"r_multiple"`
	// TakeProfit and RiskRatio are the planned targets from the old entry form, kept for older trades.
	TakeProfit *float64 `json:"take_profit" db:"take_profit"`
	RiskRatio  *float64 `json:"risk_ratio" db:"risk_ratio"`
	Notes      string   `json:"notes" db:"notes"`
	Outcome    string   `json:"outcome" db:"outcome"`
}

func (Trade) TableName() string { return "trade" }

// TradeRequest is the body for logging a new trade, the database derives the outcome and R multiple.
type TradeRequest struct {
	AccountID    string   `json:"account_id"`
	CurrencyPair string   `json:"currency_pair"`
	Direction    string   `json:"direction"`
	EntryPrice   float64  `json:"entry_price"`
	ExitPrice    float64  `json:"exit_price"`
	StopLoss     *float64 `json:"stop_loss"`
	Notes        string   `json:"notes"`
}

// TradeRecord is a validated trade ready to be stored. The database derives its outcome and R multiple
// on insert (trade_derive_result in migrations/0005_enforce_write_rules.sql).
type TradeRecord struct {
	AccountID    string
	CurrencyPair string
	Direction    string
	EntryPrice   float64
	ExitPrice    float64
	StopLoss     *float64
	Notes        string
}
