package repositories

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

// resolveSupabaseAPI returns the base URL (SUPABASE_URL + suffix, eg "/auth/v1"), API key and HTTP
// client for calls made with net/http rather than the Supabase client libraries. Non-empty overrides
// win, which is how tests point these calls at a fake server.
func resolveSupabaseAPI(baseOverride, keyOverride string, client *http.Client, suffix string) (string, string, *http.Client, error) {
	base, key := baseOverride, keyOverride
	if base == "" {
		if url := strings.TrimRight(os.Getenv("SUPABASE_URL"), "/"); url != "" {
			base = url + suffix
		}
	}
	if key == "" {
		key = os.Getenv("SUPABASE_KEY")
	}
	if base == "" || key == "" {
		return "", "", nil, fmt.Errorf("supabase unavailable; set SUPABASE_URL and SUPABASE_KEY")
	}
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}
	return base, key, client, nil
}
