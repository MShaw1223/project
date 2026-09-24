package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

func main() {
	addr := ":8080"
	log.Printf("starting server on %s", addr)
	router := gin.Default()
	// ClientIP (used for rate limiting) only honours X-Forwarded-For from proxies listed here. The
	// Next.js rewrite passes a client-supplied X-Forwarded-For straight through, so it isn't trusted
	// by default; set TRUSTED_PROXIES (comma-separated IPs/CIDRs) for a proxy that overwrites the header.
	proxies := trustedProxies()
	if err := router.SetTrustedProxies(proxies); err != nil {
		log.Fatalf("invalid TRUSTED_PROXIES: %v", err)
	}
	// refuse cross-site state changes (CSRF), including login CSRF which SameSite cookies don't cover
	router.Use(handlers.RequireSameOrigin(appOrigins()))
	baseProvider := &repositories.SupabaseProvider{}

	healthHandler := &handlers.HealthHandler{}
	router.GET("/health", healthHandler.Handle)

	handlerProvider := &handlers.HandlerProvider{}

	profileRepository := &repositories.ProfileRepository{Provider: baseProvider}
	profileService := &services.ProfileService{Repo: profileRepository}
	profileHandler := &handlers.ProfileHandler{Service: profileService, Provider: handlerProvider}
	router.PUT("/profile/password", profileHandler.UpdatePassword)
	router.DELETE("/profile", profileHandler.DeleteAccount)
	router.GET("/profile", profileHandler.GetProfile)
	router.PUT("/profile/username", profileHandler.UpdateUsername)

	authRepository := &repositories.AuthRepository{Provider: baseProvider}
	authService := &services.AuthService{Repo: authRepository}
	authHandler := &handlers.AuthHandler{
		Service:  authService,
		Provider: handlerProvider,
		// per email address always, so guessing one account's password is slow wherever it comes from
		LoginLimiter: &handlers.RateLimiter{Limit: 10, Window: 15 * time.Minute},
	}
	loginMiddleware := []gin.HandlerFunc{}
	if len(proxies) > 0 {
		// per client IP only behind a proxy that reports real client IPs: without one every request
		// shares the proxy's address and this would be a single budget anyone could use up
		loginMiddleware = append(loginMiddleware, handlers.RateLimitByClientIP(&handlers.RateLimiter{Limit: 30, Window: 15 * time.Minute}))
	}
	router.POST("/auth/login", append(loginMiddleware, authHandler.CreateSession)...)
	router.POST("/auth/signup", authHandler.Signup)
	// every resend sends an email from the project's quota, so cap it per client on top of Supabase's
	// own per-address limit
	resendLimiter := &handlers.RateLimiter{Limit: 5, Window: 15 * time.Minute}
	router.POST("/auth/resend", handlers.RateLimitByClientIP(resendLimiter), authHandler.ResendConfirmation)
	router.POST("/auth/logout", authHandler.DeleteSession)
	router.GET("/auth/user", authHandler.GetUser)

	accountsRepository := &repositories.AccountsRepository{Provider: baseProvider}
	accountsService := &services.AccountsService{Repo: accountsRepository}
	accountsHandler := &handlers.AccountsHandler{Service: accountsService, Provider: handlerProvider}
	router.GET("/accounts", accountsHandler.GetUserAccounts)
	router.POST("/accounts", accountsHandler.CreateAccount)
	router.PUT("/accounts/:id", accountsHandler.UpdateAccount)
	router.DELETE("/accounts/:id", accountsHandler.DeleteAccount)

	tradesRepository := &repositories.TradesRepository{Provider: baseProvider}
	tradesService := &services.TradesService{Repo: tradesRepository}
	tradesHandler := &handlers.TradesHandler{Service: tradesService, Provider: handlerProvider}
	router.GET("/trades", tradesHandler.GetUserTrades)
	router.POST("/trades", tradesHandler.CreateTrade)
	router.DELETE("/trades/:id", tradesHandler.DeleteTrade)

	currencyPairsRepository := &repositories.CurrencyPairsRepository{Provider: baseProvider}
	currencyPairsService := &services.CurrencyPairsService{Repo: currencyPairsRepository}
	currencyPairsHandler := &handlers.CurrencyPairsHandler{Service: currencyPairsService, Provider: handlerProvider}
	router.GET("/currency-pairs", currencyPairsHandler.GetUserPairs)
	router.POST("/currency-pairs", currencyPairsHandler.CreatePair)
	router.DELETE("/currency-pairs/:id", currencyPairsHandler.DeletePair)

	if err := router.Run(addr); err != nil {
		log.Fatalf("server failed: %v", err)
	}

	fmt.Println("server stopped")
}

// trustedProxies parses TRUSTED_PROXIES, nil (trust none) when it's unset.
func trustedProxies() []string {
	var proxies []string
	for _, proxy := range strings.Split(os.Getenv("TRUSTED_PROXIES"), ",") {
		if proxy = strings.TrimSpace(proxy); proxy != "" {
			proxies = append(proxies, proxy)
		}
	}
	return proxies
}

// appOrigins parses APP_ORIGINS (comma-separated, eg "https://fxtrax.app"), the origins allowed to
// make state-changing requests. Defaults to the local Next.js dev server.
func appOrigins() []string {
	var origins []string
	for _, origin := range strings.Split(os.Getenv("APP_ORIGINS"), ",") {
		if origin = strings.TrimSpace(origin); origin != "" {
			origins = append(origins, origin)
		}
	}
	if len(origins) == 0 {
		return []string{"http://localhost:3000"}
	}
	return origins
}
