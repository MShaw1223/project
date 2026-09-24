package models

// UpdatePasswordRequest is the body for a user changing their own password.
type UpdatePasswordRequest struct {
	Password string `json:"password"`
}

// Profile is the caller's own app profile, username is nil until they choose one.
type Profile struct {
	Username *string `json:"username"`
}

// UpdateUsernameRequest is the body for a user setting or changing their username.
type UpdateUsernameRequest struct {
	Username string `json:"username"`
}
